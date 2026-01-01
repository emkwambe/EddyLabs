-- StorySprout Story Generation Queue
-- This table manages AI-generated story content pipeline

-- =====================================================
-- GENERATION STATUS ENUM
-- =====================================================

CREATE TYPE generation_status AS ENUM (
  'pending',           -- Waiting to be processed
  'generating_text',   -- Claude/GPT is writing the story
  'generating_images', -- DALL-E is creating illustrations
  'complete',          -- Successfully finished
  'failed',            -- Error occurred
  'cancelled'          -- Manually cancelled
);

-- =====================================================
-- STORY GENERATION QUEUE TABLE
-- =====================================================

CREATE TABLE story_generation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Input parameters for story generation
  category story_category NOT NULL,
  age_band age_band NOT NULL,
  theme TEXT NOT NULL,
  emotional_focus TEXT[] DEFAULT '{}',
  sight_words TEXT[] DEFAULT '{}',
  page_count INTEGER DEFAULT 8 CHECK (page_count >= 4 AND page_count <= 20),
  character_name TEXT,
  character_description TEXT,

  -- Optional customization
  illustration_style illustration_style DEFAULT 'soft_flat',
  color_palette TEXT, -- e.g., "warm pastels", "bright primary"
  setting TEXT, -- e.g., "forest", "school", "home"

  -- Status tracking
  status generation_status DEFAULT 'pending',
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,

  -- Progress tracking
  current_step TEXT,
  pages_completed INTEGER DEFAULT 0,
  total_cost_cents INTEGER DEFAULT 0, -- Track API costs

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10), -- 1=highest

  -- n8n integration
  n8n_execution_id TEXT,
  webhook_callback_url TEXT
);

-- Indexes for common queries
CREATE INDEX idx_queue_status ON story_generation_queue(status);
CREATE INDEX idx_queue_priority ON story_generation_queue(priority, created_at);
CREATE INDEX idx_queue_created_by ON story_generation_queue(created_by);

-- =====================================================
-- GENERATION TEMPLATES TABLE
-- =====================================================

-- Pre-defined templates for quick story generation
CREATE TABLE story_generation_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,

  -- Default parameters
  category story_category NOT NULL,
  age_band age_band NOT NULL,
  theme_template TEXT NOT NULL, -- Can include {variables}
  emotional_focus TEXT[] DEFAULT '{}',
  sight_words TEXT[] DEFAULT '{}',
  page_count INTEGER DEFAULT 8,

  -- Visual defaults
  illustration_style illustration_style DEFAULT 'soft_flat',
  color_palette TEXT,

  -- Character templates
  character_options JSONB, -- Array of pre-defined characters

  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SAMPLE TEMPLATES
-- =====================================================

INSERT INTO story_generation_templates (name, description, category, age_band, theme_template, emotional_focus, sight_words, page_count, character_options) VALUES
(
  'Bedtime Bunny Adventures',
  'Calming bedtime stories featuring bunny characters',
  'bedtime',
  'pre_k',
  'A little bunny {action} before going to sleep',
  ARRAY['calm', 'love', 'patience'],
  ARRAY['the', 'is', 'my', 'go', 'to', 'sleep'],
  6,
  '[{"name": "Benny Bunny", "description": "A small gray bunny with floppy ears and a fluffy tail"}, {"name": "Bella Bunny", "description": "A white bunny with pink inner ears and a tiny pink nose"}]'::jsonb
),
(
  'School Day Stories',
  'Stories about common school experiences',
  'school',
  'k_prep',
  'A child learns about {lesson} at school',
  ARRAY['confidence', 'belonging', 'curiosity'],
  ARRAY['the', 'is', 'at', 'we', 'I', 'see', 'play'],
  8,
  '[{"name": "Sam", "description": "A cheerful child with curly brown hair and a bright smile"}, {"name": "Maya", "description": "A kind girl with black braids and sparkling eyes"}]'::jsonb
),
(
  'Big Feelings Journey',
  'Stories helping children understand emotions',
  'emotional_social',
  'grade_1',
  'Learning to handle {emotion} in a healthy way',
  ARRAY['self_regulation', 'empathy', 'resilience'],
  ARRAY['feel', 'when', 'can', 'help', 'friend', 'okay'],
  10,
  '[{"name": "Leo", "description": "A thoughtful boy with glasses and messy hair"}, {"name": "Zoe", "description": "An expressive girl with a ponytail who loves to dance"}]'::jsonb
),
(
  'Nature Explorers',
  'Adventure stories about discovering nature',
  'adventure',
  'grade_2',
  'Exploring {nature_element} and learning about {science_topic}',
  ARRAY['curiosity', 'confidence', 'joy'],
  ARRAY['found', 'look', 'because', 'different', 'learn', 'grow'],
  10,
  '[{"name": "River", "description": "An adventurous child with a explorer hat and binoculars"}, {"name": "Sage", "description": "A nature-loving kid with leaves in their pockets"}]'::jsonb
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE story_generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_generation_templates ENABLE ROW LEVEL SECURITY;

-- Queue: Only admins and the creator can see queue entries
CREATE POLICY "Users can view their own queue entries" ON story_generation_queue
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create queue entries" ON story_generation_queue
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Templates: Everyone can read templates
CREATE POLICY "Anyone can view templates" ON story_generation_templates
  FOR SELECT USING (is_active = true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get next story to process
CREATE OR REPLACE FUNCTION get_next_pending_story()
RETURNS story_generation_queue AS $$
DECLARE
  next_story story_generation_queue;
BEGIN
  SELECT * INTO next_story
  FROM story_generation_queue
  WHERE status = 'pending'
  ORDER BY priority ASC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF next_story.id IS NOT NULL THEN
    UPDATE story_generation_queue
    SET status = 'generating_text', started_at = NOW()
    WHERE id = next_story.id;
  END IF;

  RETURN next_story;
END;
$$ LANGUAGE plpgsql;

-- Function to mark story as failed
CREATE OR REPLACE FUNCTION mark_generation_failed(
  queue_id UUID,
  error_msg TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE story_generation_queue
  SET
    status = CASE
      WHEN retry_count < max_retries THEN 'pending'
      ELSE 'failed'
    END,
    error_message = error_msg,
    retry_count = retry_count + 1
  WHERE id = queue_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON story_generation_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
