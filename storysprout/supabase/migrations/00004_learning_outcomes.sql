-- =====================================================
-- StorySprout Learning Outcomes Schema
-- Migration: 00004_learning_outcomes.sql
-- Description: Add learning outcomes tracking for stories
-- =====================================================

-- =====================================================
-- ENUM TYPES FOR LEARNING OUTCOMES
-- =====================================================

-- Core values that stories can teach
CREATE TYPE core_value AS ENUM (
  -- Universal Values (All Ages)
  'kindness', 'honesty', 'respect', 'responsibility', 'fairness',
  'caring', 'gratitude', 'patience', 'courage', 'perseverance',
  -- Social Values (Ages 4+)
  'sharing', 'cooperation', 'empathy', 'inclusion', 'friendship',
  'forgiveness', 'generosity', 'helpfulness',
  -- Character Values (Ages 6+)
  'integrity', 'humility', 'self_discipline', 'curiosity', 'creativity',
  'optimism', 'resilience', 'adaptability',
  -- Advanced Values (Ages 10+)
  'justice', 'citizenship', 'environmental_stewardship', 'cultural_appreciation',
  'leadership', 'service', 'critical_thinking', 'self_reflection'
);

-- Social skills that can be modeled in stories
CREATE TYPE social_skill AS ENUM (
  -- Basic Social Skills (Ages 2-5)
  'greeting_others', 'taking_turns', 'sharing_toys', 'saying_please_thank_you',
  'following_rules', 'listening_to_others',
  -- Intermediate Social Skills (Ages 5-8)
  'making_friends', 'joining_group_play', 'expressing_needs', 'accepting_differences',
  'apologizing', 'giving_compliments', 'asking_for_help',
  -- Advanced Social Skills (Ages 8-12)
  'conflict_resolution', 'perspective_taking', 'negotiation', 'standing_up_for_others',
  'respectful_disagreement', 'active_listening', 'group_collaboration',
  -- Complex Social Skills (Ages 12+)
  'leadership_skills', 'mentoring_others', 'public_speaking',
  'cross_cultural_communication', 'advocacy', 'networking', 'mediation'
);

-- Emotional skills that stories can develop
CREATE TYPE emotional_skill AS ENUM (
  -- Emotion Recognition (Ages 2-5)
  'identifying_basic_emotions', 'recognizing_facial_expressions', 'naming_feelings',
  -- Emotion Expression (Ages 4-7)
  'expressing_feelings_appropriately', 'using_feeling_words', 'asking_for_comfort',
  -- Emotion Regulation (Ages 5-10)
  'calming_down_strategies', 'managing_anger', 'coping_with_disappointment',
  'handling_frustration', 'managing_excitement', 'dealing_with_fear',
  -- Advanced Emotional Skills (Ages 8+)
  'emotional_awareness', 'empathic_responding', 'delayed_gratification',
  'stress_management', 'growth_mindset',
  -- Complex Emotional Skills (Ages 12+)
  'emotional_intelligence', 'self_compassion', 'managing_complex_emotions',
  'supporting_others_emotionally', 'resilience_building'
);

-- Behavior lessons that stories can model
CREATE TYPE behavior_lesson AS ENUM (
  -- Daily Life Behaviors
  'morning_routine', 'bedtime_routine', 'healthy_eating', 'personal_hygiene',
  'organization', 'time_management',
  -- Safety Behaviors
  'stranger_safety', 'internet_safety', 'physical_safety', 'asking_trusted_adult',
  -- Academic Behaviors
  'doing_homework', 'paying_attention', 'trying_new_things', 'learning_from_mistakes',
  'asking_questions', 'practicing_skills',
  -- Relationship Behaviors
  'being_a_good_friend', 'respecting_boundaries', 'including_others', 'handling_peer_pressure',
  -- Environmental Behaviors
  'caring_for_pets', 'respecting_nature', 'reducing_waste', 'conserving_resources'
);

-- =====================================================
-- STORY LEARNING OUTCOMES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS story_learning_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,

  -- Vocabulary metrics
  sight_word_count INTEGER DEFAULT 0,
  vocabulary_count INTEGER DEFAULT 0,
  vocabulary_difficulty_avg NUMERIC(3,2) DEFAULT 2.0,

  -- Primary and secondary values
  primary_value core_value,
  secondary_values core_value[] DEFAULT '{}',

  -- Behavior lessons
  behavior_lessons behavior_lesson[] DEFAULT '{}',

  -- Difficulty scores (1-5)
  overall_difficulty SMALLINT DEFAULT 2 CHECK (overall_difficulty BETWEEN 1 AND 5),
  reading_complexity SMALLINT DEFAULT 2 CHECK (reading_complexity BETWEEN 1 AND 5),
  concept_complexity SMALLINT DEFAULT 2 CHECK (concept_complexity BETWEEN 1 AND 5),

  -- Learning time estimates
  estimated_learning_time_minutes INTEGER DEFAULT 5,
  recommended_discussion_time_minutes INTEGER DEFAULT 5,
  comprehension_question_count INTEGER DEFAULT 0,

  -- Metadata
  generated_by TEXT DEFAULT 'ai' CHECK (generated_by IN ('ai', 'human', 'hybrid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(story_id)
);

-- =====================================================
-- SIGHT WORDS IN STORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS story_sight_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  learning_outcomes_id UUID REFERENCES story_learning_outcomes(id) ON DELETE CASCADE,

  word TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  grade_level age_band,
  page_positions INTEGER[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(story_id, word)
);

-- =====================================================
-- VOCABULARY WORDS IN STORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS story_vocabulary_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  learning_outcomes_id UUID REFERENCES story_learning_outcomes(id) ON DELETE CASCADE,

  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  pronunciation TEXT,
  part_of_speech TEXT CHECK (part_of_speech IN ('noun', 'verb', 'adjective', 'adverb', 'other')),
  difficulty_level SMALLINT DEFAULT 2 CHECK (difficulty_level BETWEEN 1 AND 5),
  grade_level age_band,
  context_sentence TEXT,
  synonyms TEXT[] DEFAULT '{}',
  root_word TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(story_id, word)
);

-- =====================================================
-- VALUE LESSONS IN STORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS story_value_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  learning_outcomes_id UUID REFERENCES story_learning_outcomes(id) ON DELETE CASCADE,

  value core_value NOT NULL,
  lesson_summary TEXT NOT NULL,
  story_moment TEXT,
  character_models TEXT[] DEFAULT '{}',
  discussion_prompt TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SOCIAL SKILL LESSONS IN STORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS story_social_skill_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  learning_outcomes_id UUID REFERENCES story_learning_outcomes(id) ON DELETE CASCADE,

  skill social_skill NOT NULL,
  demonstration TEXT NOT NULL,
  characters_involved TEXT[] DEFAULT '{}',
  positive_outcome TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMOTIONAL SKILL LESSONS IN STORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS story_emotional_skill_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  learning_outcomes_id UUID REFERENCES story_learning_outcomes(id) ON DELETE CASCADE,

  skill emotional_skill NOT NULL,
  scenario TEXT NOT NULL,
  strategy_shown TEXT,
  outcome TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CURRICULUM STANDARDS ALIGNMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS story_curriculum_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  learning_outcomes_id UUID REFERENCES story_learning_outcomes(id) ON DELETE CASCADE,

  standard_code TEXT NOT NULL,
  framework TEXT NOT NULL,  -- e.g., 'Common Core', 'NGSS', 'CASEL SEL'
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(story_id, standard_code, framework)
);

-- =====================================================
-- CHILD LEARNING PROGRESS TRACKING
-- =====================================================

-- Track child's exposure to values
CREATE TABLE IF NOT EXISTS child_value_exposure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,

  value core_value NOT NULL,
  exposure_count INTEGER DEFAULT 1,
  first_encountered_at TIMESTAMPTZ DEFAULT NOW(),
  last_encountered_at TIMESTAMPTZ DEFAULT NOW(),
  stories_encountered UUID[] DEFAULT '{}',

  UNIQUE(child_profile_id, value)
);

-- Track child's social skill practice
CREATE TABLE IF NOT EXISTS child_social_skill_practice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,

  skill social_skill NOT NULL,
  practice_count INTEGER DEFAULT 1,
  first_practiced_at TIMESTAMPTZ DEFAULT NOW(),
  last_practiced_at TIMESTAMPTZ DEFAULT NOW(),
  stories_practiced UUID[] DEFAULT '{}',

  UNIQUE(child_profile_id, skill)
);

-- Track child's emotional skill practice
CREATE TABLE IF NOT EXISTS child_emotional_skill_practice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,

  skill emotional_skill NOT NULL,
  practice_count INTEGER DEFAULT 1,
  first_practiced_at TIMESTAMPTZ DEFAULT NOW(),
  last_practiced_at TIMESTAMPTZ DEFAULT NOW(),
  stories_practiced UUID[] DEFAULT '{}',

  UNIQUE(child_profile_id, skill)
);

-- Track child's vocabulary learning
CREATE TABLE IF NOT EXISTS child_vocabulary_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,

  word TEXT NOT NULL,
  exposure_count INTEGER DEFAULT 1,
  is_learned BOOLEAN DEFAULT FALSE,
  learned_at TIMESTAMPTZ,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  difficulty_level SMALLINT,
  definition TEXT,

  UNIQUE(child_profile_id, word)
);

-- Track curriculum standards progress
CREATE TABLE IF NOT EXISTS child_curriculum_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,

  standard_code TEXT NOT NULL,
  framework TEXT NOT NULL,
  stories_completed INTEGER DEFAULT 0,
  first_exposure_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(child_profile_id, standard_code, framework)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_story_learning_outcomes_story ON story_learning_outcomes(story_id);
CREATE INDEX idx_story_learning_outcomes_primary_value ON story_learning_outcomes(primary_value);
CREATE INDEX idx_story_learning_outcomes_difficulty ON story_learning_outcomes(overall_difficulty);

CREATE INDEX idx_story_sight_words_story ON story_sight_words(story_id);
CREATE INDEX idx_story_sight_words_word ON story_sight_words(word);

CREATE INDEX idx_story_vocabulary_words_story ON story_vocabulary_words(story_id);
CREATE INDEX idx_story_vocabulary_words_difficulty ON story_vocabulary_words(difficulty_level);

CREATE INDEX idx_story_value_lessons_story ON story_value_lessons(story_id);
CREATE INDEX idx_story_value_lessons_value ON story_value_lessons(value);

CREATE INDEX idx_story_social_skill_lessons_story ON story_social_skill_lessons(story_id);
CREATE INDEX idx_story_social_skill_lessons_skill ON story_social_skill_lessons(skill);

CREATE INDEX idx_story_emotional_skill_lessons_story ON story_emotional_skill_lessons(story_id);
CREATE INDEX idx_story_emotional_skill_lessons_skill ON story_emotional_skill_lessons(skill);

CREATE INDEX idx_child_value_exposure_child ON child_value_exposure(child_profile_id);
CREATE INDEX idx_child_value_exposure_value ON child_value_exposure(value);

CREATE INDEX idx_child_social_skill_practice_child ON child_social_skill_practice(child_profile_id);
CREATE INDEX idx_child_emotional_skill_practice_child ON child_emotional_skill_practice(child_profile_id);

CREATE INDEX idx_child_vocabulary_progress_child ON child_vocabulary_progress(child_profile_id);
CREATE INDEX idx_child_vocabulary_progress_learned ON child_vocabulary_progress(child_profile_id, is_learned);

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Story learning summary view
CREATE OR REPLACE VIEW story_learning_summary AS
SELECT
  s.id AS story_id,
  s.title,
  s.age_band,
  s.category,
  lo.primary_value,
  lo.secondary_values,
  lo.sight_word_count,
  lo.vocabulary_count,
  lo.vocabulary_difficulty_avg,
  lo.overall_difficulty,
  lo.reading_complexity,
  lo.concept_complexity,
  lo.behavior_lessons,
  lo.estimated_learning_time_minutes,
  lo.comprehension_question_count,
  (SELECT COUNT(*) FROM story_value_lessons vl WHERE vl.story_id = s.id) AS value_lesson_count,
  (SELECT COUNT(*) FROM story_social_skill_lessons ssl WHERE ssl.story_id = s.id) AS social_skill_count,
  (SELECT COUNT(*) FROM story_emotional_skill_lessons esl WHERE esl.story_id = s.id) AS emotional_skill_count,
  (SELECT array_agg(DISTINCT vl.value) FROM story_value_lessons vl WHERE vl.story_id = s.id) AS values_taught,
  (SELECT array_agg(DISTINCT ssl.skill) FROM story_social_skill_lessons ssl WHERE ssl.story_id = s.id) AS social_skills_taught,
  (SELECT array_agg(DISTINCT esl.skill) FROM story_emotional_skill_lessons esl WHERE esl.story_id = s.id) AS emotional_skills_taught
FROM stories s
LEFT JOIN story_learning_outcomes lo ON s.id = lo.story_id;

-- Child learning progress summary view
CREATE OR REPLACE VIEW child_learning_progress_summary AS
SELECT
  cp.id AS child_id,
  cp.name AS child_name,
  cp.age_band,
  -- Sight word progress
  (SELECT COUNT(*) FROM sight_word_exposures swe WHERE swe.child_profile_id = cp.id AND swe.is_mastered = true) AS sight_words_mastered,
  (SELECT COUNT(*) FROM sight_word_exposures swe WHERE swe.child_profile_id = cp.id AND swe.is_mastered = false) AS sight_words_in_progress,
  -- Vocabulary progress
  (SELECT COUNT(*) FROM child_vocabulary_progress cvp WHERE cvp.child_profile_id = cp.id AND cvp.is_learned = true) AS vocabulary_words_learned,
  (SELECT COUNT(*) FROM child_vocabulary_progress cvp WHERE cvp.child_profile_id = cp.id) AS vocabulary_words_exposed,
  -- Values exposure
  (SELECT COUNT(DISTINCT value) FROM child_value_exposure cve WHERE cve.child_profile_id = cp.id) AS unique_values_encountered,
  (SELECT SUM(exposure_count) FROM child_value_exposure cve WHERE cve.child_profile_id = cp.id) AS total_value_exposures,
  -- Skills practice
  (SELECT COUNT(DISTINCT skill) FROM child_social_skill_practice cssp WHERE cssp.child_profile_id = cp.id) AS social_skills_practiced,
  (SELECT COUNT(DISTINCT skill) FROM child_emotional_skill_practice cesp WHERE cesp.child_profile_id = cp.id) AS emotional_skills_practiced,
  -- Standards progress
  (SELECT COUNT(DISTINCT standard_code) FROM child_curriculum_progress ccp WHERE ccp.child_profile_id = cp.id) AS curriculum_standards_touched
FROM child_profiles cp;

-- Value coverage by age band view
CREATE OR REPLACE VIEW value_coverage_by_age_band AS
SELECT
  s.age_band,
  lo.primary_value AS value,
  COUNT(DISTINCT s.id) AS story_count,
  AVG(lo.overall_difficulty) AS avg_difficulty
FROM stories s
JOIN story_learning_outcomes lo ON s.id = lo.story_id
WHERE lo.primary_value IS NOT NULL
GROUP BY s.age_band, lo.primary_value
ORDER BY s.age_band, story_count DESC;

-- Classroom learning analytics view (for B2B)
CREATE OR REPLACE VIEW classroom_learning_analytics AS
SELECT
  c.id AS classroom_id,
  c.name AS classroom_name,
  c.grade_level,
  COUNT(DISTINCT cp.id) AS student_count,
  -- Aggregate sight words
  SUM((SELECT COUNT(*) FROM sight_word_exposures swe WHERE swe.child_profile_id = cp.id AND swe.is_mastered = true)) AS total_sight_words_mastered,
  -- Aggregate values
  (SELECT COUNT(DISTINCT cve.value)
   FROM child_value_exposure cve
   JOIN child_profiles cp2 ON cve.child_profile_id = cp2.id
   JOIN classroom_students cs2 ON cp2.id = cs2.child_profile_id
   WHERE cs2.classroom_id = c.id) AS unique_values_class_encountered,
  -- Average vocabulary
  AVG((SELECT COUNT(*) FROM child_vocabulary_progress cvp WHERE cvp.child_profile_id = cp.id AND cvp.is_learned = true)) AS avg_vocabulary_learned
FROM classrooms c
LEFT JOIN classroom_students cs ON c.id = cs.classroom_id
LEFT JOIN child_profiles cp ON cs.child_profile_id = cp.id
GROUP BY c.id, c.name, c.grade_level;

-- =====================================================
-- FUNCTIONS FOR LEARNING OUTCOMES
-- =====================================================

-- Function to update child's value exposure after reading a story
CREATE OR REPLACE FUNCTION update_child_value_exposure(
  p_child_id UUID,
  p_story_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_value core_value;
BEGIN
  -- Get primary value from story
  SELECT primary_value INTO v_value
  FROM story_learning_outcomes
  WHERE story_id = p_story_id;

  IF v_value IS NOT NULL THEN
    INSERT INTO child_value_exposure (child_profile_id, value, exposure_count, stories_encountered)
    VALUES (p_child_id, v_value, 1, ARRAY[p_story_id])
    ON CONFLICT (child_profile_id, value) DO UPDATE SET
      exposure_count = child_value_exposure.exposure_count + 1,
      last_encountered_at = NOW(),
      stories_encountered = array_append(
        CASE
          WHEN p_story_id = ANY(child_value_exposure.stories_encountered) THEN child_value_exposure.stories_encountered
          ELSE child_value_exposure.stories_encountered
        END,
        CASE
          WHEN p_story_id = ANY(child_value_exposure.stories_encountered) THEN NULL
          ELSE p_story_id
        END
      );
  END IF;

  -- Also handle secondary values
  FOR v_value IN
    SELECT unnest(secondary_values)
    FROM story_learning_outcomes
    WHERE story_id = p_story_id
  LOOP
    INSERT INTO child_value_exposure (child_profile_id, value, exposure_count, stories_encountered)
    VALUES (p_child_id, v_value, 1, ARRAY[p_story_id])
    ON CONFLICT (child_profile_id, value) DO UPDATE SET
      exposure_count = child_value_exposure.exposure_count + 1,
      last_encountered_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended stories based on learning gaps
CREATE OR REPLACE FUNCTION get_learning_gap_recommendations(
  p_child_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  story_id UUID,
  title TEXT,
  recommended_value core_value,
  child_exposure_count INTEGER,
  recommendation_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH child_value_counts AS (
    SELECT
      cve.value,
      cve.exposure_count
    FROM child_value_exposure cve
    WHERE cve.child_profile_id = p_child_id
  ),
  all_values AS (
    SELECT DISTINCT lo.primary_value AS value
    FROM story_learning_outcomes lo
    WHERE lo.primary_value IS NOT NULL
  ),
  value_gaps AS (
    SELECT
      av.value,
      COALESCE(cvc.exposure_count, 0) AS current_exposure
    FROM all_values av
    LEFT JOIN child_value_counts cvc ON av.value = cvc.value
    ORDER BY COALESCE(cvc.exposure_count, 0) ASC
    LIMIT 3
  )
  SELECT
    s.id,
    s.title,
    lo.primary_value,
    vg.current_exposure::INTEGER,
    CASE
      WHEN vg.current_exposure = 0 THEN 'New value to explore'
      ELSE 'Reinforce learning'
    END AS reason
  FROM value_gaps vg
  JOIN story_learning_outcomes lo ON lo.primary_value = vg.value
  JOIN stories s ON s.id = lo.story_id
  JOIN child_profiles cp ON cp.id = p_child_id
  WHERE s.age_band = cp.age_band
  ORDER BY vg.current_exposure ASC, random()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger for learning outcomes
CREATE OR REPLACE FUNCTION update_learning_outcomes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_story_learning_outcomes_updated
  BEFORE UPDATE ON story_learning_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_outcomes_timestamp();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE story_learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_sight_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_value_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_social_skill_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_emotional_skill_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_curriculum_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_value_exposure ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_social_skill_practice ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_emotional_skill_practice ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_curriculum_progress ENABLE ROW LEVEL SECURITY;

-- Public read access to story learning data
CREATE POLICY "Public read access to story learning outcomes"
  ON story_learning_outcomes FOR SELECT
  USING (true);

CREATE POLICY "Public read access to story sight words"
  ON story_sight_words FOR SELECT
  USING (true);

CREATE POLICY "Public read access to story vocabulary"
  ON story_vocabulary_words FOR SELECT
  USING (true);

CREATE POLICY "Public read access to value lessons"
  ON story_value_lessons FOR SELECT
  USING (true);

CREATE POLICY "Public read access to social skill lessons"
  ON story_social_skill_lessons FOR SELECT
  USING (true);

CREATE POLICY "Public read access to emotional skill lessons"
  ON story_emotional_skill_lessons FOR SELECT
  USING (true);

CREATE POLICY "Public read access to curriculum standards"
  ON story_curriculum_standards FOR SELECT
  USING (true);

-- Child learning progress - parent access only
CREATE POLICY "Parents can view their children's value exposure"
  ON child_value_exposure FOR SELECT
  USING (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's social skill practice"
  ON child_social_skill_practice FOR SELECT
  USING (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's emotional skill practice"
  ON child_emotional_skill_practice FOR SELECT
  USING (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's vocabulary progress"
  ON child_vocabulary_progress FOR SELECT
  USING (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's curriculum progress"
  ON child_curriculum_progress FOR SELECT
  USING (
    child_profile_id IN (
      SELECT id FROM child_profiles WHERE parent_user_id = auth.uid()
    )
  );

-- Teachers can view their classroom students' progress
CREATE POLICY "Teachers can view classroom students value exposure"
  ON child_value_exposure FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classrooms c
      JOIN classroom_students cs ON c.id = cs.classroom_id
      WHERE cs.child_profile_id = child_value_exposure.child_profile_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view classroom students social skill practice"
  ON child_social_skill_practice FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classrooms c
      JOIN classroom_students cs ON c.id = cs.classroom_id
      WHERE cs.child_profile_id = child_social_skill_practice.child_profile_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view classroom students emotional skill practice"
  ON child_emotional_skill_practice FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classrooms c
      JOIN classroom_students cs ON c.id = cs.classroom_id
      WHERE cs.child_profile_id = child_emotional_skill_practice.child_profile_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view classroom students vocabulary progress"
  ON child_vocabulary_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classrooms c
      JOIN classroom_students cs ON c.id = cs.classroom_id
      WHERE cs.child_profile_id = child_vocabulary_progress.child_profile_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view classroom students curriculum progress"
  ON child_curriculum_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classrooms c
      JOIN classroom_students cs ON c.id = cs.classroom_id
      WHERE cs.child_profile_id = child_curriculum_progress.child_profile_id
      AND c.teacher_id = auth.uid()
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE story_learning_outcomes IS 'Stores learning outcomes metadata for each story';
COMMENT ON TABLE story_sight_words IS 'Tracks sight words used in each story with frequency';
COMMENT ON TABLE story_vocabulary_words IS 'Stores vocabulary words introduced in stories';
COMMENT ON TABLE story_value_lessons IS 'Value/character lessons embedded in stories';
COMMENT ON TABLE story_social_skill_lessons IS 'Social skills modeled in stories';
COMMENT ON TABLE story_emotional_skill_lessons IS 'Emotional skills demonstrated in stories';
COMMENT ON TABLE story_curriculum_standards IS 'Curriculum standards aligned with stories';

COMMENT ON TABLE child_value_exposure IS 'Tracks child exposure to different values through stories';
COMMENT ON TABLE child_social_skill_practice IS 'Tracks child practice of social skills';
COMMENT ON TABLE child_emotional_skill_practice IS 'Tracks child practice of emotional skills';
COMMENT ON TABLE child_vocabulary_progress IS 'Tracks child vocabulary learning progress';
COMMENT ON TABLE child_curriculum_progress IS 'Tracks child progress on curriculum standards';

COMMENT ON VIEW story_learning_summary IS 'Summary view of learning outcomes for all stories';
COMMENT ON VIEW child_learning_progress_summary IS 'Summary view of child learning progress';
COMMENT ON VIEW value_coverage_by_age_band IS 'Shows value coverage across age bands';
COMMENT ON VIEW classroom_learning_analytics IS 'Aggregated learning analytics by classroom';

COMMENT ON FUNCTION update_child_value_exposure IS 'Updates child value exposure after reading a story';
COMMENT ON FUNCTION get_learning_gap_recommendations IS 'Recommends stories based on learning gaps';
