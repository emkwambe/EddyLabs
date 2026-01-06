-- =====================================================
-- StorySprout Biography Guardrails Migration
-- Adds biography-specific metadata, tracking, and safety controls
-- =====================================================

-- =====================================================
-- ENUM TYPES FOR BIOGRAPHY SUBJECTS
-- =====================================================

-- Biography subject type enum
CREATE TYPE biography_subject_type AS ENUM (
  -- Safe for all ages
  'scientist',
  'inventor',
  'artist',
  'musician',
  'author',
  'poet',
  'athlete',
  'explorer',
  'astronaut',
  'naturalist',
  'mathematician',
  'educator',
  'humanitarian',
  'chef',
  'architect',
  -- Needs age filtering
  'civil_rights_leader',
  'political_leader',
  'activist',
  'military_leader',
  'revolutionary',
  'philosopher',
  'religious_leader',
  -- Special handling
  'controversial_historical',
  'contemporary_political'
);

-- Biography sensitivity level enum
CREATE TYPE biography_sensitivity AS ENUM (
  'safe',
  'moderate',
  'sensitive',
  'restricted'
);

-- =====================================================
-- CURATED BIOGRAPHY FIGURES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS curated_biography_figures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Figure identification
  name VARCHAR(255) NOT NULL UNIQUE,
  name_variants JSONB DEFAULT '[]', -- Alternative names/spellings

  -- Classification
  subject_type biography_subject_type NOT NULL,
  sensitivity biography_sensitivity NOT NULL DEFAULT 'safe',

  -- Age appropriateness
  min_age INTEGER NOT NULL DEFAULT 2,
  max_age INTEGER NOT NULL DEFAULT 18,
  safe_for_youngest BOOLEAN NOT NULL DEFAULT false,

  -- Biographical info
  nationality VARCHAR(100),
  birth_year INTEGER,
  death_year INTEGER, -- NULL if still living
  era VARCHAR(50), -- e.g., "1867-1934"

  -- Content guidance
  focus_areas TEXT[] NOT NULL DEFAULT '{}',
  key_achievements TEXT[] NOT NULL DEFAULT '{}',
  character_traits VARCHAR(50)[] NOT NULL DEFAULT '{}',
  avoid_topics TEXT[] NOT NULL DEFAULT '{}',
  required_disclaimer TEXT,

  -- Story metadata
  story_count INTEGER NOT NULL DEFAULT 0,
  total_reads INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3, 2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_age_range CHECK (min_age <= max_age),
  CONSTRAINT valid_min_age CHECK (min_age >= 2),
  CONSTRAINT valid_max_age CHECK (max_age <= 18)
);

-- Index for efficient lookups
CREATE INDEX idx_curated_figures_subject_type ON curated_biography_figures(subject_type);
CREATE INDEX idx_curated_figures_age_range ON curated_biography_figures(min_age, max_age);
CREATE INDEX idx_curated_figures_sensitivity ON curated_biography_figures(sensitivity);
CREATE INDEX idx_curated_figures_safe_for_youngest ON curated_biography_figures(safe_for_youngest) WHERE safe_for_youngest = true;

-- =====================================================
-- BIOGRAPHY STORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS biography_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,

  -- Figure reference
  figure_id UUID REFERENCES curated_biography_figures(id),
  figure_name VARCHAR(255) NOT NULL, -- Denormalized for flexibility
  subject_type biography_subject_type NOT NULL,

  -- Content classification
  sensitivity biography_sensitivity NOT NULL,
  is_curated_figure BOOLEAN NOT NULL DEFAULT false,

  -- Story focus
  focus_aspect VARCHAR(100), -- 'childhood', 'achievements', 'challenges'
  character_traits_emphasized VARCHAR(50)[] NOT NULL DEFAULT '{}',

  -- Educational metadata
  key_lesson TEXT,
  vocabulary_words TEXT[] DEFAULT '{}',
  discussion_questions TEXT[] DEFAULT '{}',
  historical_context TEXT,

  -- Safety metadata
  content_warnings TEXT[] DEFAULT '{}',
  disclaimer_shown TEXT,
  manual_review_required BOOLEAN NOT NULL DEFAULT false,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_story_biography UNIQUE(story_id)
);

-- Indexes
CREATE INDEX idx_biography_stories_figure ON biography_stories(figure_id);
CREATE INDEX idx_biography_stories_subject ON biography_stories(subject_type);
CREATE INDEX idx_biography_stories_sensitivity ON biography_stories(sensitivity);

-- =====================================================
-- CHILD BIOGRAPHY READING HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS child_biography_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,

  -- What was read
  figure_id UUID REFERENCES curated_biography_figures(id),
  figure_name VARCHAR(255) NOT NULL,
  subject_type biography_subject_type NOT NULL,
  story_id UUID REFERENCES stories(id),

  -- Reading details
  read_at TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN NOT NULL DEFAULT false,
  reading_time_seconds INTEGER,

  -- Learning outcomes
  vocabulary_learned TEXT[] DEFAULT '{}',
  discussion_had BOOLEAN DEFAULT false,

  -- Child engagement
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  favorite BOOLEAN DEFAULT false,

  CONSTRAINT unique_child_figure_story UNIQUE(child_id, figure_name, story_id)
);

-- Indexes
CREATE INDEX idx_child_bio_history_child ON child_biography_history(child_id);
CREATE INDEX idx_child_bio_history_figure ON child_biography_history(figure_id);
CREATE INDEX idx_child_bio_history_subject ON child_biography_history(subject_type);
CREATE INDEX idx_child_bio_history_favorites ON child_biography_history(child_id, favorite) WHERE favorite = true;

-- =====================================================
-- BIOGRAPHY SUBJECT RESTRICTIONS BY AGE
-- =====================================================

CREATE TABLE IF NOT EXISTS biography_age_restrictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_type biography_subject_type NOT NULL,
  age_band VARCHAR(20) NOT NULL,

  -- Permission status
  is_allowed BOOLEAN NOT NULL DEFAULT true,
  requires_parental_consent BOOLEAN NOT NULL DEFAULT false,
  requires_educator_approval BOOLEAN NOT NULL DEFAULT false,

  -- Restrictions
  max_sensitivity biography_sensitivity NOT NULL DEFAULT 'safe',
  topics_to_avoid TEXT[] DEFAULT '{}',
  required_focus_areas TEXT[] DEFAULT '{}',

  -- Override capability
  can_be_overridden BOOLEAN NOT NULL DEFAULT false,
  override_requires VARCHAR(50), -- 'parent', 'teacher', 'admin'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_subject_age UNIQUE(subject_type, age_band)
);

-- Populate default age restrictions
INSERT INTO biography_age_restrictions (subject_type, age_band, is_allowed, max_sensitivity) VALUES
  -- Safe subjects - all ages
  ('scientist', 'pre_k', true, 'safe'),
  ('scientist', 'kindergarten', true, 'safe'),
  ('scientist', 'grade_1', true, 'safe'),
  ('scientist', 'grade_2', true, 'safe'),
  ('scientist', 'grade_3', true, 'safe'),
  ('scientist', 'grade_4', true, 'safe'),
  ('scientist', 'grade_5', true, 'safe'),
  ('scientist', 'grade_6', true, 'moderate'),
  ('scientist', 'grade_7', true, 'moderate'),
  ('scientist', 'grade_8', true, 'moderate'),
  ('scientist', 'grade_9', true, 'sensitive'),
  ('scientist', 'grade_10', true, 'sensitive'),
  ('scientist', 'grade_11', true, 'sensitive'),
  ('scientist', 'grade_12', true, 'sensitive'),

  -- Civil rights leaders - grade 1+
  ('civil_rights_leader', 'pre_k', false, 'safe'),
  ('civil_rights_leader', 'kindergarten', false, 'safe'),
  ('civil_rights_leader', 'grade_1', true, 'safe'),
  ('civil_rights_leader', 'grade_2', true, 'safe'),
  ('civil_rights_leader', 'grade_3', true, 'safe'),
  ('civil_rights_leader', 'grade_4', true, 'moderate'),
  ('civil_rights_leader', 'grade_5', true, 'moderate'),
  ('civil_rights_leader', 'grade_6', true, 'moderate'),
  ('civil_rights_leader', 'grade_7', true, 'moderate'),
  ('civil_rights_leader', 'grade_8', true, 'sensitive'),
  ('civil_rights_leader', 'grade_9', true, 'sensitive'),
  ('civil_rights_leader', 'grade_10', true, 'sensitive'),
  ('civil_rights_leader', 'grade_11', true, 'sensitive'),
  ('civil_rights_leader', 'grade_12', true, 'sensitive'),

  -- Political leaders - grade 3+
  ('political_leader', 'pre_k', false, 'safe'),
  ('political_leader', 'kindergarten', false, 'safe'),
  ('political_leader', 'grade_1', false, 'safe'),
  ('political_leader', 'grade_2', false, 'safe'),
  ('political_leader', 'grade_3', true, 'safe'),
  ('political_leader', 'grade_4', true, 'safe'),
  ('political_leader', 'grade_5', true, 'moderate'),
  ('political_leader', 'grade_6', true, 'moderate'),
  ('political_leader', 'grade_7', true, 'moderate'),
  ('political_leader', 'grade_8', true, 'moderate'),
  ('political_leader', 'grade_9', true, 'sensitive'),
  ('political_leader', 'grade_10', true, 'sensitive'),
  ('political_leader', 'grade_11', true, 'sensitive'),
  ('political_leader', 'grade_12', true, 'sensitive'),

  -- Military leaders - grade 5+
  ('military_leader', 'pre_k', false, 'safe'),
  ('military_leader', 'kindergarten', false, 'safe'),
  ('military_leader', 'grade_1', false, 'safe'),
  ('military_leader', 'grade_2', false, 'safe'),
  ('military_leader', 'grade_3', false, 'safe'),
  ('military_leader', 'grade_4', false, 'safe'),
  ('military_leader', 'grade_5', true, 'safe'),
  ('military_leader', 'grade_6', true, 'moderate'),
  ('military_leader', 'grade_7', true, 'moderate'),
  ('military_leader', 'grade_8', true, 'moderate'),
  ('military_leader', 'grade_9', true, 'sensitive'),
  ('military_leader', 'grade_10', true, 'sensitive'),
  ('military_leader', 'grade_11', true, 'sensitive'),
  ('military_leader', 'grade_12', true, 'sensitive'),

  -- Revolutionary figures - grade 7+
  ('revolutionary', 'pre_k', false, 'safe'),
  ('revolutionary', 'kindergarten', false, 'safe'),
  ('revolutionary', 'grade_1', false, 'safe'),
  ('revolutionary', 'grade_2', false, 'safe'),
  ('revolutionary', 'grade_3', false, 'safe'),
  ('revolutionary', 'grade_4', false, 'safe'),
  ('revolutionary', 'grade_5', false, 'safe'),
  ('revolutionary', 'grade_6', false, 'safe'),
  ('revolutionary', 'grade_7', true, 'moderate'),
  ('revolutionary', 'grade_8', true, 'moderate'),
  ('revolutionary', 'grade_9', true, 'sensitive'),
  ('revolutionary', 'grade_10', true, 'sensitive'),
  ('revolutionary', 'grade_11', true, 'sensitive'),
  ('revolutionary', 'grade_12', true, 'sensitive'),

  -- Controversial historical - grade 9+
  ('controversial_historical', 'pre_k', false, 'safe'),
  ('controversial_historical', 'kindergarten', false, 'safe'),
  ('controversial_historical', 'grade_1', false, 'safe'),
  ('controversial_historical', 'grade_2', false, 'safe'),
  ('controversial_historical', 'grade_3', false, 'safe'),
  ('controversial_historical', 'grade_4', false, 'safe'),
  ('controversial_historical', 'grade_5', false, 'safe'),
  ('controversial_historical', 'grade_6', false, 'safe'),
  ('controversial_historical', 'grade_7', false, 'safe'),
  ('controversial_historical', 'grade_8', false, 'safe'),
  ('controversial_historical', 'grade_9', true, 'sensitive'),
  ('controversial_historical', 'grade_10', true, 'sensitive'),
  ('controversial_historical', 'grade_11', true, 'sensitive'),
  ('controversial_historical', 'grade_12', true, 'sensitive'),

  -- Contemporary political - grade 11+
  ('contemporary_political', 'pre_k', false, 'safe'),
  ('contemporary_political', 'kindergarten', false, 'safe'),
  ('contemporary_political', 'grade_1', false, 'safe'),
  ('contemporary_political', 'grade_2', false, 'safe'),
  ('contemporary_political', 'grade_3', false, 'safe'),
  ('contemporary_political', 'grade_4', false, 'safe'),
  ('contemporary_political', 'grade_5', false, 'safe'),
  ('contemporary_political', 'grade_6', false, 'safe'),
  ('contemporary_political', 'grade_7', false, 'safe'),
  ('contemporary_political', 'grade_8', false, 'safe'),
  ('contemporary_political', 'grade_9', false, 'safe'),
  ('contemporary_political', 'grade_10', false, 'safe'),
  ('contemporary_political', 'grade_11', true, 'sensitive'),
  ('contemporary_political', 'grade_12', true, 'sensitive')
ON CONFLICT (subject_type, age_band) DO NOTHING;

-- =====================================================
-- POPULATE CURATED FIGURES
-- =====================================================

INSERT INTO curated_biography_figures (
  name, subject_type, sensitivity, min_age, max_age, safe_for_youngest,
  nationality, era, focus_areas, key_achievements, character_traits
) VALUES
  -- Scientists
  ('Marie Curie', 'scientist', 'safe', 4, 18, true,
   'Polish-French', '1867-1934',
   ARRAY['scientific discovery', 'perseverance', 'breaking barriers'],
   ARRAY['First woman to win Nobel Prize', 'Discovered radium and polonium', 'Pioneer in radioactivity research'],
   ARRAY['perseverance', 'curiosity', 'courage']),

  ('George Washington Carver', 'scientist', 'safe', 4, 18, true,
   'American', '1864-1943',
   ARRAY['agricultural science', 'helping farmers', 'creativity'],
   ARRAY['Discovered hundreds of uses for peanuts', 'Helped poor farmers', 'Champion of sustainable farming'],
   ARRAY['creativity', 'kindness', 'perseverance']),

  ('Jane Goodall', 'naturalist', 'safe', 3, 18, true,
   'British', '1934-present',
   ARRAY['animal behavior', 'conservation', 'following dreams'],
   ARRAY['Revolutionary chimpanzee research', 'Global conservation work', 'Youth education advocate'],
   ARRAY['patience', 'empathy', 'perseverance']),

  ('Mae Jemison', 'astronaut', 'safe', 4, 18, true,
   'American', '1956-present',
   ARRAY['space exploration', 'breaking barriers', 'science and arts'],
   ARRAY['First African American woman in space', 'Doctor and engineer', 'STEM education advocate'],
   ARRAY['courage', 'curiosity', 'perseverance']),

  ('Albert Einstein', 'scientist', 'safe', 5, 18, true,
   'German-American', '1879-1955',
   ARRAY['imagination', 'thinking differently', 'curiosity'],
   ARRAY['Theory of relativity', 'Nobel Prize in Physics', 'Changed how we understand the universe'],
   ARRAY['curiosity', 'creativity', 'perseverance']),

  -- Artists & Musicians
  ('Ludwig van Beethoven', 'musician', 'safe', 4, 18, true,
   'German', '1770-1827',
   ARRAY['perseverance', 'music creation', 'overcoming obstacles'],
   ARRAY['Composed while deaf', 'Created timeless symphonies', 'Revolutionized classical music'],
   ARRAY['perseverance', 'creativity', 'courage']),

  ('Yo-Yo Ma', 'musician', 'safe', 3, 18, true,
   'American', '1955-present',
   ARRAY['practice', 'sharing music', 'cultural connection'],
   ARRAY['World-renowned cellist', 'Silk Road Project founder', 'Music education advocate'],
   ARRAY['generosity', 'perseverance', 'creativity']),

  -- Athletes
  ('Simone Biles', 'athlete', 'safe', 4, 18, true,
   'American', '1997-present',
   ARRAY['dedication', 'mental health', 'excellence'],
   ARRAY['Most decorated gymnast', 'Olympic champion', 'Mental health advocate'],
   ARRAY['courage', 'perseverance', 'self_discipline']),

  ('Jackie Robinson', 'athlete', 'safe', 5, 18, true,
   'American', '1919-1972',
   ARRAY['courage', 'breaking barriers', 'dignity'],
   ARRAY['First African American in MLB', 'Hall of Fame', 'Civil rights pioneer'],
   ARRAY['courage', 'self_discipline', 'integrity']),

  ('Serena Williams', 'athlete', 'safe', 4, 18, true,
   'American', '1981-present',
   ARRAY['hard work', 'determination', 'family support'],
   ARRAY['23 Grand Slam titles', 'Tennis champion', 'Inspiration for young athletes'],
   ARRAY['perseverance', 'self_discipline', 'courage']),

  -- Astronauts & Explorers
  ('Neil Armstrong', 'astronaut', 'safe', 4, 18, true,
   'American', '1930-2012',
   ARRAY['courage', 'exploration', 'teamwork'],
   ARRAY['First person on the moon', 'Naval aviator', 'Quiet hero'],
   ARRAY['courage', 'humility', 'perseverance']),

  ('Jacques Cousteau', 'explorer', 'safe', 4, 18, true,
   'French', '1910-1997',
   ARRAY['ocean exploration', 'conservation', 'curiosity'],
   ARRAY['Ocean exploration pioneer', 'Invented SCUBA equipment', 'Marine conservation'],
   ARRAY['curiosity', 'environmental_stewardship', 'courage']),

  -- Educators & Humanitarians
  ('Fred Rogers', 'educator', 'safe', 3, 12, true,
   'American', '1928-2003',
   ARRAY['kindness', 'emotional learning', 'being a good neighbor'],
   ARRAY['Mister Rogers Neighborhood', 'Children television pioneer', 'Emotional education'],
   ARRAY['kindness', 'patience', 'empathy']),

  ('Clara Barton', 'humanitarian', 'safe', 5, 18, true,
   'American', '1821-1912',
   ARRAY['helping others', 'nursing', 'organizing relief'],
   ARRAY['Founded American Red Cross', 'Civil War nurse', 'Disaster relief pioneer'],
   ARRAY['caring', 'courage', 'service']),

  -- Civil Rights Leaders
  ('Martin Luther King Jr.', 'civil_rights_leader', 'moderate', 6, 18, false,
   'American', '1929-1968',
   ARRAY['peaceful change', 'equality', 'dreams for a better world'],
   ARRAY['Civil rights leader', 'Nobel Peace Prize', 'I Have a Dream speech'],
   ARRAY['courage', 'justice', 'perseverance']),

  ('Rosa Parks', 'civil_rights_leader', 'safe', 5, 18, true,
   'American', '1913-2005',
   ARRAY['standing up for rights', 'quiet courage', 'dignity'],
   ARRAY['Montgomery Bus Boycott', 'Civil rights icon', 'Congressional Gold Medal'],
   ARRAY['courage', 'integrity', 'perseverance']),

  ('Nelson Mandela', 'civil_rights_leader', 'moderate', 8, 18, false,
   'South African', '1918-2013',
   ARRAY['forgiveness', 'reconciliation', 'long journey to freedom'],
   ARRAY['Ended apartheid', 'First Black South African president', 'Nobel Peace Prize'],
   ARRAY['forgiveness', 'perseverance', 'leadership']),

  ('Malala Yousafzai', 'activist', 'moderate', 7, 18, false,
   'Pakistani', '1997-present',
   ARRAY['education rights', 'speaking up', 'courage'],
   ARRAY['Youngest Nobel Prize laureate', 'Education activist', 'Malala Fund founder'],
   ARRAY['courage', 'perseverance', 'justice'])
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- VIEWS FOR BIOGRAPHY ANALYTICS
-- =====================================================

-- View: Biography figures appropriate for each age band
CREATE OR REPLACE VIEW biography_figures_by_age AS
SELECT
  f.id,
  f.name,
  f.subject_type,
  f.sensitivity,
  f.min_age,
  f.max_age,
  f.safe_for_youngest,
  f.focus_areas,
  f.character_traits,
  r.age_band,
  r.is_allowed,
  r.max_sensitivity
FROM curated_biography_figures f
JOIN biography_age_restrictions r ON f.subject_type = r.subject_type
WHERE r.is_allowed = true
  AND f.sensitivity::text <= r.max_sensitivity::text;

-- View: Most popular biography figures
CREATE OR REPLACE VIEW popular_biography_figures AS
SELECT
  f.id,
  f.name,
  f.subject_type,
  f.nationality,
  f.era,
  f.story_count,
  f.total_reads,
  f.average_rating,
  COUNT(h.id) AS recent_reads,
  AVG(h.rating) AS recent_rating
FROM curated_biography_figures f
LEFT JOIN child_biography_history h ON f.id = h.figure_id
  AND h.read_at > NOW() - INTERVAL '30 days'
GROUP BY f.id, f.name, f.subject_type, f.nationality, f.era,
         f.story_count, f.total_reads, f.average_rating
ORDER BY recent_reads DESC, f.total_reads DESC;

-- View: Child biography progress
CREATE OR REPLACE VIEW child_biography_progress AS
SELECT
  h.child_id,
  COUNT(DISTINCT h.figure_name) AS figures_read,
  COUNT(DISTINCT h.subject_type) AS subject_types_explored,
  array_agg(DISTINCT h.subject_type) AS explored_types,
  COUNT(*) FILTER (WHERE h.favorite) AS favorite_count,
  AVG(h.rating) AS average_rating,
  SUM(h.reading_time_seconds) AS total_reading_time,
  COUNT(*) FILTER (WHERE h.completed) AS completed_stories,
  MAX(h.read_at) AS last_read_at
FROM child_biography_history h
GROUP BY h.child_id;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Get recommended biography figures for a child
CREATE OR REPLACE FUNCTION get_biography_recommendations(
  p_child_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  figure_id UUID,
  name VARCHAR,
  subject_type biography_subject_type,
  match_score NUMERIC,
  reason TEXT
) AS $$
DECLARE
  v_age_band VARCHAR;
  v_interests TEXT[];
BEGIN
  -- Get child's age band and interests
  SELECT age_band, interests INTO v_age_band, v_interests
  FROM child_profiles
  WHERE id = p_child_id;

  RETURN QUERY
  WITH read_figures AS (
    SELECT DISTINCT figure_name
    FROM child_biography_history
    WHERE child_id = p_child_id
  ),
  scored_figures AS (
    SELECT
      f.id,
      f.name,
      f.subject_type,
      CASE
        WHEN f.safe_for_youngest THEN 10
        ELSE 0
      END +
      CASE
        WHEN f.average_rating IS NOT NULL THEN f.average_rating * 2
        ELSE 0
      END +
      RANDOM() * 2 AS score,
      CASE
        WHEN f.average_rating >= 4.5 THEN 'Highly rated by other readers'
        WHEN f.safe_for_youngest THEN 'Perfect for your age'
        ELSE 'Explore something new'
      END AS match_reason
    FROM curated_biography_figures f
    JOIN biography_age_restrictions r
      ON f.subject_type = r.subject_type
      AND r.age_band = v_age_band
    WHERE r.is_allowed = true
      AND f.name NOT IN (SELECT figure_name FROM read_figures)
  )
  SELECT
    sf.id,
    sf.name,
    sf.subject_type,
    sf.score,
    sf.match_reason
  FROM scored_figures sf
  ORDER BY sf.score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Validate biography content safety
CREATE OR REPLACE FUNCTION validate_biography_for_age(
  p_subject_type biography_subject_type,
  p_age_band VARCHAR
)
RETURNS TABLE (
  is_allowed BOOLEAN,
  max_sensitivity biography_sensitivity,
  topics_to_avoid TEXT[],
  required_focus_areas TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.is_allowed,
    r.max_sensitivity,
    r.topics_to_avoid,
    r.required_focus_areas
  FROM biography_age_restrictions r
  WHERE r.subject_type = p_subject_type
    AND r.age_band = p_age_band;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE curated_biography_figures ENABLE ROW LEVEL SECURITY;
ALTER TABLE biography_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_biography_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE biography_age_restrictions ENABLE ROW LEVEL SECURITY;

-- Curated figures are readable by all authenticated users
CREATE POLICY "Curated figures readable by all" ON curated_biography_figures
  FOR SELECT TO authenticated
  USING (true);

-- Biography stories follow story permissions
CREATE POLICY "Biography stories follow story access" ON biography_stories
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_id
      AND (
        s.is_public = true
        OR s.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM child_profiles cp
          WHERE cp.parent_user_id = auth.uid()
          AND EXISTS (
            SELECT 1 FROM reading_sessions rs
            WHERE rs.child_id = cp.id AND rs.story_id = s.id
          )
        )
      )
    )
  );

-- Child biography history - parents can see their children's history
CREATE POLICY "Parents can view child biography history" ON child_biography_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM child_profiles cp
      WHERE cp.id = child_id
      AND cp.parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert child biography history" ON child_biography_history
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM child_profiles cp
      WHERE cp.id = child_id
      AND cp.parent_user_id = auth.uid()
    )
  );

-- Age restrictions are readable by all
CREATE POLICY "Age restrictions readable by all" ON biography_age_restrictions
  FOR SELECT TO authenticated
  USING (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update figure stats when story is read
CREATE OR REPLACE FUNCTION update_figure_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE curated_biography_figures
  SET
    total_reads = total_reads + 1,
    updated_at = NOW()
  WHERE id = NEW.figure_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_figure_stats
  AFTER INSERT ON child_biography_history
  FOR EACH ROW
  WHEN (NEW.figure_id IS NOT NULL)
  EXECUTE FUNCTION update_figure_stats();

-- Update average rating when rating is added
CREATE OR REPLACE FUNCTION update_figure_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE curated_biography_figures
  SET
    average_rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM child_biography_history
      WHERE figure_id = NEW.figure_id
      AND rating IS NOT NULL
    ),
    updated_at = NOW()
  WHERE id = NEW.figure_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_figure_rating
  AFTER INSERT OR UPDATE OF rating ON child_biography_history
  FOR EACH ROW
  WHEN (NEW.figure_id IS NOT NULL AND NEW.rating IS NOT NULL)
  EXECUTE FUNCTION update_figure_rating();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE curated_biography_figures IS 'Pre-vetted biography figures safe for children';
COMMENT ON TABLE biography_stories IS 'Metadata for biography-type stories';
COMMENT ON TABLE child_biography_history IS 'Tracks which biography figures children have read about';
COMMENT ON TABLE biography_age_restrictions IS 'Age-based restrictions for biography subject types';
COMMENT ON FUNCTION get_biography_recommendations IS 'Returns personalized biography figure recommendations';
COMMENT ON FUNCTION validate_biography_for_age IS 'Validates if a biography subject is appropriate for age';
