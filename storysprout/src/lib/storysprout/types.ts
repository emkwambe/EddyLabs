// StorySprout Types
// Global digital reading platform for children and young adults (ages 2-18+)

// =====================================================
// ENUMS - EXTENDED GRADE LEVELS
// =====================================================

export type AgeBand =
  // Early Childhood (2-5)
  | 'pre_k'       // 2-3 years
  | 'k_prep'      // 4-5 years
  // Elementary School (6-10)
  | 'grade_1'     // 6-7 years
  | 'grade_2'     // 7-8 years
  | 'grade_3'     // 8-9 years
  | 'grade_4'     // 9-10 years
  | 'grade_5'     // 10-11 years
  // Middle School (11-14)
  | 'grade_6'     // 11-12 years
  | 'grade_7'     // 12-13 years
  | 'grade_8'     // 13-14 years
  // High School (14-18)
  | 'grade_9'     // 14-15 years
  | 'grade_10'    // 15-16 years
  | 'grade_11'    // 16-17 years
  | 'grade_12';   // 17-18 years

export type SchoolLevel =
  | 'early_childhood'  // Pre-K to K-Prep
  | 'elementary'       // Grades 1-5
  | 'middle_school'    // Grades 6-8
  | 'high_school';     // Grades 9-12

export type ReadingMode =
  | 'read_to_me'   // Full narration (primarily for younger readers)
  | 'read_with_me' // Highlighted text with optional narration
  | 'read_alone'   // Independent reading
  | 'study_mode';  // Annotations, vocabulary highlights (older readers)

export type StoryCategory =
  // Original Categories
  | 'bedtime'
  | 'seasonal'
  | 'cultural'
  | 'curriculum'
  | 'emotional_social'
  | 'school'
  | 'family'
  | 'adventure'
  // New Global/Geographic Categories
  | 'world_cultures'
  | 'geography_adventures'
  | 'historical_fiction'
  | 'mythology_folklore'
  | 'global_citizenship'
  | 'environmental'
  | 'stem_stories'
  | 'biography'
  | 'coming_of_age'
  | 'social_issues';

export type IllustrationStyle =
  | 'soft_flat'
  | 'watercolor'
  | 'line_art'
  | 'collage'
  | 'photographic'
  | 'realistic'
  | 'manga_anime'
  | 'graphic_novel'
  | 'digital_art';

// =====================================================
// GLOBAL REGIONS & COUNTRIES
// =====================================================

export type Continent =
  | 'africa'
  | 'asia'
  | 'europe'
  | 'north_america'
  | 'south_america'
  | 'oceania'
  | 'antarctica';

export type GlobalRegion =
  // Africa
  | 'north_africa'
  | 'west_africa'
  | 'east_africa'
  | 'central_africa'
  | 'southern_africa'
  // Asia
  | 'east_asia'
  | 'southeast_asia'
  | 'south_asia'
  | 'central_asia'
  | 'middle_east'
  // Europe
  | 'western_europe'
  | 'eastern_europe'
  | 'northern_europe'
  | 'southern_europe'
  // Americas
  | 'north_america_region'
  | 'central_america'
  | 'caribbean'
  | 'south_america_region'
  // Oceania
  | 'australia_nz'
  | 'pacific_islands'
  | 'melanesia';

export interface CountryConfig {
  code: string;           // ISO 3166-1 alpha-2
  name: string;
  continent: Continent;
  region: GlobalRegion;
  languages: string[];
  culturalThemes: string[];
  traditionalStories: string[];
  flag: string;           // Emoji flag
}

export const FEATURED_COUNTRIES: CountryConfig[] = [
  // Africa
  { code: 'NG', name: 'Nigeria', continent: 'africa', region: 'west_africa', languages: ['English', 'Yoruba', 'Hausa', 'Igbo'], culturalThemes: ['Anansi tales', 'community', 'respect for elders'], traditionalStories: ['Why Mosquitoes Buzz', 'Anansi stories'], flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', continent: 'africa', region: 'east_africa', languages: ['Swahili', 'English'], culturalThemes: ['safari', 'wildlife', 'Maasai culture'], traditionalStories: ['Hare and Tortoise', 'Lion tales'], flag: '🇰🇪' },
  { code: 'EG', name: 'Egypt', continent: 'africa', region: 'north_africa', languages: ['Arabic'], culturalThemes: ['pyramids', 'Nile River', 'ancient history'], traditionalStories: ['Pharaoh tales', 'Desert adventures'], flag: '🇪🇬' },
  { code: 'ZA', name: 'South Africa', continent: 'africa', region: 'southern_africa', languages: ['Zulu', 'Xhosa', 'Afrikaans', 'English'], culturalThemes: ['Rainbow Nation', 'ubuntu', 'wildlife'], traditionalStories: ['Ubuntu stories', 'Animal tales'], flag: '🇿🇦' },
  { code: 'GH', name: 'Ghana', continent: 'africa', region: 'west_africa', languages: ['English', 'Akan', 'Twi'], culturalThemes: ['kente cloth', 'Ashanti', 'gold coast'], traditionalStories: ['Anansi the Spider', 'Wisdom stories'], flag: '🇬🇭' },

  // Asia
  { code: 'JP', name: 'Japan', continent: 'asia', region: 'east_asia', languages: ['Japanese'], culturalThemes: ['harmony', 'nature', 'tradition'], traditionalStories: ['Momotaro', 'Tanabata', 'Kaguya-hime'], flag: '🇯🇵' },
  { code: 'CN', name: 'China', continent: 'asia', region: 'east_asia', languages: ['Mandarin'], culturalThemes: ['family honor', 'dragons', 'festivals'], traditionalStories: ['Mulan', 'Monkey King', 'Red Thread'], flag: '🇨🇳' },
  { code: 'IN', name: 'India', continent: 'asia', region: 'south_asia', languages: ['Hindi', 'English', 'Tamil', 'Bengali'], culturalThemes: ['diversity', 'festivals', 'spirituality'], traditionalStories: ['Panchatantra', 'Ramayana', 'Jataka tales'], flag: '🇮🇳' },
  { code: 'KR', name: 'South Korea', continent: 'asia', region: 'east_asia', languages: ['Korean'], culturalThemes: ['respect', 'K-culture', 'technology'], traditionalStories: ['Kongjwi and Patjwi', 'Tiger tales'], flag: '🇰🇷' },
  { code: 'VN', name: 'Vietnam', continent: 'asia', region: 'southeast_asia', languages: ['Vietnamese'], culturalThemes: ['resilience', 'rice farming', 'family'], traditionalStories: ['Lac Long Quan', 'Tam Cam'], flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', continent: 'asia', region: 'southeast_asia', languages: ['Filipino', 'English'], culturalThemes: ['islands', 'family', 'hospitality'], traditionalStories: ['Maria Makiling', 'Juan Tamad'], flag: '🇵🇭' },
  { code: 'TH', name: 'Thailand', continent: 'asia', region: 'southeast_asia', languages: ['Thai'], culturalThemes: ['Buddhism', 'elephants', 'kindness'], traditionalStories: ['Ramakien', 'White Elephant'], flag: '🇹🇭' },

  // Europe
  { code: 'GB', name: 'United Kingdom', continent: 'europe', region: 'northern_europe', languages: ['English'], culturalThemes: ['royalty', 'castles', 'tea time'], traditionalStories: ['King Arthur', 'Robin Hood', 'Peter Pan'], flag: '🇬🇧' },
  { code: 'FR', name: 'France', continent: 'europe', region: 'western_europe', languages: ['French'], culturalThemes: ['art', 'cuisine', 'fashion'], traditionalStories: ['Cinderella', 'Beauty and Beast', 'Little Prince'], flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', continent: 'europe', region: 'western_europe', languages: ['German'], culturalThemes: ['fairy tales', 'forests', 'innovation'], traditionalStories: ['Grimm tales', 'Hansel and Gretel'], flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', continent: 'europe', region: 'southern_europe', languages: ['Italian'], culturalThemes: ['art', 'family', 'food'], traditionalStories: ['Pinocchio', 'Roman myths'], flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', continent: 'europe', region: 'southern_europe', languages: ['Spanish'], culturalThemes: ['fiestas', 'flamenco', 'exploration'], traditionalStories: ['Don Quixote', 'El Cid'], flag: '🇪🇸' },
  { code: 'GR', name: 'Greece', continent: 'europe', region: 'southern_europe', languages: ['Greek'], culturalThemes: ['mythology', 'democracy', 'philosophy'], traditionalStories: ['Greek myths', 'Odyssey', 'Aesop fables'], flag: '🇬🇷' },
  { code: 'RU', name: 'Russia', continent: 'europe', region: 'eastern_europe', languages: ['Russian'], culturalThemes: ['vastness', 'winter', 'matryoshka'], traditionalStories: ['Firebird', 'Baba Yaga', 'Ivan tales'], flag: '🇷🇺' },
  { code: 'IE', name: 'Ireland', continent: 'europe', region: 'northern_europe', languages: ['English', 'Irish'], culturalThemes: ['leprechauns', 'Celtic', 'storytelling'], traditionalStories: ['Celtic myths', 'Fairy tales'], flag: '🇮🇪' },

  // North America
  { code: 'US', name: 'United States', continent: 'north_america', region: 'north_america_region', languages: ['English', 'Spanish'], culturalThemes: ['diversity', 'innovation', 'freedom'], traditionalStories: ['Paul Bunyan', 'Native American tales', 'Johnny Appleseed'], flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', continent: 'north_america', region: 'north_america_region', languages: ['English', 'French'], culturalThemes: ['multiculturalism', 'nature', 'hockey'], traditionalStories: ['First Nations tales', 'Anne of Green Gables'], flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', continent: 'north_america', region: 'central_america', languages: ['Spanish'], culturalThemes: ['Día de Muertos', 'mariachi', 'Aztec heritage'], traditionalStories: ['Quetzalcoatl', 'La Llorona', 'Maya legends'], flag: '🇲🇽' },
  { code: 'JM', name: 'Jamaica', continent: 'north_america', region: 'caribbean', languages: ['English', 'Patois'], culturalThemes: ['reggae', 'sunshine', 'community'], traditionalStories: ['Anansi Caribbean', 'Duppy stories'], flag: '🇯🇲' },

  // South America
  { code: 'BR', name: 'Brazil', continent: 'south_america', region: 'south_america_region', languages: ['Portuguese'], culturalThemes: ['Amazon', 'Carnival', 'football'], traditionalStories: ['Curupira', 'Iara', 'Saci'], flag: '🇧🇷' },
  { code: 'PE', name: 'Peru', continent: 'south_america', region: 'south_america_region', languages: ['Spanish', 'Quechua'], culturalThemes: ['Inca', 'Machu Picchu', 'Andes'], traditionalStories: ['Inca legends', 'Llama tales'], flag: '🇵🇪' },
  { code: 'AR', name: 'Argentina', continent: 'south_america', region: 'south_america_region', languages: ['Spanish'], culturalThemes: ['tango', 'pampas', 'gauchos'], traditionalStories: ['Gaucho tales', 'Patagonia legends'], flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', continent: 'south_america', region: 'south_america_region', languages: ['Spanish'], culturalThemes: ['biodiversity', 'coffee', 'music'], traditionalStories: ['El Dorado', 'Indigenous legends'], flag: '🇨🇴' },

  // Oceania
  { code: 'AU', name: 'Australia', continent: 'oceania', region: 'australia_nz', languages: ['English'], culturalThemes: ['outback', 'Indigenous culture', 'wildlife'], traditionalStories: ['Dreamtime', 'Rainbow Serpent'], flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', continent: 'oceania', region: 'australia_nz', languages: ['English', 'Māori'], culturalThemes: ['Māori culture', 'nature', 'adventure'], traditionalStories: ['Māui legends', 'Kiwi tales'], flag: '🇳🇿' },
  { code: 'FJ', name: 'Fiji', continent: 'oceania', region: 'pacific_islands', languages: ['English', 'Fijian', 'Hindi'], culturalThemes: ['islands', 'ocean', 'hospitality'], traditionalStories: ['Pacific legends', 'Ocean spirits'], flag: '🇫🇯' },
];

export const CONTINENTS: Record<Continent, { name: string; icon: string; color: string }> = {
  africa: { name: 'Africa', icon: '🌍', color: '#F4A460' },
  asia: { name: 'Asia', icon: '🌏', color: '#FF6347' },
  europe: { name: 'Europe', icon: '🌍', color: '#4169E1' },
  north_america: { name: 'North America', icon: '🌎', color: '#32CD32' },
  south_america: { name: 'South America', icon: '🌎', color: '#FFD700' },
  oceania: { name: 'Oceania', icon: '🌏', color: '#00CED1' },
  antarctica: { name: 'Antarctica', icon: '🐧', color: '#87CEEB' },
};

// =====================================================
// CULTURAL STORY ELEMENTS
// =====================================================

export interface CulturalStoryConfig {
  region: GlobalRegion;
  country_code?: string;
  cultural_elements: string[];
  traditional_values: string[];
  typical_settings: string[];
  character_archetypes: string[];
  story_structures: string[];
  visual_motifs: string[];
}

export const CULTURAL_THEMES = [
  // Universal Themes
  'family_bonds',
  'friendship',
  'courage',
  'wisdom',
  'respect_for_nature',
  'community',
  'perseverance',
  'kindness',
  'honesty',
  'gratitude',

  // Cultural-Specific Themes
  'ancestor_wisdom',
  'harmony_with_nature',
  'oral_tradition',
  'coming_of_age_rituals',
  'festival_celebrations',
  'traditional_crafts',
  'indigenous_knowledge',
  'migration_stories',
  'cultural_identity',
  'intergenerational_learning',
] as const;

export type CulturalTheme = typeof CULTURAL_THEMES[number];

// =====================================================
// AGE BAND CONFIGURATION - EXTENDED
// =====================================================

export interface AgeBandConfig {
  id: AgeBand;
  label: string;
  ageRange: [number, number];
  schoolLevel: SchoolLevel;
  readingFocus: string;
  cognitiveGoals: string;
  emotionalGoals: string;
  complexityLevel: 1 | 2 | 3 | 4 | 5;  // 1=simplest, 5=most complex
  wordCountPerPage: [number, number]; // [min, max]
  sentenceComplexity: string;
  topicsAppropriate: string[];
  color: string;
  icon: string;
}

export const AGE_BANDS: Record<AgeBand, AgeBandConfig> = {
  // Early Childhood
  pre_k: {
    id: 'pre_k',
    label: 'Pre-K',
    ageRange: [2, 3],
    schoolLevel: 'early_childhood',
    readingFocus: 'Listening, picture cues',
    cognitiveGoals: 'Attention',
    emotionalGoals: 'Emotional recognition',
    complexityLevel: 1,
    wordCountPerPage: [5, 15],
    sentenceComplexity: 'One simple sentence',
    topicsAppropriate: ['family', 'animals', 'colors', 'shapes', 'daily routines'],
    color: '#FF6B9D',
    icon: '🌸',
  },
  k_prep: {
    id: 'k_prep',
    label: 'K-Prep',
    ageRange: [4, 5],
    schoolLevel: 'early_childhood',
    readingFocus: 'Letter sounds, sight words',
    cognitiveGoals: 'Story sequencing',
    emotionalGoals: 'Curiosity',
    complexityLevel: 1,
    wordCountPerPage: [10, 25],
    sentenceComplexity: '1-2 simple sentences',
    topicsAppropriate: ['friendship', 'school readiness', 'nature', 'feelings', 'helping'],
    color: '#4ECDC4',
    icon: '🌱',
  },

  // Elementary School
  grade_1: {
    id: 'grade_1',
    label: 'Grade 1',
    ageRange: [6, 7],
    schoolLevel: 'elementary',
    readingFocus: 'Early fluency',
    cognitiveGoals: 'Comprehension',
    emotionalGoals: 'Confidence',
    complexityLevel: 2,
    wordCountPerPage: [20, 40],
    sentenceComplexity: '2-3 sentences with simple structure',
    topicsAppropriate: ['friendship', 'family', 'school', 'pets', 'seasons'],
    color: '#45B7D1',
    icon: '🌿',
  },
  grade_2: {
    id: 'grade_2',
    label: 'Grade 2',
    ageRange: [7, 8],
    schoolLevel: 'elementary',
    readingFocus: 'Independent reading',
    cognitiveGoals: 'Inference',
    emotionalGoals: 'Vocabulary growth',
    complexityLevel: 2,
    wordCountPerPage: [30, 60],
    sentenceComplexity: 'Short paragraphs with dialogue',
    topicsAppropriate: ['adventure', 'mystery', 'different cultures', 'problem-solving'],
    color: '#96CEB4',
    icon: '🌳',
  },
  grade_3: {
    id: 'grade_3',
    label: 'Grade 3',
    ageRange: [8, 9],
    schoolLevel: 'elementary',
    readingFocus: 'Reading to learn',
    cognitiveGoals: 'Theme, cause-effect',
    emotionalGoals: 'Critical thinking',
    complexityLevel: 2,
    wordCountPerPage: [40, 80],
    sentenceComplexity: 'Complex sentences, multiple paragraphs',
    topicsAppropriate: ['world cultures', 'history', 'science', 'environment', 'character growth'],
    color: '#FFEAA7',
    icon: '🌻',
  },
  grade_4: {
    id: 'grade_4',
    label: 'Grade 4',
    ageRange: [9, 10],
    schoolLevel: 'elementary',
    readingFocus: 'Deeper narratives',
    cognitiveGoals: 'Perspective',
    emotionalGoals: 'Empathy',
    complexityLevel: 3,
    wordCountPerPage: [50, 100],
    sentenceComplexity: 'Rich vocabulary, figurative language',
    topicsAppropriate: ['global issues', 'biography', 'mythology', 'social dynamics'],
    color: '#DDA0DD',
    icon: '🌺',
  },
  grade_5: {
    id: 'grade_5',
    label: 'Grade 5',
    ageRange: [10, 11],
    schoolLevel: 'elementary',
    readingFocus: 'Analytical reading',
    cognitiveGoals: 'Theme analysis, comparison',
    emotionalGoals: 'Self-awareness',
    complexityLevel: 3,
    wordCountPerPage: [60, 120],
    sentenceComplexity: 'Varied sentence structures, chapters',
    topicsAppropriate: ['historical fiction', 'science fiction', 'cultural identity', 'challenges'],
    color: '#B8860B',
    icon: '🍂',
  },

  // Middle School
  grade_6: {
    id: 'grade_6',
    label: 'Grade 6',
    ageRange: [11, 12],
    schoolLevel: 'middle_school',
    readingFocus: 'Literary analysis',
    cognitiveGoals: 'Multiple perspectives',
    emotionalGoals: 'Identity exploration',
    complexityLevel: 3,
    wordCountPerPage: [80, 150],
    sentenceComplexity: 'Complex narratives, multiple POV',
    topicsAppropriate: ['coming of age', 'social issues', 'world history', 'identity'],
    color: '#6A5ACD',
    icon: '📘',
  },
  grade_7: {
    id: 'grade_7',
    label: 'Grade 7',
    ageRange: [12, 13],
    schoolLevel: 'middle_school',
    readingFocus: 'Critical reading',
    cognitiveGoals: 'Argument analysis',
    emotionalGoals: 'Ethical reasoning',
    complexityLevel: 4,
    wordCountPerPage: [100, 180],
    sentenceComplexity: 'Literary devices, symbolism',
    topicsAppropriate: ['social justice', 'global citizenship', 'historical events', 'relationships'],
    color: '#4682B4',
    icon: '📗',
  },
  grade_8: {
    id: 'grade_8',
    label: 'Grade 8',
    ageRange: [13, 14],
    schoolLevel: 'middle_school',
    readingFocus: 'Interpretive reading',
    cognitiveGoals: 'Synthesis, evaluation',
    emotionalGoals: 'Social responsibility',
    complexityLevel: 4,
    wordCountPerPage: [120, 200],
    sentenceComplexity: 'Sophisticated prose, mature themes',
    topicsAppropriate: ['human rights', 'environmental issues', 'cultural conflicts', 'personal growth'],
    color: '#708090',
    icon: '📕',
  },

  // High School
  grade_9: {
    id: 'grade_9',
    label: 'Grade 9',
    ageRange: [14, 15],
    schoolLevel: 'high_school',
    readingFocus: 'Literary interpretation',
    cognitiveGoals: 'Thematic connections',
    emotionalGoals: 'Self-discovery',
    complexityLevel: 4,
    wordCountPerPage: [150, 250],
    sentenceComplexity: 'Advanced literary techniques',
    topicsAppropriate: ['identity', 'society', 'philosophy', 'global perspectives', 'relationships'],
    color: '#2F4F4F',
    icon: '📚',
  },
  grade_10: {
    id: 'grade_10',
    label: 'Grade 10',
    ageRange: [15, 16],
    schoolLevel: 'high_school',
    readingFocus: 'World literature',
    cognitiveGoals: 'Cross-cultural analysis',
    emotionalGoals: 'Global empathy',
    complexityLevel: 5,
    wordCountPerPage: [180, 300],
    sentenceComplexity: 'Diverse literary traditions',
    topicsAppropriate: ['world cultures', 'political themes', 'moral dilemmas', 'social movements'],
    color: '#556B2F',
    icon: '🌐',
  },
  grade_11: {
    id: 'grade_11',
    label: 'Grade 11',
    ageRange: [16, 17],
    schoolLevel: 'high_school',
    readingFocus: 'Critical analysis',
    cognitiveGoals: 'Research, argumentation',
    emotionalGoals: 'Civic engagement',
    complexityLevel: 5,
    wordCountPerPage: [200, 350],
    sentenceComplexity: 'Academic and literary prose',
    topicsAppropriate: ['social issues', 'historical analysis', 'scientific ethics', 'leadership'],
    color: '#483D8B',
    icon: '🎓',
  },
  grade_12: {
    id: 'grade_12',
    label: 'Grade 12',
    ageRange: [17, 18],
    schoolLevel: 'high_school',
    readingFocus: 'College-prep reading',
    cognitiveGoals: 'Independent analysis',
    emotionalGoals: 'Life preparation',
    complexityLevel: 5,
    wordCountPerPage: [250, 400],
    sentenceComplexity: 'College-level prose',
    topicsAppropriate: ['philosophy', 'economics', 'global affairs', 'career exploration', 'adult themes'],
    color: '#191970',
    icon: '🎯',
  },
};

// Helper function to get school level from age band
export function getSchoolLevel(ageBand: AgeBand): SchoolLevel {
  return AGE_BANDS[ageBand].schoolLevel;
}

// Helper function to get age bands by school level
export function getAgeBandsBySchoolLevel(level: SchoolLevel): AgeBand[] {
  return (Object.keys(AGE_BANDS) as AgeBand[]).filter(
    band => AGE_BANDS[band].schoolLevel === level
  );
}

// =====================================================
// READING MODE CONFIGURATION
// =====================================================

export interface ReadingModeConfig {
  id: ReadingMode;
  label: string;
  description: string;
  icon: string;
  features: string[];
  recommendedFor: SchoolLevel[];
}

export const READING_MODES: Record<ReadingMode, ReadingModeConfig> = {
  read_to_me: {
    id: 'read_to_me',
    label: 'Read to Me',
    description: 'Listen to the story with narration',
    icon: '🎧',
    features: ['Full audio narration', 'Auto page turn', 'Calm voice'],
    recommendedFor: ['early_childhood', 'elementary'],
  },
  read_with_me: {
    id: 'read_with_me',
    label: 'Read With Me',
    description: 'Follow along with highlighted words',
    icon: '👆',
    features: ['Word highlighting', 'Optional narration', 'Tap to hear words'],
    recommendedFor: ['early_childhood', 'elementary', 'middle_school'],
  },
  read_alone: {
    id: 'read_alone',
    label: 'Read Alone',
    description: 'Independent reading experience',
    icon: '📖',
    features: ['Distraction-free', 'Self-paced', 'Quiet mode'],
    recommendedFor: ['elementary', 'middle_school', 'high_school'],
  },
  study_mode: {
    id: 'study_mode',
    label: 'Study Mode',
    description: 'Deep reading with annotations',
    icon: '✍️',
    features: ['Highlight text', 'Add notes', 'Vocabulary lookup', 'Discussion questions'],
    recommendedFor: ['middle_school', 'high_school'],
  },
};

// =====================================================
// CATEGORY CONFIGURATION - EXTENDED
// =====================================================

export interface CategoryConfig {
  id: StoryCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  recommendedAges: SchoolLevel[];
  relatedThemes: string[];
}

export const CATEGORIES: Record<StoryCategory, CategoryConfig> = {
  // Original Categories
  bedtime: {
    id: 'bedtime',
    label: 'Bedtime Stories',
    description: 'Calm, soothing stories perfect for winding down',
    icon: '🌙',
    color: '#6B5B95',
    recommendedAges: ['early_childhood', 'elementary'],
    relatedThemes: ['calm', 'dreams', 'comfort', 'family'],
  },
  seasonal: {
    id: 'seasonal',
    label: 'Seasonal Stories',
    description: 'Stories celebrating seasons and holidays',
    icon: '🍂',
    color: '#FF6F61',
    recommendedAges: ['early_childhood', 'elementary', 'middle_school'],
    relatedThemes: ['seasons', 'holidays', 'celebrations', 'nature cycles'],
  },
  cultural: {
    id: 'cultural',
    label: 'Cultural Stories',
    description: 'Stories celebrating diverse cultures and traditions',
    icon: '🌍',
    color: '#88B04B',
    recommendedAges: ['early_childhood', 'elementary', 'middle_school', 'high_school'],
    relatedThemes: ['traditions', 'heritage', 'customs', 'diversity'],
  },
  curriculum: {
    id: 'curriculum',
    label: 'Curriculum Stories',
    description: 'Stories aligned with learning standards',
    icon: '📚',
    color: '#5B5EA6',
    recommendedAges: ['elementary', 'middle_school', 'high_school'],
    relatedThemes: ['learning', 'education', 'knowledge', 'discovery'],
  },
  emotional_social: {
    id: 'emotional_social',
    label: 'Social & Emotional',
    description: 'Stories about feelings and relationships',
    icon: '💖',
    color: '#E15D44',
    recommendedAges: ['early_childhood', 'elementary', 'middle_school', 'high_school'],
    relatedThemes: ['emotions', 'relationships', 'self-awareness', 'empathy'],
  },
  school: {
    id: 'school',
    label: 'School Stories',
    description: 'Adventures at school and learning',
    icon: '🏫',
    color: '#009688',
    recommendedAges: ['early_childhood', 'elementary', 'middle_school', 'high_school'],
    relatedThemes: ['education', 'friendship', 'challenges', 'growth'],
  },
  family: {
    id: 'family',
    label: 'Family Stories',
    description: 'Stories about family life and love',
    icon: '🏠',
    color: '#F7CAC9',
    recommendedAges: ['early_childhood', 'elementary', 'middle_school'],
    relatedThemes: ['family bonds', 'generations', 'home', 'belonging'],
  },
  adventure: {
    id: 'adventure',
    label: 'Adventure Stories',
    description: 'Exciting journeys and discoveries',
    icon: '🌟',
    color: '#92A8D1',
    recommendedAges: ['elementary', 'middle_school', 'high_school'],
    relatedThemes: ['exploration', 'courage', 'discovery', 'challenge'],
  },

  // New Global/Geographic Categories
  world_cultures: {
    id: 'world_cultures',
    label: 'World Cultures',
    description: 'Stories from every corner of the globe',
    icon: '🗺️',
    color: '#E91E63',
    recommendedAges: ['elementary', 'middle_school', 'high_school'],
    relatedThemes: ['diversity', 'traditions', 'customs', 'global community'],
  },
  geography_adventures: {
    id: 'geography_adventures',
    label: 'Geography Adventures',
    description: 'Explore continents, countries, and landscapes',
    icon: '🧭',
    color: '#00BCD4',
    recommendedAges: ['elementary', 'middle_school'],
    relatedThemes: ['geography', 'travel', 'landscapes', 'ecosystems'],
  },
  historical_fiction: {
    id: 'historical_fiction',
    label: 'Historical Fiction',
    description: 'Stories set in different time periods',
    icon: '🏛️',
    color: '#795548',
    recommendedAges: ['middle_school', 'high_school'],
    relatedThemes: ['history', 'change', 'legacy', 'perspective'],
  },
  mythology_folklore: {
    id: 'mythology_folklore',
    label: 'Mythology & Folklore',
    description: 'Traditional tales and legends from around the world',
    icon: '🐉',
    color: '#9C27B0',
    recommendedAges: ['elementary', 'middle_school', 'high_school'],
    relatedThemes: ['legends', 'myths', 'oral tradition', 'cultural heritage'],
  },
  global_citizenship: {
    id: 'global_citizenship',
    label: 'Global Citizenship',
    description: 'Stories about being a responsible world citizen',
    icon: '🤝',
    color: '#4CAF50',
    recommendedAges: ['middle_school', 'high_school'],
    relatedThemes: ['responsibility', 'cooperation', 'sustainability', 'human rights'],
  },
  environmental: {
    id: 'environmental',
    label: 'Environmental',
    description: 'Stories about nature, climate, and conservation',
    icon: '🌱',
    color: '#8BC34A',
    recommendedAges: ['elementary', 'middle_school', 'high_school'],
    relatedThemes: ['nature', 'conservation', 'climate', 'sustainability'],
  },
  stem_stories: {
    id: 'stem_stories',
    label: 'STEM Stories',
    description: 'Science, technology, engineering, and math adventures',
    icon: '🔬',
    color: '#3F51B5',
    recommendedAges: ['elementary', 'middle_school', 'high_school'],
    relatedThemes: ['science', 'invention', 'problem-solving', 'innovation'],
  },
  biography: {
    id: 'biography',
    label: 'Biographies',
    description: 'Stories of inspiring people from history and today',
    icon: '👤',
    color: '#607D8B',
    recommendedAges: ['elementary', 'middle_school', 'high_school'],
    relatedThemes: ['inspiration', 'achievement', 'perseverance', 'leadership'],
  },
  coming_of_age: {
    id: 'coming_of_age',
    label: 'Coming of Age',
    description: 'Stories about growing up and finding yourself',
    icon: '🦋',
    color: '#FF9800',
    recommendedAges: ['middle_school', 'high_school'],
    relatedThemes: ['identity', 'growth', 'self-discovery', 'transitions'],
  },
  social_issues: {
    id: 'social_issues',
    label: 'Social Issues',
    description: 'Stories exploring important societal topics',
    icon: '📢',
    color: '#F44336',
    recommendedAges: ['middle_school', 'high_school'],
    relatedThemes: ['justice', 'equality', 'change', 'advocacy'],
  },
};

// =====================================================
// CHILD PROFILE - EXTENDED
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

  // New cultural preferences
  preferred_regions: GlobalRegion[];
  preferred_languages: string[];
  cultural_background: string[];
  interests: string[];

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
  preferred_regions?: GlobalRegion[];
  cultural_background?: string[];
  interests?: string[];
}

// Child avatar options - expanded
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
  { id: 'lion', emoji: '🦁', color: '#DAA520' },
  { id: 'panda', emoji: '🐼', color: '#2F4F4F' },
  { id: 'koala', emoji: '🐨', color: '#808080' },
  { id: 'elephant', emoji: '🐘', color: '#A9A9A9' },
  { id: 'dolphin', emoji: '🐬', color: '#00CED1' },
  { id: 'turtle', emoji: '🐢', color: '#228B22' },
];

// =====================================================
// STORIES - EXTENDED
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
  reading_level_system: 'guided' | 'lexile' | 'dra' | 'grade_equivalent';
  reading_level: string;

  // Content metadata
  category: StoryCategory;
  themes: string[];
  emotional_focus: string[];

  // Geographic/Cultural metadata (NEW)
  continent: Continent | null;
  region: GlobalRegion | null;
  country_code: string | null;
  cultural_elements: string[];
  languages_featured: string[];
  setting_description: string | null;

  // Character customization
  main_character_name: string | null;
  main_character_culture: string | null;
  character_customizable: boolean;

  // Sight words
  sight_words: string[];
  vocabulary_tier: 1 | 2 | 3 | 4 | 5;

  // Reading info
  estimated_read_time_minutes: number;
  page_count: number;
  chapter_count: number;
  modes_supported: ReadingMode[];

  // Visual style
  illustration_style: IllustrationStyle;
  cover_image_url: string | null;
  thumbnail_url: string | null;

  // Curriculum alignment
  curriculum_alignment: string[];
  learning_objectives: string[];
  discussion_questions: string[];

  // Tags
  seasonal_tag: string | null;
  is_featured: boolean;
  is_premium: boolean;

  // Story path
  story_path_id: string | null;
  sequence_in_path: number | null;

  // Audio
  narration_audio_url: string | null;
  available_narration_languages: string[];

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
  start: number;
  end: number;
}

export interface SightWordPosition {
  word: string;
  index: number;
}

export interface StoryPage {
  id: string;
  story_id: string;
  page_number: number;
  chapter_number: number | null;
  chapter_title: string | null;
  text_content: string;
  illustration_url: string | null;
  illustration_alt_text: string | null;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  word_timings: WordTiming[] | null;
  sight_word_positions: SightWordPosition[] | null;
  cultural_notes: string | null;  // Educational notes about cultural elements
  vocabulary_highlights: { word: string; definition: string; pronunciation?: string }[];
  created_at: string;
}

// =====================================================
// STORY PATHS (Learning Journeys) - EXTENDED
// =====================================================

export type StoryPathType =
  | 'learning_to_read'
  | 'school_stories'
  | 'big_feelings'
  | 'seasonal_adventures'
  | 'reading_with_confidence'
  | 'bedtime_collection'
  | 'friendship_tales'
  | 'family_fun'
  // New global paths
  | 'around_the_world'
  | 'cultural_explorers'
  | 'history_adventures'
  | 'mythology_quest'
  | 'global_heroes'
  | 'environmental_explorers'
  | 'stem_adventures';

export interface StoryPath {
  id: string;
  name: string;
  description: string | null;
  age_band: AgeBand;
  path_type: StoryPathType;
  continent_focus: Continent | null;
  region_focus: GlobalRegion | null;
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
  around_the_world: '🌍',
  cultural_explorers: '🗺️',
  history_adventures: '🏛️',
  mythology_quest: '🐉',
  global_heroes: '🦸',
  environmental_explorers: '🌱',
  stem_adventures: '🔬',
};

// =====================================================
// READING PROGRESS
// =====================================================

export interface ReadingProgress {
  id: string;
  child_profile_id: string;
  story_id: string;
  current_page: number;
  current_chapter: number | null;
  total_pages: number;
  is_completed: boolean;
  completed_at: string | null;
  reading_mode_used: ReadingMode | null;
  total_reading_time_seconds: number;
  last_read_at: string;
  read_count: number;
  notes: string | null;
  bookmarks: number[];
  created_at: string;
  updated_at: string;
}

export interface UpdateProgressInput {
  current_page: number;
  current_chapter?: number;
  reading_mode_used?: ReadingMode;
  additional_time_seconds?: number;
  notes?: string;
  add_bookmark?: number;
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

// Sight word lists by grade level - EXTENDED
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
    'found', 'study', 'still', 'learn', 'should', 'world', 'high', 'every', 'near', 'country',
  ],
  grade_5: [
    'thought', 'important', 'until', 'children', 'side', 'feet', 'car', 'mile', 'night', 'walk',
    'white', 'sea', 'began', 'grow', 'took', 'river', 'four', 'carry', 'state', 'once',
  ],
  grade_6: [], // Beyond sight words - focus on vocabulary
  grade_7: [],
  grade_8: [],
  grade_9: [],
  grade_10: [],
  grade_11: [],
  grade_12: [],
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
  vocabulary_learned: string[];
  cultural_topics_explored: string[];
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
  allowed_categories: StoryCategory[];
  preferred_regions: GlobalRegion[];
  cultural_filters: string[];
  daily_reading_goal_minutes: number;
  enable_bedtime_mode: boolean;
  enable_progress_notifications: boolean;
  weekly_summary_enabled: boolean;
  default_narrator_voice: string;
  narrator_speed: number;
  content_language: string;
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
  countries_explored: string[];
  cultures_learned: string[];
  last_reading_date: string | null;
}

// =====================================================
// FILTERS & QUERIES - EXTENDED
// =====================================================

export interface StoryFilters {
  age_band?: AgeBand;
  school_level?: SchoolLevel;
  category?: StoryCategory;
  reading_mode?: ReadingMode;
  continent?: Continent;
  region?: GlobalRegion;
  country_code?: string;
  language?: string;
  is_featured?: boolean;
  is_premium?: boolean;
  seasonal_tag?: string;
  search?: string;
  story_path_id?: string;
  cultural_theme?: CulturalTheme;
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
  currentChapter: number | null;
  readingMode: ReadingMode;
  isPlaying: boolean;
  playbackSpeed: number;
  showHighlights: boolean;
  showCulturalNotes: boolean;
  showVocabulary: boolean;
}

export interface ChildModeState {
  activeChildId: string | null;
  selectedAgeBand: AgeBand | null;
  selectedSchoolLevel: SchoolLevel | null;
  currentStoryPath: string | null;
  regionFilter: GlobalRegion | null;
}

// =====================================================
// THEMES & EMOTIONS LISTS - EXTENDED
// =====================================================

export const STORY_THEMES = [
  // Original themes
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
  // New global themes
  'cultural_identity',
  'global_citizenship',
  'environmental_stewardship',
  'historical_events',
  'mythology',
  'folklore',
  'traditions',
  'migration',
  'language_learning',
  'social_justice',
  'diversity',
  'inclusion',
  'leadership',
  'innovation',
  'perseverance',
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
  // New for older readers
  'self_discovery',
  'social_responsibility',
  'ethical_reasoning',
  'critical_thinking',
  'cultural_appreciation',
  'global_awareness',
] as const;

export type StoryTheme = typeof STORY_THEMES[number];
export type EmotionalFocus = typeof EMOTIONAL_FOCUSES[number];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function isElementaryOrYounger(ageBand: AgeBand): boolean {
  const elementaryAndYounger: AgeBand[] = ['pre_k', 'k_prep', 'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5'];
  return elementaryAndYounger.includes(ageBand);
}

export function isMiddleSchoolOrOlder(ageBand: AgeBand): boolean {
  const middleAndOlder: AgeBand[] = ['grade_6', 'grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'];
  return middleAndOlder.includes(ageBand);
}

export function getCountriesByContinent(continent: Continent): CountryConfig[] {
  return FEATURED_COUNTRIES.filter(c => c.continent === continent);
}

export function getCountriesByRegion(region: GlobalRegion): CountryConfig[] {
  return FEATURED_COUNTRIES.filter(c => c.region === region);
}

export function getRecommendedCategories(ageBand: AgeBand): StoryCategory[] {
  const schoolLevel = AGE_BANDS[ageBand].schoolLevel;
  return (Object.keys(CATEGORIES) as StoryCategory[]).filter(
    cat => CATEGORIES[cat].recommendedAges.includes(schoolLevel)
  );
}
