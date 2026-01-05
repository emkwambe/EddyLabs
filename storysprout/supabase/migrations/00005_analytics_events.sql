-- =====================================================
-- StorySprout Analytics Events Schema
-- Migration: 00005_analytics_events.sql
-- Description: Add analytics events tracking infrastructure
-- =====================================================

-- =====================================================
-- ANALYTICS EVENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('reading', 'engagement', 'learning', 'navigation', 'interaction', 'achievement', 'error', 'performance')),

  -- User context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,

  -- Event data
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  page_number INTEGER,
  reading_mode TEXT,
  duration_seconds INTEGER,
  words_read INTEGER,

  -- Device info
  platform TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,

  -- Flexible metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  event_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- READING SESSIONS ANALYTICS
-- =====================================================

-- Enhanced reading session stats
CREATE TABLE IF NOT EXISTS reading_session_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_session_id UUID REFERENCES reading_sessions(id) ON DELETE CASCADE,
  child_profile_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,

  -- Reading metrics
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  total_duration_seconds INTEGER,
  active_reading_seconds INTEGER,  -- Time actually reading (excluding pauses)
  pages_viewed INTEGER DEFAULT 0,
  pages_completed INTEGER DEFAULT 0,

  -- Reading speed
  words_read INTEGER DEFAULT 0,
  words_per_minute NUMERIC(6,2),
  reading_speed_percentile INTEGER,  -- Compared to age group

  -- Engagement metrics
  pause_count INTEGER DEFAULT 0,
  total_pause_duration_seconds INTEGER DEFAULT 0,
  word_taps INTEGER DEFAULT 0,
  audio_plays INTEGER DEFAULT 0,
  bookmarks_added INTEGER DEFAULT 0,

  -- Page-level data
  page_durations JSONB DEFAULT '[]',  -- Array of {page: number, duration: seconds}
  slowest_page INTEGER,
  fastest_page INTEGER,

  -- Completion
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  abandoned_at_page INTEGER,

  -- Reading mode
  reading_mode TEXT,
  mode_switches INTEGER DEFAULT 0,

  -- Device context
  device_type TEXT,
  platform TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- READING PERFORMANCE METRICS
-- =====================================================

-- Child reading performance over time
CREATE TABLE IF NOT EXISTS child_reading_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,

  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),

  -- Reading volume
  stories_started INTEGER DEFAULT 0,
  stories_completed INTEGER DEFAULT 0,
  total_reading_minutes INTEGER DEFAULT 0,
  total_words_read INTEGER DEFAULT 0,
  total_pages_read INTEGER DEFAULT 0,

  -- Performance metrics
  avg_words_per_minute NUMERIC(6,2),
  avg_session_duration_minutes NUMERIC(6,2),
  avg_completion_rate NUMERIC(5,2),

  -- Engagement
  total_sessions INTEGER DEFAULT 0,
  reading_days INTEGER DEFAULT 0,  -- Days with at least one session
  longest_session_minutes INTEGER,

  -- Improvement tracking
  wpm_change_from_previous NUMERIC(6,2),  -- Change from previous period
  completion_rate_change NUMERIC(5,2),

  -- Learning
  sight_words_mastered INTEGER DEFAULT 0,
  vocabulary_words_learned INTEGER DEFAULT 0,
  values_encountered INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(child_profile_id, period_start, period_type)
);

-- =====================================================
-- CONTENT PERFORMANCE METRICS
-- =====================================================

-- Story performance analytics
CREATE TABLE IF NOT EXISTS story_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,

  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'all_time')),

  -- Engagement metrics
  total_views INTEGER DEFAULT 0,
  unique_readers INTEGER DEFAULT 0,
  total_starts INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  completion_rate NUMERIC(5,2),

  -- Reading metrics
  avg_reading_time_seconds INTEGER,
  avg_pages_per_session NUMERIC(5,2),
  total_reading_time_seconds INTEGER DEFAULT 0,

  -- Popularity
  favorites_count INTEGER DEFAULT 0,
  re_reads INTEGER DEFAULT 0,  -- Times read more than once by same child

  -- Engagement quality
  avg_engagement_score NUMERIC(5,2),  -- Based on completion, time, interaction
  bounce_rate NUMERIC(5,2),  -- Started but abandoned quickly

  -- Page-level insights
  most_abandoned_page INTEGER,
  avg_time_per_page_seconds NUMERIC(6,2),

  -- Demographics
  age_band_distribution JSONB DEFAULT '{}',  -- {pre_k: 10, k_prep: 15, ...}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(story_id, period_start, period_type)
);

-- Category performance
CREATE TABLE IF NOT EXISTS category_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL,

  total_stories INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  unique_readers INTEGER DEFAULT 0,
  avg_completion_rate NUMERIC(5,2),
  most_popular_story_id UUID REFERENCES stories(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(category, period_start, period_type)
);

-- =====================================================
-- CLASSROOM ANALYTICS
-- =====================================================

-- Classroom reading analytics
CREATE TABLE IF NOT EXISTS classroom_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL,

  -- Student metrics
  active_students INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  students_met_goal INTEGER DEFAULT 0,

  -- Reading volume
  total_reading_minutes INTEGER DEFAULT 0,
  avg_reading_minutes_per_student NUMERIC(6,2),
  total_stories_completed INTEGER DEFAULT 0,

  -- Performance
  avg_words_per_minute NUMERIC(6,2),
  avg_completion_rate NUMERIC(5,2),

  -- Learning outcomes
  total_sight_words_mastered INTEGER DEFAULT 0,
  total_vocabulary_learned INTEGER DEFAULT 0,
  values_encountered JSONB DEFAULT '[]',

  -- Engagement
  avg_sessions_per_student NUMERIC(5,2),
  avg_streak_days NUMERIC(5,2),

  -- Top performers
  top_readers JSONB DEFAULT '[]',  -- Array of {child_id, minutes, stories}

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(classroom_id, period_start, period_type)
);

-- School-wide analytics
CREATE TABLE IF NOT EXISTS school_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL,

  -- Classroom metrics
  active_classrooms INTEGER DEFAULT 0,
  total_classrooms INTEGER DEFAULT 0,

  -- Student metrics
  active_students INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,

  -- Reading volume
  total_reading_minutes INTEGER DEFAULT 0,
  total_stories_completed INTEGER DEFAULT 0,

  -- Performance
  avg_completion_rate NUMERIC(5,2),
  students_above_benchmark INTEGER DEFAULT 0,

  -- Learning outcomes
  curriculum_standards_covered INTEGER DEFAULT 0,

  -- Top classrooms
  top_classrooms JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(school_id, period_start, period_type)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Analytics events indexes
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_child ON analytics_events(child_profile_id);
CREATE INDEX idx_analytics_events_story ON analytics_events(story_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_category ON analytics_events(category);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(event_timestamp);
CREATE INDEX idx_analytics_events_org ON analytics_events(organization_id);

-- Reading session analytics indexes
CREATE INDEX idx_reading_session_analytics_child ON reading_session_analytics(child_profile_id);
CREATE INDEX idx_reading_session_analytics_story ON reading_session_analytics(story_id);
CREATE INDEX idx_reading_session_analytics_started ON reading_session_analytics(started_at);

-- Performance indexes
CREATE INDEX idx_child_reading_performance_child ON child_reading_performance(child_profile_id);
CREATE INDEX idx_child_reading_performance_period ON child_reading_performance(period_start, period_type);

CREATE INDEX idx_story_performance_story ON story_performance_metrics(story_id);
CREATE INDEX idx_story_performance_period ON story_performance_metrics(period_start, period_type);

CREATE INDEX idx_classroom_analytics_classroom ON classroom_analytics(classroom_id);
CREATE INDEX idx_school_analytics_school ON school_analytics(school_id);

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Real-time reading activity view
CREATE OR REPLACE VIEW active_reading_sessions AS
SELECT
  rsa.id,
  rsa.child_profile_id,
  cp.name AS child_name,
  rsa.story_id,
  s.title AS story_title,
  rsa.started_at,
  rsa.reading_mode,
  rsa.pages_viewed,
  rsa.words_read,
  rsa.completion_percentage,
  EXTRACT(EPOCH FROM (NOW() - rsa.started_at))::INTEGER AS elapsed_seconds
FROM reading_session_analytics rsa
JOIN child_profiles cp ON rsa.child_profile_id = cp.id
JOIN stories s ON rsa.story_id = s.id
WHERE rsa.ended_at IS NULL
  AND rsa.started_at > NOW() - INTERVAL '1 hour';

-- Child reading performance summary
CREATE OR REPLACE VIEW child_performance_summary AS
SELECT
  cp.id AS child_id,
  cp.name,
  cp.age_band,
  -- Current week metrics
  cw.total_reading_minutes AS this_week_minutes,
  cw.stories_completed AS this_week_stories,
  cw.avg_words_per_minute AS current_wpm,
  -- Previous week comparison
  pw.total_reading_minutes AS last_week_minutes,
  pw.avg_words_per_minute AS last_week_wpm,
  -- Progress
  CASE
    WHEN pw.avg_words_per_minute > 0 THEN
      ROUND(((cw.avg_words_per_minute - pw.avg_words_per_minute) / pw.avg_words_per_minute * 100)::numeric, 1)
    ELSE 0
  END AS wpm_improvement_percent,
  -- Reading level
  CASE
    WHEN cw.avg_words_per_minute >= 150 THEN 'Advanced'
    WHEN cw.avg_words_per_minute >= 100 THEN 'Proficient'
    WHEN cw.avg_words_per_minute >= 60 THEN 'Developing'
    ELSE 'Emerging'
  END AS reading_level
FROM child_profiles cp
LEFT JOIN child_reading_performance cw ON cp.id = cw.child_profile_id
  AND cw.period_type = 'weekly'
  AND cw.period_start = date_trunc('week', CURRENT_DATE)::date
LEFT JOIN child_reading_performance pw ON cp.id = pw.child_profile_id
  AND pw.period_type = 'weekly'
  AND pw.period_start = (date_trunc('week', CURRENT_DATE) - INTERVAL '1 week')::date;

-- Popular stories view
CREATE OR REPLACE VIEW popular_stories AS
SELECT
  s.id,
  s.title,
  s.category,
  s.age_band,
  spm.total_views,
  spm.unique_readers,
  spm.completion_rate,
  spm.avg_engagement_score,
  spm.favorites_count,
  spm.re_reads,
  RANK() OVER (PARTITION BY s.age_band ORDER BY spm.total_views DESC) AS rank_in_age_band
FROM stories s
JOIN story_performance_metrics spm ON s.id = spm.story_id
WHERE spm.period_type = 'all_time';

-- Classroom leaderboard view
CREATE OR REPLACE VIEW classroom_leaderboard AS
SELECT
  c.id AS classroom_id,
  c.name AS classroom_name,
  s.name AS school_name,
  ca.period_start,
  ca.total_reading_minutes,
  ca.avg_reading_minutes_per_student,
  ca.students_met_goal,
  ca.total_students,
  ROUND((ca.students_met_goal::numeric / NULLIF(ca.total_students, 0) * 100), 1) AS goal_achievement_rate,
  ca.avg_completion_rate,
  RANK() OVER (
    PARTITION BY ca.period_type
    ORDER BY ca.avg_reading_minutes_per_student DESC
  ) AS rank_by_avg_minutes
FROM classrooms c
JOIN schools s ON c.school_id = s.id
JOIN classroom_analytics ca ON c.id = ca.classroom_id
WHERE ca.period_type = 'weekly';

-- =====================================================
-- FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Function to calculate reading speed percentile
CREATE OR REPLACE FUNCTION calculate_reading_speed_percentile(
  p_child_id UUID,
  p_wpm NUMERIC
)
RETURNS INTEGER AS $$
DECLARE
  v_age_band age_band;
  v_percentile INTEGER;
BEGIN
  SELECT age_band INTO v_age_band FROM child_profiles WHERE id = p_child_id;

  SELECT
    ROUND(PERCENT_RANK() OVER (ORDER BY avg_words_per_minute) * 100)::INTEGER
  INTO v_percentile
  FROM child_reading_performance
  WHERE child_profile_id IN (
    SELECT id FROM child_profiles WHERE age_band = v_age_band
  )
  AND period_type = 'weekly'
  AND period_start = date_trunc('week', CURRENT_DATE)::date;

  RETURN COALESCE(v_percentile, 50);
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate daily analytics into weekly/monthly
CREATE OR REPLACE FUNCTION aggregate_reading_performance(
  p_period_type TEXT,
  p_target_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  -- Calculate period boundaries
  IF p_period_type = 'weekly' THEN
    v_period_start := date_trunc('week', p_target_date)::date;
    v_period_end := v_period_start + INTERVAL '6 days';
  ELSIF p_period_type = 'monthly' THEN
    v_period_start := date_trunc('month', p_target_date)::date;
    v_period_end := (date_trunc('month', p_target_date) + INTERVAL '1 month - 1 day')::date;
  ELSE
    RAISE EXCEPTION 'Invalid period_type: %', p_period_type;
  END IF;

  -- Aggregate for each child
  INSERT INTO child_reading_performance (
    child_profile_id, period_start, period_end, period_type,
    stories_started, stories_completed, total_reading_minutes,
    total_words_read, total_pages_read, avg_words_per_minute,
    avg_session_duration_minutes, avg_completion_rate, total_sessions,
    reading_days
  )
  SELECT
    rsa.child_profile_id,
    v_period_start,
    v_period_end,
    p_period_type,
    COUNT(DISTINCT rsa.story_id) FILTER (WHERE rsa.started_at IS NOT NULL),
    COUNT(*) FILTER (WHERE rsa.is_completed = true),
    COALESCE(SUM(rsa.total_duration_seconds) / 60, 0),
    COALESCE(SUM(rsa.words_read), 0),
    COALESCE(SUM(rsa.pages_completed), 0),
    AVG(rsa.words_per_minute),
    AVG(rsa.total_duration_seconds) / 60,
    AVG(rsa.completion_percentage),
    COUNT(*),
    COUNT(DISTINCT DATE(rsa.started_at))
  FROM reading_session_analytics rsa
  WHERE rsa.started_at >= v_period_start
    AND rsa.started_at < v_period_end + INTERVAL '1 day'
  GROUP BY rsa.child_profile_id
  ON CONFLICT (child_profile_id, period_start, period_type) DO UPDATE SET
    stories_started = EXCLUDED.stories_started,
    stories_completed = EXCLUDED.stories_completed,
    total_reading_minutes = EXCLUDED.total_reading_minutes,
    total_words_read = EXCLUDED.total_words_read,
    total_pages_read = EXCLUDED.total_pages_read,
    avg_words_per_minute = EXCLUDED.avg_words_per_minute,
    avg_session_duration_minutes = EXCLUDED.avg_session_duration_minutes,
    avg_completion_rate = EXCLUDED.avg_completion_rate,
    total_sessions = EXCLUDED.total_sessions,
    reading_days = EXCLUDED.reading_days;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate story engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(
  p_completion_rate NUMERIC,
  p_avg_time_seconds INTEGER,
  p_expected_time_seconds INTEGER,
  p_favorites INTEGER,
  p_re_reads INTEGER
)
RETURNS NUMERIC AS $$
DECLARE
  v_completion_score NUMERIC;
  v_time_score NUMERIC;
  v_engagement_score NUMERIC;
BEGIN
  -- Completion contributes 40%
  v_completion_score := LEAST(p_completion_rate, 100) * 0.4;

  -- Time spent contributes 30% (optimal is around expected time)
  IF p_expected_time_seconds > 0 THEN
    v_time_score := LEAST(
      (p_avg_time_seconds::NUMERIC / p_expected_time_seconds) * 30,
      30
    );
  ELSE
    v_time_score := 15;
  END IF;

  -- Re-reads and favorites contribute 30%
  v_engagement_score := LEAST((p_favorites * 2 + p_re_reads * 3), 30);

  RETURN ROUND(v_completion_score + v_time_score + v_engagement_score, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_reading_session_analytics_updated
  BEFORE UPDATE ON reading_session_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER tr_story_performance_updated
  BEFORE UPDATE ON story_performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_timestamp();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_reading_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_analytics ENABLE ROW LEVEL SECURITY;

-- Parents can view their children's analytics
CREATE POLICY "Parents view children analytics events"
  ON analytics_events FOR SELECT
  USING (
    user_id = auth.uid() OR
    child_profile_id IN (SELECT id FROM child_profiles WHERE parent_user_id = auth.uid())
  );

CREATE POLICY "Parents view children reading analytics"
  ON reading_session_analytics FOR SELECT
  USING (
    child_profile_id IN (SELECT id FROM child_profiles WHERE parent_user_id = auth.uid())
  );

CREATE POLICY "Parents view children performance"
  ON child_reading_performance FOR SELECT
  USING (
    child_profile_id IN (SELECT id FROM child_profiles WHERE parent_user_id = auth.uid())
  );

-- Public read for story performance (aggregate data)
CREATE POLICY "Public read story performance"
  ON story_performance_metrics FOR SELECT
  USING (true);

-- Teachers can view classroom analytics
CREATE POLICY "Teachers view classroom analytics"
  ON classroom_analytics FOR SELECT
  USING (
    classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid())
  );

-- School admins can view school analytics
CREATE POLICY "School admins view school analytics"
  ON school_analytics FOR SELECT
  USING (
    school_id IN (
      SELECT s.id FROM schools s
      JOIN user_accounts ua ON ua.school_id = s.id
      WHERE ua.user_id = auth.uid() AND ua.role = 'school_admin'
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE analytics_events IS 'Raw analytics events for user behavior tracking';
COMMENT ON TABLE reading_session_analytics IS 'Detailed analytics for each reading session';
COMMENT ON TABLE child_reading_performance IS 'Aggregated reading performance by time period';
COMMENT ON TABLE story_performance_metrics IS 'Content performance metrics by story';
COMMENT ON TABLE classroom_analytics IS 'Aggregated classroom-level analytics';
COMMENT ON TABLE school_analytics IS 'Aggregated school-level analytics';

COMMENT ON VIEW active_reading_sessions IS 'Currently active reading sessions';
COMMENT ON VIEW child_performance_summary IS 'Child reading performance with week-over-week comparison';
COMMENT ON VIEW popular_stories IS 'Most popular stories by various metrics';
COMMENT ON VIEW classroom_leaderboard IS 'Classroom rankings by reading metrics';
