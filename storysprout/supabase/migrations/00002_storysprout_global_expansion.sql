-- StorySprout Global Expansion Migration
-- Extends platform from children (ages 2-10) to global education (ages 2-18+)
-- Adds geographic, cultural, and extended grade level support

-- =====================================================
-- EXTEND ENUMS
-- =====================================================

-- Note: PostgreSQL doesn't support adding values to ENUM in the middle.
-- We need to create new types and migrate data.

-- Backup and recreate age_band ENUM with extended grades
ALTER TYPE age_band RENAME TO age_band_old;

CREATE TYPE age_band AS ENUM (
  -- Early Childhood (2-5)
  'pre_k',      -- 2-3 years
  'k_prep',     -- 4-5 years
  -- Elementary School (6-11)
  'grade_1',    -- 6-7 years
  'grade_2',    -- 7-8 years
  'grade_3',    -- 8-9 years
  'grade_4',    -- 9-10 years
  'grade_5',    -- 10-11 years
  -- Middle School (11-14)
  'grade_6',    -- 11-12 years
  'grade_7',    -- 12-13 years
  'grade_8',    -- 13-14 years
  -- High School (14-18)
  'grade_9',    -- 14-15 years
  'grade_10',   -- 15-16 years
  'grade_11',   -- 16-17 years
  'grade_12'    -- 17-18 years
);

-- Update columns using age_band
ALTER TABLE child_profiles
  ALTER COLUMN age_band TYPE age_band USING age_band::text::age_band;

ALTER TABLE stories
  ALTER COLUMN age_band TYPE age_band USING age_band::text::age_band;

ALTER TABLE story_paths
  ALTER COLUMN age_band TYPE age_band USING age_band::text::age_band;

ALTER TABLE parent_settings
  ALTER COLUMN allowed_age_bands TYPE age_band[]
  USING allowed_age_bands::text[]::age_band[];

DROP TYPE age_band_old;

-- =====================================================
-- NEW ENUMS
-- =====================================================

-- School level categorization
CREATE TYPE school_level AS ENUM (
  'early_childhood',  -- Pre-K to K-Prep
  'elementary',       -- Grades 1-5
  'middle_school',    -- Grades 6-8
  'high_school'       -- Grades 9-12
);

-- Continent ENUM
CREATE TYPE continent AS ENUM (
  'africa',
  'asia',
  'europe',
  'north_america',
  'south_america',
  'oceania',
  'antarctica'
);

-- Global region ENUM
CREATE TYPE global_region AS ENUM (
  -- Africa
  'north_africa',
  'west_africa',
  'east_africa',
  'central_africa',
  'southern_africa',
  -- Asia
  'east_asia',
  'southeast_asia',
  'south_asia',
  'central_asia',
  'middle_east',
  -- Europe
  'western_europe',
  'eastern_europe',
  'northern_europe',
  'southern_europe',
  -- Americas
  'north_america_region',
  'central_america',
  'caribbean',
  'south_america_region',
  -- Oceania
  'australia_nz',
  'pacific_islands',
  'melanesia'
);

-- =====================================================
-- EXTEND READING MODE ENUM
-- =====================================================

ALTER TYPE reading_mode RENAME TO reading_mode_old;

CREATE TYPE reading_mode AS ENUM (
  'read_to_me',   -- Full narration
  'read_with_me', -- Highlighted text with optional narration
  'read_alone',   -- Distraction-free reading
  'study_mode'    -- Annotations, vocabulary highlights (older readers)
);

-- Update columns using reading_mode
ALTER TABLE reading_progress
  ALTER COLUMN reading_mode_used TYPE reading_mode USING reading_mode_used::text::reading_mode;

ALTER TABLE reading_sessions
  ALTER COLUMN reading_mode TYPE reading_mode USING reading_mode::text::reading_mode;

ALTER TABLE child_profiles
  ALTER COLUMN preferred_reading_mode TYPE reading_mode USING preferred_reading_mode::text::reading_mode;

ALTER TABLE stories
  ALTER COLUMN modes_supported TYPE reading_mode[] USING modes_supported::text[]::reading_mode[];

DROP TYPE reading_mode_old;

-- =====================================================
-- EXTEND STORY CATEGORY ENUM
-- =====================================================

ALTER TYPE story_category RENAME TO story_category_old;

CREATE TYPE story_category AS ENUM (
  -- Original Categories
  'bedtime',
  'seasonal',
  'cultural',
  'curriculum',
  'emotional_social',
  'school',
  'family',
  'adventure',
  -- New Global/Geographic Categories
  'world_cultures',
  'geography_adventures',
  'historical_fiction',
  'mythology_folklore',
  'global_citizenship',
  'environmental',
  'stem_stories',
  'biography',
  'coming_of_age',
  'social_issues'
);

ALTER TABLE stories
  ALTER COLUMN category TYPE story_category USING category::text::story_category;

DROP TYPE story_category_old;

-- =====================================================
-- EXTEND ILLUSTRATION STYLE ENUM
-- =====================================================

ALTER TYPE illustration_style RENAME TO illustration_style_old;

CREATE TYPE illustration_style AS ENUM (
  'soft_flat',
  'watercolor',
  'line_art',
  'collage',
  'photographic',
  'realistic',
  'manga_anime',
  'graphic_novel',
  'digital_art'
);

ALTER TABLE stories
  ALTER COLUMN illustration_style TYPE illustration_style USING illustration_style::text::illustration_style;

DROP TYPE illustration_style_old;

-- =====================================================
-- ADD GEOGRAPHIC/CULTURAL COLUMNS TO STORIES
-- =====================================================

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS continent continent,
  ADD COLUMN IF NOT EXISTS region global_region,
  ADD COLUMN IF NOT EXISTS country_code CHAR(2),
  ADD COLUMN IF NOT EXISTS cultural_elements TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages_featured TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS setting_description TEXT,
  ADD COLUMN IF NOT EXISTS main_character_culture TEXT,
  ADD COLUMN IF NOT EXISTS character_customizable BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS discussion_questions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS available_narration_languages TEXT[] DEFAULT ARRAY['en'],
  ADD COLUMN IF NOT EXISTS chapter_count INTEGER DEFAULT 1;

-- Add indexes for geographic filtering
CREATE INDEX IF NOT EXISTS idx_stories_continent ON stories(continent);
CREATE INDEX IF NOT EXISTS idx_stories_region ON stories(region);
CREATE INDEX IF NOT EXISTS idx_stories_country ON stories(country_code);

-- =====================================================
-- ADD CULTURAL PREFERENCES TO CHILD PROFILES
-- =====================================================

ALTER TABLE child_profiles
  ADD COLUMN IF NOT EXISTS preferred_regions global_region[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_languages TEXT[] DEFAULT ARRAY['en'],
  ADD COLUMN IF NOT EXISTS cultural_background TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- =====================================================
-- ADD CULTURAL FILTERS TO PARENT SETTINGS
-- =====================================================

ALTER TABLE parent_settings
  ADD COLUMN IF NOT EXISTS allowed_categories story_category[] DEFAULT ARRAY[
    'bedtime', 'seasonal', 'cultural', 'curriculum', 'emotional_social',
    'school', 'family', 'adventure', 'world_cultures', 'geography_adventures',
    'mythology_folklore', 'environmental', 'stem_stories'
  ]::story_category[],
  ADD COLUMN IF NOT EXISTS preferred_regions global_region[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cultural_filters TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS content_language TEXT DEFAULT 'en';

-- =====================================================
-- ADD CULTURAL NOTES TO STORY PAGES
-- =====================================================

ALTER TABLE story_pages
  ADD COLUMN IF NOT EXISTS cultural_notes TEXT,
  ADD COLUMN IF NOT EXISTS vocabulary_highlights JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS chapter_number INTEGER,
  ADD COLUMN IF NOT EXISTS chapter_title TEXT;

-- =====================================================
-- ADD GEOGRAPHIC FOCUS TO STORY PATHS
-- =====================================================

ALTER TABLE story_paths
  ADD COLUMN IF NOT EXISTS continent_focus continent,
  ADD COLUMN IF NOT EXISTS region_focus global_region;

-- Add index for geographic story paths
CREATE INDEX IF NOT EXISTS idx_story_paths_continent ON story_paths(continent_focus);
CREATE INDEX IF NOT EXISTS idx_story_paths_region ON story_paths(region_focus);

-- =====================================================
-- ADD CULTURAL TRACKING TO READING SESSIONS
-- =====================================================

ALTER TABLE reading_sessions
  ADD COLUMN IF NOT EXISTS vocabulary_learned TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cultural_topics_explored TEXT[] DEFAULT '{}';

-- =====================================================
-- UPDATE CHILD READING SUMMARY VIEW
-- =====================================================

DROP VIEW IF EXISTS child_reading_summary;

CREATE OR REPLACE VIEW child_reading_summary AS
SELECT
  cp.id AS child_id,
  cp.name AS child_name,
  cp.parent_user_id,
  COUNT(DISTINCT rp.story_id) FILTER (WHERE rp.is_completed) AS stories_completed,
  COUNT(DISTINCT rp.story_id) AS stories_started,
  COALESCE(SUM(rp.total_reading_time_seconds), 0) / 60 AS total_reading_minutes,
  COUNT(DISTINCT swe.word) AS sight_words_encountered,
  -- New cultural tracking
  ARRAY_AGG(DISTINCT s.country_code) FILTER (WHERE s.country_code IS NOT NULL) AS countries_explored,
  ARRAY_AGG(DISTINCT unnest(s.cultural_elements)) FILTER (WHERE s.cultural_elements IS NOT NULL) AS cultures_learned,
  MAX(rp.last_read_at) AS last_reading_date
FROM child_profiles cp
LEFT JOIN reading_progress rp ON cp.id = rp.child_profile_id
LEFT JOIN stories s ON rp.story_id = s.id
LEFT JOIN sight_word_exposures swe ON cp.id = swe.child_profile_id
GROUP BY cp.id, cp.name, cp.parent_user_id;

-- =====================================================
-- UPDATE STORY WITH PROGRESS VIEW
-- =====================================================

DROP VIEW IF EXISTS story_with_child_progress;

CREATE OR REPLACE VIEW story_with_child_progress AS
SELECT
  s.*,
  rp.child_profile_id,
  rp.current_page,
  rp.is_completed,
  rp.read_count,
  rp.total_reading_time_seconds,
  rp.last_read_at,
  rp.current_chapter
FROM stories s
LEFT JOIN reading_progress rp ON s.id = rp.story_id;

-- =====================================================
-- ADD CURRENT_CHAPTER TO READING_PROGRESS
-- =====================================================

ALTER TABLE reading_progress
  ADD COLUMN IF NOT EXISTS current_chapter INTEGER,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS bookmarks INTEGER[] DEFAULT '{}';

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TYPE school_level IS 'School level categorization for age-appropriate content filtering';
COMMENT ON TYPE continent IS 'Seven continents for geographic story categorization';
COMMENT ON TYPE global_region IS 'Sub-regions within continents for more specific cultural targeting';

COMMENT ON COLUMN stories.continent IS 'Primary continent setting for the story';
COMMENT ON COLUMN stories.region IS 'Specific global region for cultural context';
COMMENT ON COLUMN stories.country_code IS 'ISO 3166-1 alpha-2 country code if story is country-specific';
COMMENT ON COLUMN stories.cultural_elements IS 'Array of cultural elements featured in the story';
COMMENT ON COLUMN stories.languages_featured IS 'Languages that appear in the story text';
COMMENT ON COLUMN stories.character_customizable IS 'Whether the main character can be customized by the reader';

COMMENT ON COLUMN child_profiles.preferred_regions IS 'Child''s preferred cultural regions for story recommendations';
COMMENT ON COLUMN child_profiles.cultural_background IS 'Cultural backgrounds for personalized content';
COMMENT ON COLUMN child_profiles.interests IS 'Child''s interests for story recommendations';

COMMENT ON COLUMN story_pages.cultural_notes IS 'Educational notes about cultural elements on this page';
COMMENT ON COLUMN story_pages.vocabulary_highlights IS 'Words with definitions and pronunciations to highlight';
