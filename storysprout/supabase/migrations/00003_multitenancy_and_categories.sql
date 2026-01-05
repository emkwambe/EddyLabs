-- StorySprout Multi-tenancy & Extended Categories Migration
-- Adds school/organization support for B2B adoption
-- Syncs story_category ENUM with TypeScript types

-- =====================================================
-- EXTENDED STORY CATEGORIES
-- =====================================================

-- Backup and recreate story_category ENUM with all categories
ALTER TYPE story_category RENAME TO story_category_old;

CREATE TYPE story_category AS ENUM (
  -- Original Categories
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
  'social_emotional',
  -- Extended Global Categories
  'world_cultures',
  'geography_adventures',
  'historical_fiction',
  'mythology_folklore',
  'global_citizenship',
  'environmental',
  'stem_stories',
  'biography',
  'coming_of_age',
  'social_issues',
  -- Curriculum-aligned Categories
  'curriculum',
  'seasonal',
  'cultural',
  'school'
);

-- Update existing columns
ALTER TABLE stories
  ALTER COLUMN category TYPE story_category USING category::text::story_category;

ALTER TABLE parent_settings
  ALTER COLUMN allowed_categories TYPE story_category[]
  USING allowed_categories::text[]::story_category[];

DROP TYPE story_category_old;

-- =====================================================
-- ORGANIZATION TYPES (MULTI-TENANCY)
-- =====================================================

CREATE TYPE organization_type AS ENUM (
  'individual',       -- B2C individual/family account
  'school',           -- Single school
  'district',         -- School district (multiple schools)
  'homeschool_coop',  -- Homeschool cooperative
  'library',          -- Public library
  'nonprofit',        -- Educational nonprofit
  'enterprise'        -- Large organization
);

CREATE TYPE subscription_tier AS ENUM (
  'free',             -- Limited features
  'family',           -- Family subscription (B2C)
  'classroom',        -- Single classroom
  'school',           -- Whole school
  'district',         -- District-wide
  'enterprise'        -- Custom enterprise
);

CREATE TYPE user_role AS ENUM (
  'parent',           -- Parent/guardian (B2C)
  'student',          -- Student account
  'teacher',          -- Teacher
  'school_admin',     -- School administrator
  'district_admin',   -- District administrator
  'content_creator',  -- Story creator
  'moderator',        -- Content moderator
  'super_admin'       -- Platform admin
);

CREATE TYPE classroom_type AS ENUM (
  'standard',         -- Regular classroom
  'special_ed',       -- Special education
  'ell',              -- English Language Learners
  'gifted',           -- Gifted & talented
  'mixed_grade',      -- Multi-grade classroom
  'intervention'      -- Reading intervention
);

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type organization_type NOT NULL DEFAULT 'individual',

  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country_code CHAR(2) DEFAULT 'US',

  -- Subscription
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  subscription_started_at TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  max_seats INTEGER DEFAULT 5,
  used_seats INTEGER DEFAULT 0,

  -- Settings
  settings JSONB DEFAULT '{}',
  content_policies JSONB DEFAULT '{}',
  allowed_categories story_category[] DEFAULT ARRAY[
    'adventure', 'animals', 'bedtime', 'educational', 'family',
    'fantasy', 'friendship', 'holidays', 'humor', 'nature',
    'science', 'social_emotional', 'world_cultures', 'stem_stories'
  ]::story_category[],

  -- Branding (white-label)
  logo_url TEXT,
  primary_color TEXT DEFAULT '#22c55e',
  secondary_color TEXT DEFAULT '#16a34a',

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SCHOOLS TABLE (for districts with multiple schools)
-- =====================================================

CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  school_code TEXT,

  -- Contact
  principal_name TEXT,
  email TEXT,
  phone TEXT,

  -- Address
  address_line1 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,

  -- Academic Info
  grade_levels_served age_band[] NOT NULL DEFAULT ARRAY['grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5']::age_band[],
  student_count INTEGER DEFAULT 0,
  teacher_count INTEGER DEFAULT 0,

  -- Settings (override org settings)
  settings JSONB DEFAULT '{}',

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER ACCOUNTS (unified for all user types)
-- =====================================================

CREATE TABLE user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Organization association
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,

  -- Profile
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'parent',

  -- For students
  grade_level age_band,
  student_id TEXT,

  -- Permissions
  permissions JSONB DEFAULT '{}',

  -- Metadata
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id),
  UNIQUE(organization_id, email)
);

-- =====================================================
-- CLASSROOMS TABLE
-- =====================================================

CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  class_code TEXT UNIQUE,
  classroom_type classroom_type DEFAULT 'standard',
  grade_level age_band NOT NULL,
  academic_year TEXT, -- e.g., '2024-2025'

  -- Teacher
  teacher_id UUID REFERENCES user_accounts(id) ON DELETE SET NULL,
  co_teacher_id UUID REFERENCES user_accounts(id) ON DELETE SET NULL,

  -- Settings
  reading_goal_minutes_per_week INTEGER DEFAULT 100,
  allowed_categories story_category[],
  curriculum_standards TEXT[], -- e.g., ['CCSS.ELA-LITERACY.RL.3.1']

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CLASSROOM STUDENTS (junction table)
-- =====================================================

CREATE TABLE classroom_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,

  -- Student status in classroom
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active', -- active, inactive, transferred

  UNIQUE(classroom_id, student_id)
);

-- =====================================================
-- ASSIGNMENTS TABLE
-- =====================================================

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES user_accounts(id),

  -- Assignment details
  title TEXT NOT NULL,
  description TEXT,

  -- Story requirements
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  category story_category,
  min_reading_time_minutes INTEGER DEFAULT 10,

  -- Dates
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ,

  -- Comprehension questions (optional)
  questions JSONB DEFAULT '[]',

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ASSIGNMENT SUBMISSIONS
-- =====================================================

CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,

  -- Completion
  story_id UUID REFERENCES stories(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  reading_time_seconds INTEGER DEFAULT 0,

  -- Comprehension
  answers JSONB DEFAULT '{}',
  score FLOAT,

  -- Teacher feedback
  teacher_feedback TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES user_accounts(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(assignment_id, student_id)
);

-- =====================================================
-- CURRICULUM STANDARDS
-- =====================================================

CREATE TABLE curriculum_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Standard identification
  standard_code TEXT UNIQUE NOT NULL, -- e.g., 'CCSS.ELA-LITERACY.RL.3.1'
  framework TEXT NOT NULL, -- e.g., 'CCSS', 'NGSS', 'State-TX'

  -- Details
  grade_level age_band NOT NULL,
  subject TEXT NOT NULL, -- 'Reading', 'Science', 'Social Studies'
  domain TEXT, -- e.g., 'Key Ideas and Details'
  description TEXT NOT NULL,

  -- Mapping to categories
  related_categories story_category[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STORY CURRICULUM MAPPING
-- =====================================================

CREATE TABLE story_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  standard_id UUID NOT NULL REFERENCES curriculum_standards(id) ON DELETE CASCADE,
  alignment_strength TEXT DEFAULT 'primary', -- primary, secondary, supplementary

  UNIQUE(story_id, standard_id)
);

-- =====================================================
-- ADD TENANT COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add organization_id to stories for org-specific content
ALTER TABLE stories ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE stories ADD COLUMN is_org_private BOOLEAN DEFAULT FALSE;

-- Add organization_id to child_profiles
ALTER TABLE child_profiles ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE child_profiles ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE SET NULL;
ALTER TABLE child_profiles ADD COLUMN classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL;

-- Add organization_id to reading_sessions for analytics
ALTER TABLE reading_sessions ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE reading_sessions ADD COLUMN classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL;

-- =====================================================
-- INDEXES FOR MULTI-TENANCY
-- =====================================================

CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_subscription ON organizations(subscription_tier);
CREATE INDEX idx_organizations_active ON organizations(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_schools_org ON schools(organization_id);
CREATE INDEX idx_schools_active ON schools(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_user_accounts_org ON user_accounts(organization_id);
CREATE INDEX idx_user_accounts_school ON user_accounts(school_id);
CREATE INDEX idx_user_accounts_role ON user_accounts(role);

CREATE INDEX idx_classrooms_school ON classrooms(school_id);
CREATE INDEX idx_classrooms_teacher ON classrooms(teacher_id);
CREATE INDEX idx_classrooms_grade ON classrooms(grade_level);

CREATE INDEX idx_classroom_students_classroom ON classroom_students(classroom_id);
CREATE INDEX idx_classroom_students_student ON classroom_students(student_id);

CREATE INDEX idx_assignments_classroom ON assignments(classroom_id);
CREATE INDEX idx_assignments_due ON assignments(due_at);

CREATE INDEX idx_stories_org ON stories(organization_id);
CREATE INDEX idx_child_profiles_org ON child_profiles(organization_id);
CREATE INDEX idx_child_profiles_classroom ON child_profiles(classroom_id);

CREATE INDEX idx_reading_sessions_org ON reading_sessions(organization_id);
CREATE INDEX idx_reading_sessions_classroom ON reading_sessions(classroom_id);

-- =====================================================
-- ROW LEVEL SECURITY FOR MULTI-TENANCY
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Organization policies
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM user_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can update their organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM user_accounts
      WHERE user_id = auth.uid()
      AND role IN ('school_admin', 'district_admin', 'super_admin')
    )
  );

-- School policies
CREATE POLICY "Users can view schools in their org"
  ON schools FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_accounts WHERE user_id = auth.uid()
    )
  );

-- User account policies
CREATE POLICY "Users can view own account"
  ON user_accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view org users"
  ON user_accounts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_accounts
      WHERE user_id = auth.uid()
      AND role IN ('school_admin', 'district_admin', 'super_admin')
    )
  );

-- Classroom policies
CREATE POLICY "Teachers can view their classrooms"
  ON classrooms FOR SELECT
  USING (
    teacher_id IN (SELECT id FROM user_accounts WHERE user_id = auth.uid())
    OR co_teacher_id IN (SELECT id FROM user_accounts WHERE user_id = auth.uid())
    OR school_id IN (
      SELECT school_id FROM user_accounts
      WHERE user_id = auth.uid()
      AND role IN ('school_admin', 'district_admin')
    )
  );

-- Students can view their classroom
CREATE POLICY "Students can view enrolled classrooms"
  ON classrooms FOR SELECT
  USING (
    id IN (
      SELECT classroom_id FROM classroom_students cs
      JOIN user_accounts ua ON cs.student_id = ua.id
      WHERE ua.user_id = auth.uid()
    )
  );

-- Assignment policies
CREATE POLICY "Teachers can manage assignments"
  ON assignments FOR ALL
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id IN (SELECT id FROM user_accounts WHERE user_id = auth.uid())
      OR co_teacher_id IN (SELECT id FROM user_accounts WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Students can view their assignments"
  ON assignments FOR SELECT
  USING (
    classroom_id IN (
      SELECT classroom_id FROM classroom_students cs
      JOIN user_accounts ua ON cs.student_id = ua.id
      WHERE ua.user_id = auth.uid()
    )
  );

-- Update stories policy for org-private content
DROP POLICY IF EXISTS "Anyone can view published stories" ON stories;

CREATE POLICY "View published or org stories"
  ON stories FOR SELECT
  USING (
    is_published = TRUE
    OR (
      is_org_private = TRUE
      AND organization_id IN (
        SELECT organization_id FROM user_accounts WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- ANALYTICS VIEWS FOR SCHOOLS
-- =====================================================

CREATE OR REPLACE VIEW classroom_reading_stats AS
SELECT
  c.id as classroom_id,
  c.name as classroom_name,
  c.grade_level,
  COUNT(DISTINCT cs.student_id) as student_count,
  COUNT(DISTINCT rs.id) as total_sessions,
  COALESCE(SUM(rs.duration_seconds), 0) as total_reading_seconds,
  COALESCE(AVG(rs.duration_seconds), 0) as avg_session_seconds,
  COUNT(DISTINCT rs.story_id) as unique_stories_read
FROM classrooms c
LEFT JOIN classroom_students cs ON c.id = cs.classroom_id AND cs.status = 'active'
LEFT JOIN reading_sessions rs ON rs.classroom_id = c.id
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.grade_level;

CREATE OR REPLACE VIEW school_reading_stats AS
SELECT
  s.id as school_id,
  s.name as school_name,
  s.organization_id,
  COUNT(DISTINCT c.id) as classroom_count,
  COUNT(DISTINCT cs.student_id) as total_students,
  COALESCE(SUM(rs.duration_seconds), 0) as total_reading_seconds,
  COUNT(DISTINCT rs.story_id) as unique_stories_read
FROM schools s
LEFT JOIN classrooms c ON s.id = c.school_id AND c.is_active = TRUE
LEFT JOIN classroom_students cs ON c.id = cs.classroom_id AND cs.status = 'active'
LEFT JOIN reading_sessions rs ON rs.classroom_id = c.id
WHERE s.is_active = TRUE
GROUP BY s.id, s.name, s.organization_id;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_accounts_updated_at
  BEFORE UPDATE ON user_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_classrooms_updated_at
  BEFORE UPDATE ON classrooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- SEED DATA: Common Curriculum Standards (sample)
-- =====================================================

INSERT INTO curriculum_standards (standard_code, framework, grade_level, subject, domain, description, related_categories) VALUES
  -- Common Core ELA Grade 3
  ('CCSS.ELA-LITERACY.RL.3.1', 'CCSS', 'grade_3', 'Reading', 'Key Ideas and Details', 'Ask and answer questions to demonstrate understanding of a text', ARRAY['adventure', 'fantasy', 'historical_fiction']::story_category[]),
  ('CCSS.ELA-LITERACY.RL.3.2', 'CCSS', 'grade_3', 'Reading', 'Key Ideas and Details', 'Recount stories and determine central message, lesson, or moral', ARRAY['social_emotional', 'mythology_folklore', 'family']::story_category[]),
  ('CCSS.ELA-LITERACY.RL.3.3', 'CCSS', 'grade_3', 'Reading', 'Key Ideas and Details', 'Describe characters and explain how their actions contribute to events', ARRAY['adventure', 'biography', 'historical_fiction']::story_category[]),

  -- Common Core ELA Grade 5
  ('CCSS.ELA-LITERACY.RL.5.6', 'CCSS', 'grade_5', 'Reading', 'Craft and Structure', 'Describe how a narrator''s point of view influences how events are described', ARRAY['historical_fiction', 'coming_of_age', 'social_issues']::story_category[]),

  -- NGSS Science Grade 3
  ('3-LS4-3', 'NGSS', 'grade_3', 'Science', 'Life Science', 'Construct an argument with evidence that in a particular habitat some organisms can survive well', ARRAY['environmental', 'animals', 'stem_stories']::story_category[]),

  -- Social Studies
  ('C3.D2.Geo.2.3-5', 'C3', 'grade_4', 'Social Studies', 'Geography', 'Use maps, satellite images, and other representations to explain relationships between locations', ARRAY['geography_adventures', 'world_cultures', 'global_citizenship']::story_category[]);
