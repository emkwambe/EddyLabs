-- StorySprout Database Schema
-- A mobile-first digital reading platform for children (ages 2-10)

-- =====================================================
-- ENUMS
-- =====================================================

-- Age bands for developmental alignment
CREATE TYPE age_band AS ENUM (
  'pre_k',      -- 2-3 years
  'k_prep',     -- 4-5 years
  'grade_1',    -- 6-7 years
  'grade_2',    -- 7-8 years
  'grade_3',    -- 8-9 years
  'grade_4'     -- 9-10 years
);

-- Reading modes supported
CREATE TYPE reading_mode AS ENUM (
  'read_to_me',   -- Full narration
  'read_with_me', -- Highlighted text with optional narration
  'read_alone'    -- Distraction-free reading
);

-- Story categories
CREATE TYPE story_category AS ENUM (
  'bedtime',
  'seasonal',
  'cultural',
  'curriculum',
  'emotional_social',
  'school',
  'family',
  'adventure'
);

-- Illustration styles
CREATE TYPE illustration_style AS ENUM (
  'soft_flat',
  'watercolor',
  'line_art',
  'collage',
  'photographic'
);

-- =====================================================
-- CHILD PROFILES
-- =====================================================

CREATE TABLE child_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  birth_date DATE,
  age_band age_band NOT NULL,
  reading_level TEXT, -- e.g., "A", "B", "C" or Lexile range
  preferred_reading_mode reading_mode DEFAULT 'read_with_me',
  bedtime_mode_enabled BOOLEAN DEFAULT false,
  bedtime_start TIME DEFAULT '19:00',
  bedtime_end TIME DEFAULT '07:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by parent
CREATE INDEX idx_child_profiles_parent ON child_profiles(parent_user_id);

-- =====================================================
-- STORIES
-- =====================================================

CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_code TEXT UNIQUE NOT NULL, -- e.g., "SS-K-012"
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT,
  illustrator TEXT,

  -- Age and reading alignment
  age_band age_band NOT NULL,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  reading_level_system TEXT DEFAULT 'guided', -- 'guided', 'lexile', 'dra'
  reading_level TEXT NOT NULL, -- e.g., "A", "B", "450L"

  -- Content metadata
  category story_category NOT NULL,
  themes TEXT[] NOT NULL DEFAULT '{}',
  emotional_focus TEXT[] DEFAULT '{}',

  -- Sight words for this story
  sight_words TEXT[] DEFAULT '{}',
  vocabulary_tier INTEGER DEFAULT 1, -- 1, 2, or 3

  -- Reading info
  estimated_read_time_minutes INTEGER DEFAULT 5,
  page_count INTEGER NOT NULL,
  modes_supported reading_mode[] DEFAULT ARRAY['read_to_me', 'read_with_me', 'read_alone']::reading_mode[],

  -- Visual style
  illustration_style illustration_style DEFAULT 'soft_flat',
  cover_image_url TEXT,
  thumbnail_url TEXT,

  -- Curriculum alignment
  curriculum_alignment TEXT[] DEFAULT '{}',
  learning_objectives TEXT[] DEFAULT '{}',

  -- Seasonal/special tags
  seasonal_tag TEXT, -- e.g., 'winter', 'spring', 'back_to_school'
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,

  -- Story path grouping
  story_path_id UUID,
  sequence_in_path INTEGER,

  -- Audio
  narration_audio_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_stories_age_band ON stories(age_band);
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_featured ON stories(is_featured) WHERE is_featured = true;
CREATE INDEX idx_stories_path ON stories(story_path_id);

-- =====================================================
-- STORY PAGES (Content)
-- =====================================================

CREATE TABLE story_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,

  -- Content
  text_content TEXT NOT NULL,
  illustration_url TEXT,
  illustration_alt_text TEXT,

  -- Audio for this page
  audio_url TEXT,
  audio_duration_seconds INTEGER,

  -- Word highlighting data (for read-with-me mode)
  word_timings JSONB, -- [{word: "The", start: 0.0, end: 0.3}, ...]

  -- Sight words on this page (positions)
  sight_word_positions JSONB, -- [{word: "the", index: 0}, {word: "is", index: 4}]

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(story_id, page_number)
);

CREATE INDEX idx_story_pages_story ON story_pages(story_id);

-- =====================================================
-- STORY PATHS (Learning Journeys)
-- =====================================================

CREATE TABLE story_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  age_band age_band NOT NULL,

  -- Path type
  path_type TEXT NOT NULL, -- 'learning_to_read', 'school_stories', 'big_feelings', etc.

  -- Visual
  icon_url TEXT,
  cover_image_url TEXT,
  color_theme TEXT DEFAULT '#4F46E5', -- Primary color for path UI

  -- Progress tracking
  total_stories INTEGER DEFAULT 0,

  -- Order
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_story_paths_age ON story_paths(age_band);

-- Update stories foreign key
ALTER TABLE stories
ADD CONSTRAINT fk_story_path
FOREIGN KEY (story_path_id) REFERENCES story_paths(id) ON DELETE SET NULL;

-- =====================================================
-- READING PROGRESS
-- =====================================================

CREATE TABLE reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_profile_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,

  -- Progress
  current_page INTEGER DEFAULT 1,
  total_pages INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Reading mode used
  reading_mode_used reading_mode,

  -- Time tracking
  total_reading_time_seconds INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),

  -- Re-read count (important for fluency)
  read_count INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(child_profile_id, story_id)
);

CREATE INDEX idx_reading_progress_child ON reading_progress(child_profile_id);
CREATE INDEX idx_reading_progress_story ON reading_progress(story_id);
CREATE INDEX idx_reading_progress_completed ON reading_progress(child_profile_id, is_completed);

-- =====================================================
-- SIGHT WORD EXPOSURES
-- =====================================================

CREATE TABLE sight_word_exposures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_profile_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,

  -- Tracking
  exposure_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  -- Mastery (optional future feature)
  is_mastered BOOLEAN DEFAULT false,
  mastered_at TIMESTAMPTZ,

  UNIQUE(child_profile_id, word)
);

CREATE INDEX idx_sight_words_child ON sight_word_exposures(child_profile_id);
CREATE INDEX idx_sight_words_word ON sight_word_exposures(word);

-- =====================================================
-- READING SESSIONS (Detailed tracking)
-- =====================================================

CREATE TABLE reading_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_profile_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,

  -- Session details
  reading_mode reading_mode NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Progress in this session
  start_page INTEGER DEFAULT 1,
  end_page INTEGER,
  pages_read INTEGER DEFAULT 0,

  -- Completion
  story_completed BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reading_sessions_child ON reading_sessions(child_profile_id);
CREATE INDEX idx_reading_sessions_date ON reading_sessions(started_at);

-- =====================================================
-- FAVORITES
-- =====================================================

CREATE TABLE story_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_profile_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(child_profile_id, story_id)
);

CREATE INDEX idx_favorites_child ON story_favorites(child_profile_id);

-- =====================================================
-- PARENT SETTINGS
-- =====================================================

CREATE TABLE parent_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Content filters
  allowed_age_bands age_band[] DEFAULT ARRAY['pre_k', 'k_prep', 'grade_1', 'grade_2', 'grade_3', 'grade_4']::age_band[],

  -- Time controls
  daily_reading_goal_minutes INTEGER DEFAULT 20,
  enable_bedtime_mode BOOLEAN DEFAULT true,

  -- Notifications
  enable_progress_notifications BOOLEAN DEFAULT true,
  weekly_summary_enabled BOOLEAN DEFAULT true,

  -- Audio
  default_narrator_voice TEXT DEFAULT 'friendly',
  narrator_speed DECIMAL DEFAULT 1.0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sight_word_exposures ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_settings ENABLE ROW LEVEL SECURITY;

-- Child Profiles: Parents can only manage their own children
CREATE POLICY "Parents can view their children" ON child_profiles
  FOR SELECT USING (parent_user_id = auth.uid());

CREATE POLICY "Parents can create child profiles" ON child_profiles
  FOR INSERT WITH CHECK (parent_user_id = auth.uid());

CREATE POLICY "Parents can update their children" ON child_profiles
  FOR UPDATE USING (parent_user_id = auth.uid());

CREATE POLICY "Parents can delete their children" ON child_profiles
  FOR DELETE USING (parent_user_id = auth.uid());

-- Stories: Everyone can read (public content)
CREATE POLICY "Anyone can view stories" ON stories
  FOR SELECT USING (true);

-- Story Pages: Everyone can read
CREATE POLICY "Anyone can view story pages" ON story_pages
  FOR SELECT USING (true);

-- Story Paths: Everyone can read
CREATE POLICY "Anyone can view story paths" ON story_paths
  FOR SELECT USING (true);

-- Reading Progress: Only for own children
CREATE POLICY "Parents can view children progress" ON reading_progress
  FOR SELECT USING (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create progress for children" ON reading_progress
  FOR INSERT WITH CHECK (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update children progress" ON reading_progress
  FOR UPDATE USING (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

-- Sight Word Exposures: Only for own children
CREATE POLICY "Parents can view sight words" ON sight_word_exposures
  FOR SELECT USING (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can manage sight words" ON sight_word_exposures
  FOR ALL USING (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

-- Reading Sessions: Only for own children
CREATE POLICY "Parents can view reading sessions" ON reading_sessions
  FOR SELECT USING (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create reading sessions" ON reading_sessions
  FOR INSERT WITH CHECK (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update reading sessions" ON reading_sessions
  FOR UPDATE USING (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

-- Favorites: Only for own children
CREATE POLICY "Parents can manage favorites" ON story_favorites
  FOR ALL USING (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

-- Parent Settings: Only own settings
CREATE POLICY "Users can view own settings" ON parent_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings" ON parent_settings
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_child_profiles_updated_at
  BEFORE UPDATE ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_progress_updated_at
  BEFORE UPDATE ON reading_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parent_settings_updated_at
  BEFORE UPDATE ON parent_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create parent settings on user signup
CREATE OR REPLACE FUNCTION handle_new_parent()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO parent_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Child reading summary
CREATE OR REPLACE VIEW child_reading_summary AS
SELECT
  cp.id AS child_id,
  cp.name AS child_name,
  cp.parent_user_id,
  COUNT(DISTINCT rp.story_id) FILTER (WHERE rp.is_completed) AS stories_completed,
  COUNT(DISTINCT rp.story_id) AS stories_started,
  COALESCE(SUM(rp.total_reading_time_seconds), 0) / 60 AS total_reading_minutes,
  COUNT(DISTINCT swe.word) AS sight_words_encountered,
  MAX(rp.last_read_at) AS last_reading_date
FROM child_profiles cp
LEFT JOIN reading_progress rp ON cp.id = rp.child_profile_id
LEFT JOIN sight_word_exposures swe ON cp.id = swe.child_profile_id
GROUP BY cp.id, cp.name, cp.parent_user_id;

-- Story with progress for a child
CREATE OR REPLACE VIEW story_with_child_progress AS
SELECT
  s.*,
  rp.child_profile_id,
  rp.current_page,
  rp.is_completed,
  rp.read_count,
  rp.total_reading_time_seconds,
  rp.last_read_at
FROM stories s
LEFT JOIN reading_progress rp ON s.id = rp.story_id;
