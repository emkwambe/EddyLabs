// StorySprout Types
// Mobile-first digital reading platform for children (ages 2-10)

// =====================================================
// ENUMS
// =====================================================

export type AgeBand =
  | 'pre_k'    // 2-3 years
  | 'k_prep'   // 4-5 years
  | 'grade_1'  // 6-7 years
  | 'grade_2'  // 7-8 years
  | 'grade_3'  // 8-9 years
  | 'grade_4'; // 9-10 years

export type ReadingMode =
  | 'read_to_me'   // Full narration
  | 'read_with_me' // Highlighted text with optional narration
  | 'read_alone';  // Distraction-free reading

export type StoryCategory =
  | 'bedtime'
  | 'seasonal'
  | 'cultural'
  | 'curriculum'
  | 'emotional_social'
  | 'school'
  | 'family'
  | 'adventure';

export type IllustrationStyle =
  | 'soft_flat'
  | 'watercolor'
  | 'line_art'
  | 'collage'
  | 'photographic';

// =====================================================
// AGE BAND CONFIGURATION
// =====================================================

export interface AgeBandConfig {
  id: AgeBand;
  label: string;
  ageRange: [number, number];
  readingFocus: string;
  cognitiveGoals: string;
  emotionalGoals: string;
  color: string;
  icon: string;
}

export const AGE_BANDS: Record<AgeBand, AgeBandConfig> = {
  pre_k: {
    id: 'pre_k',
    label: 'Pre-K',
    ageRange: [2, 3],
    readingFocus: 'Listening, picture cues',
    cognitiveGoals: 'Attention',
    emotionalGoals: 'Emotional recognition',
    color: '#FF6B9D', // Soft pink
    icon: '🌸',
  },
  k_prep: {
    id: 'k_prep',
    label: 'K-Prep',
    ageRange: [4, 5],
    readingFocus: 'Letter sounds, sight words',
    cognitiveGoals: 'Story sequencing',
    emotionalGoals: 'Curiosity',
    color: '#4ECDC4', // Teal
    icon: '🌱',
  },
  grade_1: {
    id: 'grade_1',
    label: 'Grade 1',
    ageRange: [6, 7],
    readingFocus: 'Early fluency',
    cognitiveGoals: 'Comprehension',
    emotionalGoals: 'Confidence',
    color: '#45B7D1', // Sky blue
    icon: '🌿',
  },
  grade_2: {
    id: 'grade_2',
    label: 'Grade 2',
    ageRange: [7, 8],
    readingFocus: 'Independent reading',
    cognitiveGoals: 'Inference',
    emotionalGoals: 'Vocabulary growth',
    color: '#96CEB4', // Sage green
    icon: '🌳',
  },
  grade_3: {
    id: 'grade_3',
    label: 'Grade 3',
    ageRange: [8, 9],
    readingFocus: 'Reading to learn',
    cognitiveGoals: 'Theme, cause-effect',
    emotionalGoals: 'Critical thinking',
    color: '#FFEAA7', // Soft yellow
    icon: '🌻',
  },
  grade_4: {
    id: 'grade_4',
    label: 'Grade 4',
    ageRange: [9, 10],
    readingFocus: 'Deeper narratives',
    cognitiveGoals: 'Perspective',
    emotionalGoals: 'Empathy',
    color: '#DDA0DD', // Plum
    icon: '🌺',
  },
};

// =====================================================
// READING MODE CONFIGURATION
// =====================================================

export interface ReadingModeConfig {
  id: ReadingMode;
  label: string;
  description: string;
  icon: string;
  features: string[];
}

export const READING_MODES: Record<ReadingMode, ReadingModeConfig> = {
  read_to_me: {
    id: 'read_to_me',
    label: 'Read to Me',
    description: 'Listen to the story with narration',
    icon: '🎧',
    features: ['Full audio narration', 'Auto page turn', 'Calm voice'],
  },
  read_with_me: {
    id: 'read_with_me',
    label: 'Read With Me',
    description: 'Follow along with highlighted words',
    icon: '👆',
    features: ['Word highlighting', 'Optional narration', 'Tap to hear words'],
  },
  read_alone: {
    id: 'read_alone',
    label: 'Read Alone',
    description: 'Independent reading experience',
    icon: '📖',
    features: ['Distraction-free', 'Self-paced', 'Quiet mode'],
  },
};

// =====================================================
// CHILD PROFILE
// =====================================================

export interface ChildProfile {
  id: string;
  parent_user_id: string;
  name: string;
  avatar_url: string | null;
  birth_date: string | null;
  age_band: AgeBand;
  reading_level: string | null;
  preferred_reading_mode: ReadingMode;
  bedtime_mode_enabled: boolean;
  bedtime_start: string;
  bedtime_end: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChildProfileInput {
  name: string;
  avatar_url?: string;
  birth_date?: string;
  age_band: AgeBand;
  reading_level?: string;
  preferred_reading_mode?: ReadingMode;
}

// Child avatar options
export const CHILD_AVATARS = [
  { id: 'bunny', emoji: '🐰', color: '#FFB6C1' },
  { id: 'bear', emoji: '🐻', color: '#DEB887' },
  { id: 'fox', emoji: '🦊', color: '#FF8C00' },
  { id: 'owl', emoji: '🦉', color: '#8B4513' },
  { id: 'penguin', emoji: '🐧', color: '#4169E1' },
  { id: 'cat', emoji: '🐱', color: '#FFD700' },
  { id: 'dog', emoji: '🐶', color: '#CD853F' },
  { id: 'unicorn', emoji: '🦄', color: '#FF69B4' },
  { id: 'dragon', emoji: '🐉', color: '#32CD32' },
  { id: 'butterfly', emoji: '🦋', color: '#87CEEB' },
];

// =====================================================
// STORIES
// =====================================================

export interface Story {
  id: string;
  story_code: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  illustrator: string | null;

  // Age and reading alignment
  age_band: AgeBand;
  min_age: number;
  max_age: number;
  reading_level_system: 'guided' | 'lexile' | 'dra';
  reading_level: string;

  // Content metadata
  category: StoryCategory;
  themes: string[];
  emotional_focus: string[];

  // Sight words
  sight_words: string[];
  vocabulary_tier: 1 | 2 | 3;

  // Reading info
  estimated_read_time_minutes: number;
  page_count: number;
  modes_supported: ReadingMode[];

  // Visual style
  illustration_style: IllustrationStyle;
  cover_image_url: string | null;
  thumbnail_url: string | null;

  // Curriculum alignment
  curriculum_alignment: string[];
  learning_objectives: string[];

  // Tags
  seasonal_tag: string | null;
  is_featured: boolean;
  is_premium: boolean;

  // Story path
  story_path_id: string | null;
  sequence_in_path: number | null;

  // Audio
  narration_audio_url: string | null;

  created_at: string;
  updated_at: string;
}

export interface StoryWithProgress extends Story {
  child_profile_id: string | null;
  current_page: number | null;
  is_completed: boolean | null;
  read_count: number | null;
  total_reading_time_seconds: number | null;
  last_read_at: string | null;
}

// =====================================================
// STORY PAGES
// =====================================================

export interface WordTiming {
  word: string;
  start: number; // seconds
  end: number;   // seconds
}

export interface SightWordPosition {
  word: string;
  index: number; // word index in text
}

export interface StoryPage {
  id: string;
  story_id: string;
  page_number: number;
  text_content: string;
  illustration_url: string | null;
  illustration_alt_text: string | null;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  word_timings: WordTiming[] | null;
  sight_word_positions: SightWordPosition[] | null;
  created_at: string;
}

// =====================================================
// STORY PATHS (Learning Journeys)
// =====================================================

export type StoryPathType =
  | 'learning_to_read'
  | 'school_stories'
  | 'big_feelings'
  | 'seasonal_adventures'
  | 'reading_with_confidence'
  | 'bedtime_collection'
  | 'friendship_tales'
  | 'family_fun';

export interface StoryPath {
  id: string;
  name: string;
  description: string | null;
  age_band: AgeBand;
  path_type: StoryPathType;
  icon_url: string | null;
  cover_image_url: string | null;
  color_theme: string;
  total_stories: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface StoryPathWithStories extends StoryPath {
  stories: Story[];
}

export const STORY_PATH_ICONS: Record<StoryPathType, string> = {
  learning_to_read: '📚',
  school_stories: '🏫',
  big_feelings: '💖',
  seasonal_adventures: '🍂',
  reading_with_confidence: '⭐',
  bedtime_collection: '🌙',
  friendship_tales: '🤝',
  family_fun: '👨‍👩‍👧‍👦',
};

// =====================================================
// READING PROGRESS
// =====================================================

export interface ReadingProgress {
  id: string;
  child_profile_id: string;
  story_id: string;
  current_page: number;
  total_pages: number;
  is_completed: boolean;
  completed_at: string | null;
  reading_mode_used: ReadingMode | null;
  total_reading_time_seconds: number;
  last_read_at: string;
  read_count: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateProgressInput {
  current_page: number;
  reading_mode_used?: ReadingMode;
  additional_time_seconds?: number;
}

// =====================================================
// SIGHT WORD TRACKING
// =====================================================

export interface SightWordExposure {
  id: string;
  child_profile_id: string;
  word: string;
  exposure_count: number;
  first_seen_at: string;
  last_seen_at: string;
  is_mastered: boolean;
  mastered_at: string | null;
}

// Sight word lists by grade level
export const SIGHT_WORDS_BY_GRADE: Record<AgeBand, string[]> = {
  pre_k: ['a', 'I', 'the', 'and', 'to', 'is', 'it', 'my', 'we', 'go'],
  k_prep: [
    'the', 'is', 'at', 'to', 'see', 'me', 'he', 'she', 'for', 'you',
    'was', 'are', 'with', 'his', 'they', 'be', 'have', 'from', 'or', 'had',
  ],
  grade_1: [
    'said', 'there', 'use', 'each', 'which', 'their', 'were', 'then', 'when', 'would',
    'make', 'like', 'time', 'been', 'could', 'people', 'than', 'first', 'water', 'called',
  ],
  grade_2: [
    'about', 'into', 'your', 'just', 'know', 'take', 'come', 'made', 'may', 'after',
    'think', 'also', 'back', 'only', 'over', 'such', 'our', 'new', 'good', 'very',
  ],
  grade_3: [
    'great', 'help', 'through', 'where', 'much', 'before', 'line', 'right', 'too', 'means',
    'old', 'any', 'same', 'tell', 'boy', 'follow', 'came', 'want', 'show', 'again',
  ],
  grade_4: [
    'because', 'different', 'away', 'animal', 'house', 'point', 'page', 'letter', 'mother', 'answer',
    'found', 'study', 'still', 'learn', 'should', 'America', 'world', 'high', 'every', 'near',
  ],
};

// =====================================================
// READING SESSIONS
// =====================================================

export interface ReadingSession {
  id: string;
  child_profile_id: string;
  story_id: string;
  reading_mode: ReadingMode;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  start_page: number;
  end_page: number | null;
  pages_read: number;
  story_completed: boolean;
  created_at: string;
}

// =====================================================
// FAVORITES
// =====================================================

export interface StoryFavorite {
  id: string;
  child_profile_id: string;
  story_id: string;
  created_at: string;
}

// =====================================================
// PARENT SETTINGS
// =====================================================

export interface ParentSettings {
  id: string;
  user_id: string;
  allowed_age_bands: AgeBand[];
  daily_reading_goal_minutes: number;
  enable_bedtime_mode: boolean;
  enable_progress_notifications: boolean;
  weekly_summary_enabled: boolean;
  default_narrator_voice: string;
  narrator_speed: number;
  created_at: string;
  updated_at: string;
}

// =====================================================
// CHILD READING SUMMARY (Aggregated)
// =====================================================

export interface ChildReadingSummary {
  child_id: string;
  child_name: string;
  parent_user_id: string;
  stories_completed: number;
  stories_started: number;
  total_reading_minutes: number;
  sight_words_encountered: number;
  last_reading_date: string | null;
}

// =====================================================
// FILTERS & QUERIES
// =====================================================

export interface StoryFilters {
  age_band?: AgeBand;
  category?: StoryCategory;
  reading_mode?: ReadingMode;
  is_featured?: boolean;
  is_premium?: boolean;
  seasonal_tag?: string;
  search?: string;
  story_path_id?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// =====================================================
// UI STATE
// =====================================================

export interface ReaderState {
  story: Story;
  pages: StoryPage[];
  currentPage: number;
  readingMode: ReadingMode;
  isPlaying: boolean;
  playbackSpeed: number;
  showHighlights: boolean;
}

export interface ChildModeState {
  activeChildId: string | null;
  selectedAgeBand: AgeBand | null;
  currentStoryPath: string | null;
}

// =====================================================
// THEMES & EMOTIONS LISTS
// =====================================================

export const STORY_THEMES = [
  'friendship',
  'family',
  'school',
  'sharing',
  'kindness',
  'adventure',
  'animals',
  'nature',
  'seasons',
  'holidays',
  'learning',
  'bedtime',
  'imagination',
  'helping',
  'growing_up',
] as const;

export const EMOTIONAL_FOCUSES = [
  'joy',
  'belonging',
  'courage',
  'patience',
  'empathy',
  'resilience',
  'gratitude',
  'self_regulation',
  'confidence',
  'curiosity',
  'calm',
  'love',
] as const;

export type StoryTheme = typeof STORY_THEMES[number];
export type EmotionalFocus = typeof EMOTIONAL_FOCUSES[number];

// =====================================================
// CATEGORY CONFIGURATION
// =====================================================

export interface CategoryConfig {
  id: StoryCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const CATEGORIES: Record<StoryCategory, CategoryConfig> = {
  bedtime: {
    id: 'bedtime',
    label: 'Bedtime Stories',
    description: 'Calm, soothing stories perfect for winding down',
    icon: '🌙',
    color: '#6B5B95',
  },
  seasonal: {
    id: 'seasonal',
    label: 'Seasonal Stories',
    description: 'Stories celebrating seasons and holidays',
    icon: '🍂',
    color: '#FF6F61',
  },
  cultural: {
    id: 'cultural',
    label: 'Cultural Stories',
    description: 'Stories from around the world',
    icon: '🌍',
    color: '#88B04B',
  },
  curriculum: {
    id: 'curriculum',
    label: 'Curriculum Stories',
    description: 'Stories aligned with learning standards',
    icon: '📚',
    color: '#5B5EA6',
  },
  emotional_social: {
    id: 'emotional_social',
    label: 'Social & Emotional',
    description: 'Stories about feelings and relationships',
    icon: '💖',
    color: '#E15D44',
  },
  school: {
    id: 'school',
    label: 'School Stories',
    description: 'Adventures at school and learning',
    icon: '🏫',
    color: '#009688',
  },
  family: {
    id: 'family',
    label: 'Family Stories',
    description: 'Stories about family life and love',
    icon: '🏠',
    color: '#F7CAC9',
  },
  adventure: {
    id: 'adventure',
    label: 'Adventure Stories',
    description: 'Exciting journeys and discoveries',
    icon: '🌟',
    color: '#92A8D1',
  },
};
