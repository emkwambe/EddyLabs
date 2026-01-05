-- StorySprout Base Schema Migration
-- Creates the foundational tables for the StorySprout educational platform

-- =====================================================
-- ENUMS
-- =====================================================

-- Age bands (grades) - will be extended in expansion migration
CREATE TYPE age_band AS ENUM (
  'pre_k',
  'k_prep',
  'grade_1',
  'grade_2',
  'grade_3',
  'grade_4',
  'grade_5'
);

-- Story categories
CREATE TYPE story_category AS ENUM (
  'adventure',
  'animals',
  'bedtime',
  'educational',
  'family',
  'fantasy',
  'friendship',
  'holidays',
  'humor',
  'nature',
  'science',
  'social_emotional'
);

-- Story generation status
CREATE TYPE generation_status AS ENUM (
  'pending',
  'generating',
  'completed',
  'failed'
);

-- Content safety status
CREATE TYPE safety_status AS ENUM (
  'pending',
  'approved',
  'flagged',
  'rejected'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Parent/Guardian accounts
CREATE TABLE parent_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Child profiles (managed by parents)
CREATE TABLE child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_band age_band NOT NULL,
  birth_date DATE,
  avatar_url TEXT,
  reading_level TEXT DEFAULT 'beginner',
  interests TEXT[] DEFAULT '{}',
  accessibility_needs JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent settings and content controls
CREATE TABLE parent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  daily_reading_limit_minutes INTEGER DEFAULT 60,
  allowed_categories story_category[] DEFAULT ARRAY['adventure', 'animals', 'bedtime', 'educational', 'family', 'fantasy', 'friendship', 'holidays', 'humor', 'nature', 'science', 'social_emotional']::story_category[],
  allowed_age_bands age_band[] DEFAULT ARRAY['pre_k', 'k_prep', 'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5']::age_band[],
  content_filters JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  age_band age_band NOT NULL,
  category story_category NOT NULL,

  -- Reading metrics
  word_count INTEGER DEFAULT 0,
  estimated_reading_time_seconds INTEGER DEFAULT 0,
  reading_level_score FLOAT,

  -- Generation info
  generation_status generation_status DEFAULT 'pending',
  generation_prompt TEXT,
  ai_model TEXT,

  -- Content safety
  safety_status safety_status DEFAULT 'pending',
  safety_review_notes TEXT,

  -- Media
  cover_image_url TEXT,
  audio_url TEXT,
  audio_duration_seconds INTEGER,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,

  -- Personalization
  child_id UUID REFERENCES child_profiles(id) ON DELETE SET NULL,
  custom_character_name TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Story paths (for branching narratives)
CREATE TABLE story_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  parent_path_id UUID REFERENCES story_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  age_band age_band NOT NULL,
  sequence_order INTEGER DEFAULT 0,
  is_ending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading progress tracking
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  current_position INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(child_id, story_id)
);

-- Story favorites
CREATE TABLE story_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(child_id, story_id)
);

-- Reading achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  requirement_type TEXT NOT NULL, -- 'stories_read', 'time_read', 'streak', etc.
  requirement_value INTEGER NOT NULL,
  badge_color TEXT DEFAULT '#22c55e'
);

-- Child achievements earned
CREATE TABLE child_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(child_id, achievement_id)
);

-- Daily reading sessions
CREATE TABLE reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  words_read INTEGER DEFAULT 0
);

-- Content moderation log
CREATE TABLE moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  moderator_id UUID,
  action TEXT NOT NULL, -- 'approved', 'rejected', 'flagged'
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_child_profiles_parent ON child_profiles(parent_id);
CREATE INDEX idx_stories_age_band ON stories(age_band);
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_published ON stories(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_stories_featured ON stories(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_reading_progress_child ON reading_progress(child_id);
CREATE INDEX idx_reading_sessions_child ON reading_sessions(child_id);
CREATE INDEX idx_reading_sessions_date ON reading_sessions(started_at);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE parent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- Parents can only see their own account
CREATE POLICY "Parents can view own account"
  ON parent_accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Parents can update own account"
  ON parent_accounts FOR UPDATE
  USING (user_id = auth.uid());

-- Parents can manage their children's profiles
CREATE POLICY "Parents can view own children"
  ON child_profiles FOR SELECT
  USING (parent_id IN (
    SELECT id FROM parent_accounts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Parents can manage own children"
  ON child_profiles FOR ALL
  USING (parent_id IN (
    SELECT id FROM parent_accounts WHERE user_id = auth.uid()
  ));

-- Published stories are public, unpublished only to admins
CREATE POLICY "Anyone can view published stories"
  ON stories FOR SELECT
  USING (is_published = TRUE);

-- Reading progress is private to parent/child
CREATE POLICY "Parents can view child reading progress"
  ON reading_progress FOR SELECT
  USING (child_id IN (
    SELECT cp.id FROM child_profiles cp
    JOIN parent_accounts pa ON cp.parent_id = pa.id
    WHERE pa.user_id = auth.uid()
  ));

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_parent_accounts_updated_at
  BEFORE UPDATE ON parent_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_child_profiles_updated_at
  BEFORE UPDATE ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_parent_settings_updated_at
  BEFORE UPDATE ON parent_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Calculate reading level score based on word complexity
CREATE OR REPLACE FUNCTION calculate_reading_level(content TEXT)
RETURNS FLOAT AS $$
DECLARE
  words TEXT[];
  total_words INTEGER;
  long_words INTEGER := 0;
  avg_word_length FLOAT;
BEGIN
  words := regexp_split_to_array(lower(content), '\s+');
  total_words := array_length(words, 1);

  IF total_words IS NULL OR total_words = 0 THEN
    RETURN 0;
  END IF;

  -- Count words with more than 6 characters
  SELECT COUNT(*) INTO long_words
  FROM unnest(words) w
  WHERE length(w) > 6;

  -- Simple reading level calculation
  -- Based on percentage of long words
  RETURN (long_words::FLOAT / total_words::FLOAT) * 12;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA: Default Achievements
-- =====================================================

INSERT INTO achievements (name, description, requirement_type, requirement_value, badge_color) VALUES
  ('First Story', 'Read your first story!', 'stories_read', 1, '#FFD700'),
  ('Bookworm', 'Read 10 stories', 'stories_read', 10, '#22c55e'),
  ('Story Explorer', 'Read 25 stories', 'stories_read', 25, '#6366f1'),
  ('Reading Champion', 'Read 50 stories', 'stories_read', 50, '#ec4899'),
  ('Library Master', 'Read 100 stories', 'stories_read', 100, '#f59e0b'),
  ('Quick Reader', 'Read for 30 minutes total', 'time_read', 1800, '#14b8a6'),
  ('Dedicated Reader', 'Read for 5 hours total', 'time_read', 18000, '#8b5cf6'),
  ('3-Day Streak', 'Read 3 days in a row', 'streak', 3, '#06b6d4'),
  ('Week Warrior', 'Read 7 days in a row', 'streak', 7, '#f43f5e'),
  ('Month Master', 'Read 30 days in a row', 'streak', 30, '#84cc16');
