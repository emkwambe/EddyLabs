/**
 * StorySprout AI Story Generation Prompts
 *
 * These prompts are designed for Claude/GPT to generate age-appropriate,
 * curriculum-aligned stories with sight word integration for children
 * and young adults (ages 2-18+).
 *
 * Extended to support:
 * - Complete grade levels (Pre-K through Grade 12)
 * - Global cultural contexts and geographic themes
 * - Character customization with cultural representation
 */

import {
  AgeBand,
  StoryCategory,
  Continent,
  GlobalRegion,
  SchoolLevel,
  CountryConfig,
  FEATURED_COUNTRIES,
  AGE_BANDS,
  getSchoolLevel,
  CoreValue,
  SocialSkill,
  EmotionalSkill,
  BehaviorLesson,
  StoryLearningOutcomes,
  ValueLesson,
  SocialSkillLesson,
  EmotionalSkillLesson,
  VocabularyWord,
  SightWordEntry,
  getValuesForAgeBand,
  getSocialSkillsForSchoolLevel,
  getRecommendedValuesForCategory,
  VALUE_AGE_APPROPRIATENESS,
} from './types'

// =====================================================
// CHILD LIFE & CONTENT NEUTRALITY GUARDRAIL
// =====================================================

/**
 * MANDATORY CONTENT SAFETY POLICY
 *
 * All content must remain strictly age-appropriate and non-sexualized.
 * Romantic content is restricted based on age band.
 */
export const CONTENT_SAFETY_GUARDRAIL = `
═══════════════════════════════════════════════════════════════════════════════
MANDATORY CONTENT SAFETY GUARDRAIL - STRICTLY ENFORCED
═══════════════════════════════════════════════════════════════════════════════

All content MUST comply with the following non-negotiable safety requirements:

FOR ALL AGES (2-18+):
━━━━━━━━━━━━━━━━━━━━
ABSOLUTELY PROHIBITED:
✗ Sexualized content of any kind
✗ Explicit romantic/physical content
✗ Violence glorification or graphic content
✗ Drug/alcohol promotion
✗ Hate speech or discrimination
✗ Self-harm or dangerous behavior promotion

FOR ELEMENTARY & YOUNGER (Ages 2-11, Pre-K through Grade 5):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROHIBITED CONTENT:
1. Romantic relationships of ANY kind between ANY characters
2. Dating, crushes, attraction, or romantic interest themes
3. Marriage or wedding themes except parent/guardian references
4. Kissing, hand-holding, or physical affection beyond family/friendship norms
5. "Boyfriend," "girlfriend," or relationship-coded language
6. Heart symbols or imagery suggesting romantic love
7. Identity exploration related to relationships or attraction
8. Coded references or subtext about romantic relationships

PERMITTED RELATIONSHIP CONTEXTS ONLY:
✓ Family bonds: parents, guardians, siblings, grandparents, extended family
✓ Friendship: making friends, being a good friend, teamwork, cooperation
✓ Community: neighbors, teachers, coaches, librarians, community helpers
✓ Peer relationships: classmates, playmates, teammates (non-romantic only)
✓ Mentorship: learning from adults in appropriate roles
✓ Animal companions: pets, animal friends in stories

FOR MIDDLE SCHOOL (Ages 11-14, Grades 6-8):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERMITTED (handled appropriately):
✓ Age-appropriate "crush" storylines (butterflies, nervousness)
✓ Friendship evolving themes
✓ Identity exploration in age-appropriate ways
✓ Peer relationship dynamics
✓ Coming-of-age themes without romantic focus

STILL PROHIBITED:
✗ Dating or relationship-focused narratives
✗ Physical romantic content
✗ Relationship drama as central theme

FOR HIGH SCHOOL (Ages 14-18, Grades 9-12):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERMITTED (handled maturely and appropriately):
✓ Age-appropriate relationship themes
✓ Coming-of-age and identity narratives
✓ Social dynamics and peer relationships
✓ Mature themes handled thoughtfully (not explicitly)

STILL PROHIBITED:
✗ Explicit romantic/physical content
✗ Glorification of unhealthy relationships
✗ Sexualized content

EMOTIONAL THEMES BY AGE LEVEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ELEMENTARY & YOUNGER:
✓ Self-confidence and self-worth
✓ Kindness, empathy, and compassion
✓ Courage and facing fears
✓ Resilience and growth mindset
✓ Gratitude and appreciation
✓ Curiosity and wonder
✓ Responsibility and helping others
✓ Managing emotions (anger, sadness, worry, joy)
✓ Belonging to family, school, and community

MIDDLE SCHOOL (additions):
✓ Identity formation
✓ Peer pressure and decision-making
✓ Social justice awareness
✓ Academic and personal challenges
✓ Self-discovery

HIGH SCHOOL (additions):
✓ Complex moral dilemmas
✓ Civic responsibility
✓ Career exploration
✓ Global citizenship
✓ Independent thinking

CHARACTER DESIGN REQUIREMENTS:
- Age-appropriate attire for activities depicted
- Diverse, inclusive representation
- Cultural authenticity when representing specific cultures
- No sexualized clothing or appearance at any age

ILLUSTRATION REQUIREMENTS:
- No romantic poses or gazes for elementary and younger
- Age-appropriate compositions
- Cultural sensitivity in visual representation
- Characters depicted in contextually appropriate ways

PURPOSE OF THIS GUARDRAIL:
• Preserve developmentally appropriate content for all ages
• Respect diverse family values and cultural expectations
• Keep focus on learning, growth, and emotional well-being
• Avoid inappropriate exposure to content beyond developmental readiness

If ANY content request conflicts with these guardrails, you MUST:
1. Refuse to generate the prohibited content
2. Suggest an appropriate alternative that maintains the story's purpose
3. Ensure all output strictly adheres to age-appropriate themes

═══════════════════════════════════════════════════════════════════════════════
`

// =====================================================
// SYSTEM PROMPTS BY AGE BAND
// =====================================================

export const AGE_BAND_SYSTEM_PROMPTS: Record<AgeBand, string> = {
  pre_k: `You are a children's story writer specializing in books for Pre-K children (ages 2-4).

DEVELOPMENTAL GUIDELINES:
- Use extremely simple vocabulary (1-2 syllable words primarily)
- Very short sentences (3-6 words maximum)
- Maximum 10-15 words per page
- Heavy repetition of key words and phrases
- Focus on familiar, concrete concepts (family, animals, daily routines)
- Strong rhythm and rhyming when possible
- Each page should feature ONE simple action or idea

SIGHT WORDS TO EMPHASIZE (Dolch Pre-Primer):
a, and, away, big, blue, can, come, down, find, for, funny, go, help, here,
I, in, is, it, jump, little, look, make, me, my, not, one, play, red, run,
said, see, the, three, to, two, up, we, where, yellow, you

EMOTIONAL TONE:
- Warm, nurturing, and reassuring
- Celebrate small achievements
- Focus on feelings of safety, love, and belonging
- Simple cause and effect for emotions

ILLUSTRATION GUIDANCE:
- Describe scenes with clear, simple compositions
- One main focal point per illustration
- Bright, primary colors
- Expressive faces showing clear emotions
- Familiar settings (home, park, classroom)`,

  k_prep: `You are a children's story writer specializing in books for Kindergarten Prep children (ages 4-5).

DEVELOPMENTAL GUIDELINES:
- Simple vocabulary with occasional new words (defined in context)
- Short sentences (5-8 words average)
- Maximum 20-30 words per page
- Some repetition with slight variations
- Introduce basic story structure (beginning, middle, end)
- Focus on friendship, school readiness, and independence

SIGHT WORDS TO EMPHASIZE (Dolch Primer + Pre-Primer):
all, am, are, at, ate, be, black, brown, but, came, did, do, eat, four,
get, good, have, he, into, like, must, new, no, now, on, our, out, please,
pretty, ran, ride, saw, say, she, so, soon, that, there, they, this, too,
under, want, was, well, went, what, white, who, will, with, yes

EMOTIONAL TONE:
- Encouraging independence while validating fears
- Celebrate curiosity and trying new things
- Model positive social interactions
- Gentle problem-solving scenarios

ILLUSTRATION GUIDANCE:
- Clear scenes with 2-3 elements
- Show characters in action
- Include diverse representations
- Warm, inviting environments`,

  grade_1: `You are a children's story writer specializing in books for Grade 1 children (ages 5-6).

DEVELOPMENTAL GUIDELINES:
- Expanding vocabulary with context clues for new words
- Sentences of 6-10 words
- 30-50 words per page
- Beginning chapter-like structure (clear scenes)
- Simple plot with problem and resolution
- Themes: friendship, fairness, bravery, kindness

SIGHT WORDS TO EMPHASIZE (Dolch First Grade):
after, again, an, any, as, ask, by, could, every, fly, from, give, going,
had, has, her, him, his, how, just, know, let, live, may, of, old, once,
open, over, put, round, some, stop, take, thank, them, then, think, walk,
were, when

EMOTIONAL TONE:
- Acknowledge complexity of feelings
- Model emotional vocabulary
- Show characters working through challenges
- Celebrate effort and growth mindset

ILLUSTRATION GUIDANCE:
- Dynamic scenes showing action
- Multiple characters interacting
- Expressive body language
- Background details that support the story`,

  grade_2: `You are a children's story writer specializing in books for Grade 2 children (ages 6-7).

DEVELOPMENTAL GUIDELINES:
- Rich vocabulary with some challenging words
- Varied sentence structure (8-12 words)
- 50-80 words per page
- Multi-scene plots with character development
- Cause and effect relationships
- Themes: perseverance, empathy, responsibility, curiosity

SIGHT WORDS TO EMPHASIZE (Dolch Second Grade):
always, around, because, been, before, best, both, buy, call, cold, does,
don't, fast, first, five, found, gave, goes, green, its, made, many, off,
or, pull, read, right, sing, sit, sleep, tell, their, these, those, upon,
us, use, very, wash, which, why, wish, work, would, write, your

EMOTIONAL TONE:
- Explore nuanced emotions
- Multiple perspectives in conflicts
- Characters learn from mistakes
- Value both individual and community

ILLUSTRATION GUIDANCE:
- Complex scenes with depth
- Show emotional nuance in expressions
- Include environmental storytelling
- Action sequences possible`,

  grade_3: `You are a children's story writer specializing in books for Grade 3 children (ages 7-8).

DEVELOPMENTAL GUIDELINES:
- Sophisticated vocabulary appropriate for early readers
- Complex sentences with dependent clauses
- 80-120 words per page
- Chapter-style stories with subplots possible
- Characters face meaningful dilemmas
- Themes: integrity, courage, understanding differences, environmental awareness

SIGHT WORDS TO EMPHASIZE (Dolch Third Grade + Fry Words):
about, better, bring, carry, clean, cut, done, draw, drink, eight, fall,
far, full, got, grow, hold, hot, hurt, if, keep, kind, laugh, light, long,
much, myself, never, only, own, pick, seven, shall, show, six, small, start,
ten, today, together, try, warm

EMOTIONAL TONE:
- Morally complex situations without easy answers
- Characters with flaws who grow
- Friendship challenges and reconciliation
- Building empathy through perspective-taking

ILLUSTRATION GUIDANCE:
- Cinematic compositions
- Mood and atmosphere important
- Character consistency across pages
- Visual metaphors possible`,

  grade_4: `You are a children's story writer specializing in books for Grade 4 children (ages 9-10).

DEVELOPMENTAL GUIDELINES:
- Advanced vocabulary with literary language
- Varied and sophisticated sentence structures
- 100-150 words per page
- Full story arcs with character transformation
- Abstract concepts and deeper themes
- Themes: identity, justice, resilience, environmental stewardship, cultural appreciation

READING LEVEL:
- Flesch-Kincaid Grade Level 3.5-4.5
- Can include dialogue-heavy sections
- May use figurative language and idioms
- Can reference broader world concepts

EMOTIONAL TONE:
- Characters face real-world challenges
- Nuanced portrayal of relationships
- Growth through struggle
- Hope without toxic positivity

ILLUSTRATION GUIDANCE:
- Artistic style can be more varied
- Symbolic elements welcome
- Can show passage of time
- Characters show subtle emotions`,

  grade_5: `You are a story writer specializing in books for Grade 5 students (ages 10-11).

DEVELOPMENTAL GUIDELINES:
- Rich, varied vocabulary with context-embedded learning
- Complex sentence structures with subordinate clauses
- 120-180 words per page
- Multi-chapter stories with developed subplots
- Characters with internal conflicts and growth arcs
- Themes: cultural identity, historical perspectives, scientific discovery, social dynamics

READING LEVEL:
- Flesch-Kincaid Grade Level 4.5-5.5
- Extended dialogue and internal monologue
- Sophisticated figurative language
- Cross-curricular connections

EMOTIONAL TONE:
- Pre-adolescent experiences and transitions
- Complex friendships and peer dynamics
- Academic and personal challenges
- Self-discovery and capability building

ILLUSTRATION GUIDANCE:
- More sophisticated artistic styles acceptable
- Can include maps, diagrams, or infographics
- Cinematic compositions
- Mood and atmosphere emphasized`,

  // =====================================================
  // MIDDLE SCHOOL PROMPTS (Grades 6-8)
  // =====================================================

  grade_6: `You are a young adult story writer specializing in content for Grade 6 students (ages 11-12).

DEVELOPMENTAL GUIDELINES:
- Advanced vocabulary with academic language integration
- Varied sentence structures including compound-complex
- 150-220 words per page
- Full novels with multiple POV possible
- Characters navigating middle school transitions
- Themes: identity formation, peer relationships, academic challenges, cultural awareness

READING LEVEL:
- Flesch-Kincaid Grade Level 5.5-6.5
- Extended narrative with flashbacks/flash-forwards
- Literary devices: foreshadowing, symbolism, irony
- Real-world issue integration

EMOTIONAL TONE:
- Early adolescent concerns validated
- Navigating changing friendships
- Finding one's place and voice
- Dealing with increased expectations

ILLUSTRATION GUIDANCE (if applicable):
- Graphic novel style acceptable
- Minimal illustrations or chapter headers
- Maps, timelines for historical/geographic content
- Cover art and occasional spot illustrations`,

  grade_7: `You are a young adult story writer specializing in content for Grade 7 students (ages 12-13).

DEVELOPMENTAL GUIDELINES:
- Sophisticated vocabulary with discipline-specific terms
- Complex literary sentence structures
- 180-250 words per page
- Multi-layered narratives with thematic depth
- Characters facing moral dilemmas and ethical choices
- Themes: social justice, global citizenship, historical events, personal responsibility

READING LEVEL:
- Flesch-Kincaid Grade Level 6.5-7.5
- Unreliable narrators, multiple perspectives
- Advanced literary analysis appropriate
- Integration of primary source materials possible

EMOTIONAL TONE:
- Validate the intensity of adolescent emotions
- Explore consequences of choices
- Model healthy conflict resolution
- Address real-world challenges sensitively

CONTENT CONSIDERATIONS:
- Can address heavier themes (bullying, prejudice, loss) thoughtfully
- Social media and technology contexts relevant
- Global and historical perspectives important
- Always maintain hope and agency`,

  grade_8: `You are a young adult story writer specializing in content for Grade 8 students (ages 13-14).

DEVELOPMENTAL GUIDELINES:
- Mature vocabulary with nuanced meaning
- Sophisticated prose with varied pacing
- 200-300 words per page
- Complex narratives ready for high school transition
- Characters demonstrating emerging independence
- Themes: human rights, environmental issues, cultural conflicts, identity and belonging

READING LEVEL:
- Flesch-Kincaid Grade Level 7.5-8.5
- Can handle ambiguity and open endings
- Intertextual references appropriate
- Research and critical thinking integration

EMOTIONAL TONE:
- Honor the complexity of being 13-14
- Transition from childhood to young adulthood
- Relationships with adults evolving
- Preparing for increased independence

CONTENT CONSIDERATIONS:
- Historical fiction with accurate portrayal
- Social issues addressed with nuance
- Cultural representation with authenticity
- Mentorship and guidance themes`,

  // =====================================================
  // HIGH SCHOOL PROMPTS (Grades 9-12)
  // =====================================================

  grade_9: `You are a young adult/literary fiction writer for Grade 9 students (ages 14-15).

DEVELOPMENTAL GUIDELINES:
- Literary vocabulary with rich, precise language
- Varied prose styles matching content and genre
- 200-350 words per page
- Full-length novels with complex structure
- Characters navigating high school and identity
- Themes: self-discovery, social dynamics, moral complexity, future planning

READING LEVEL:
- Flesch-Kincaid Grade Level 8-9
- Genre flexibility (realistic fiction, sci-fi, fantasy, historical)
- Can include mature themes handled appropriately
- Literary merit considerations

EMOTIONAL TONE:
- Validate teenage experiences authentically
- Explore identity in multiple dimensions
- Academic and social pressures acknowledged
- Hope and agency through challenges

CONTENT SCOPE:
- World literature influences
- Contemporary social issues
- Historical events with personal impact
- Career and future exploration themes`,

  grade_10: `You are a literary fiction writer for Grade 10 students (ages 15-16).

DEVELOPMENTAL GUIDELINES:
- Sophisticated literary language
- Experimental narrative structures possible
- 250-400 words per page
- Complex character studies and social commentary
- Characters making consequential decisions
- Themes: world cultures, political awareness, moral philosophy, relationships

READING LEVEL:
- Flesch-Kincaid Grade Level 9-10
- World literature traditions
- Cross-cultural narratives
- Integration of historical and contemporary contexts

EMOTIONAL TONE:
- Honor emerging adult perspectives
- Complex ethical dilemmas
- Consequences of choices explored
- Global empathy development

CONTENT SCOPE:
- International settings and characters
- Social movements and change
- Environmental and sustainability themes
- Economic and social justice issues`,

  grade_11: `You are a literary fiction writer for Grade 11 students (ages 16-17).

DEVELOPMENTAL GUIDELINES:
- Advanced literary and academic vocabulary
- Mastery of multiple prose styles
- 300-450 words per page
- Publication-quality narrative structure
- Characters as vehicles for ideas and growth
- Themes: civic engagement, historical analysis, scientific ethics, leadership

READING LEVEL:
- Flesch-Kincaid Grade Level 10-11
- AP/IB literature connections
- Research-integrated narratives
- Argumentative elements possible

EMOTIONAL TONE:
- Near-adult perspectives validated
- Preparing for independent life
- Complex relationship dynamics
- Responsibility and consequence

CONTENT SCOPE:
- College and career preparation themes
- Leadership and service
- Global affairs and citizenship
- Legacy and impact considerations`,

  grade_12: `You are a literary fiction writer for Grade 12 students (ages 17-18).

DEVELOPMENTAL GUIDELINES:
- College-level vocabulary and prose
- Full range of literary techniques
- 350-500 words per page
- Thesis-worthy narrative complexity
- Characters at threshold of adulthood
- Themes: life transitions, philosophical inquiry, global responsibility, identity synthesis

READING LEVEL:
- Flesch-Kincaid Grade Level 11-12+
- Integration with academic study
- Literary criticism awareness
- Original voice development

EMOTIONAL TONE:
- Transition to adulthood honored
- Uncertainty and possibility balanced
- Legacy of childhood integrated
- Future-facing with grounded wisdom

CONTENT SCOPE:
- Capstone themes and reflections
- Global citizenship preparation
- Career and life purpose exploration
- Intergenerational wisdom and continuity
- Philosophy and meaning-making`,
}

// =====================================================
// STORY GENERATION PROMPT TEMPLATE
// =====================================================

export interface StoryGenerationInput {
  category: StoryCategory
  ageBand: AgeBand
  theme: string
  emotionalFocus: string[]
  sightWords: string[]
  pageCount: number
  characterName?: string
  characterDescription?: string
  setting?: string
  colorPalette?: string
}

/**
 * Extended story generation input with learning outcomes targeting
 */
export interface StoryGenerationInputWithLearning extends StoryGenerationInput {
  // Target values to teach
  targetValues?: CoreValue[]
  primaryValue?: CoreValue

  // Target skills to develop
  targetSocialSkills?: SocialSkill[]
  targetEmotionalSkills?: EmotionalSkill[]

  // Behavior lessons to model
  targetBehaviors?: BehaviorLesson[]

  // Curriculum alignment
  curriculumStandards?: string[]

  // Vocabulary targets
  vocabularyWords?: string[]
  vocabularyDifficulty?: 1 | 2 | 3 | 4 | 5

  // Include learning outcomes in output
  includeLearningOutcomes?: boolean
}

export function generateStoryPrompt(input: StoryGenerationInput): string {
  const systemPrompt = AGE_BAND_SYSTEM_PROMPTS[input.ageBand]

  return `${systemPrompt}

${CONTENT_SAFETY_GUARDRAIL}

---

STORY REQUEST:

Category: ${input.category}
Theme: ${input.theme}
Number of Pages: ${input.pageCount}
${input.characterName ? `Main Character: ${input.characterName}` : ''}
${input.characterDescription ? `Character Description: ${input.characterDescription}` : ''}
${input.setting ? `Setting: ${input.setting}` : ''}

EMOTIONAL FOCUS:
${input.emotionalFocus.length > 0 ? input.emotionalFocus.map(e => `- ${e}`).join('\n') : '- general positive emotions'}

REQUIRED SIGHT WORDS TO INCLUDE:
${input.sightWords.length > 0 ? input.sightWords.join(', ') : 'Use age-appropriate sight words naturally'}

---

OUTPUT FORMAT:

Please generate a complete story with exactly ${input.pageCount} pages in the following JSON format:

\`\`\`json
{
  "title": "Story Title",
  "description": "A brief 1-2 sentence description for parents/teachers",
  "pages": [
    {
      "page_number": 1,
      "text_content": "The story text for this page",
      "illustration_prompt": "Detailed description for DALL-E to generate the illustration",
      "highlighted_words": ["sight", "words", "to", "highlight"]
    }
  ],
  "reading_time_minutes": 5,
  "word_count": 150,
  "vocabulary_words": ["new", "words", "introduced"],
  "discussion_questions": [
    "Question 1 for after reading?",
    "Question 2 for after reading?"
  ]
}
\`\`\`

IMPORTANT GUIDELINES:
1. Each page's text should be appropriate length for the age band
2. Sight words should appear naturally, not forced
3. Illustration prompts should be detailed, child-safe, and match the story
4. The story should have a clear beginning, middle, and end
5. Include the required sight words at least once each
6. Ensure emotional themes are woven naturally into the narrative
${input.colorPalette ? `7. Illustrations should use a ${input.colorPalette} color palette` : ''}`
}

// =====================================================
// ENHANCED STORY GENERATION WITH LEARNING OUTCOMES
// =====================================================

/**
 * Generate a story prompt that includes learning outcomes extraction
 */
export function generateStoryPromptWithLearning(input: StoryGenerationInputWithLearning): string {
  const systemPrompt = AGE_BAND_SYSTEM_PROMPTS[input.ageBand]
  const schoolLevel = getSchoolLevel(input.ageBand)

  // Get appropriate values and skills for this age
  const appropriateValues = getValuesForAgeBand(input.ageBand)
  const appropriateSocialSkills = getSocialSkillsForSchoolLevel(schoolLevel)
  const recommendedValues = getRecommendedValuesForCategory(input.category)

  // Determine target values (use provided or recommended)
  const targetValues = input.targetValues?.length
    ? input.targetValues
    : recommendedValues.filter(v => appropriateValues.includes(v))

  const primaryValue = input.primaryValue || targetValues[0] || 'kindness'

  // Build learning objectives section
  const learningObjectives = buildLearningObjectives(input, targetValues, appropriateSocialSkills)

  return `${systemPrompt}

${CONTENT_SAFETY_GUARDRAIL}

---

STORY REQUEST:

Category: ${input.category}
Theme: ${input.theme}
Number of Pages: ${input.pageCount}
${input.characterName ? `Main Character: ${input.characterName}` : ''}
${input.characterDescription ? `Character Description: ${input.characterDescription}` : ''}
${input.setting ? `Setting: ${input.setting}` : ''}

EMOTIONAL FOCUS:
${input.emotionalFocus.length > 0 ? input.emotionalFocus.map(e => `- ${e}`).join('\n') : '- general positive emotions'}

REQUIRED SIGHT WORDS TO INCLUDE:
${input.sightWords.length > 0 ? input.sightWords.join(', ') : 'Use age-appropriate sight words naturally'}

---

${learningObjectives}

---

OUTPUT FORMAT:

Please generate a complete story with exactly ${input.pageCount} pages in the following JSON format:

\`\`\`json
{
  "title": "Story Title",
  "description": "A brief 1-2 sentence description for parents/teachers",
  "pages": [
    {
      "page_number": 1,
      "text_content": "The story text for this page",
      "illustration_prompt": "Detailed description for DALL-E to generate the illustration",
      "highlighted_words": ["sight", "words", "to", "highlight"],
      "vocabulary_on_page": [
        {
          "word": "vocabulary_word",
          "definition": "Simple definition",
          "context": "How it's used in the sentence"
        }
      ]
    }
  ],
  "reading_time_minutes": 5,
  "word_count": 150,
  "discussion_questions": [
    "Question 1 for after reading?",
    "Question 2 for after reading?"
  ],
  "learning_outcomes": {
    "sight_words": [
      {
        "word": "the",
        "frequency": 5,
        "pages": [1, 2, 3, 4, 5]
      }
    ],
    "vocabulary_words": [
      {
        "word": "example",
        "definition": "A thing used to illustrate something",
        "part_of_speech": "noun",
        "difficulty_level": 2,
        "context_sentence": "Here is an example of kindness."
      }
    ],
    "value_lessons": [
      {
        "value": "${primaryValue}",
        "lesson_summary": "Brief description of what the story teaches about this value",
        "story_moment": "The specific scene or event that demonstrates this value",
        "character_models": ["Character Name"],
        "discussion_prompt": "A question to discuss this value with the child"
      }
    ],
    "social_skills": [
      {
        "skill": "sharing_toys",
        "demonstration": "How the skill is shown in the story",
        "characters_involved": ["Character Name"],
        "positive_outcome": "What good came from using this skill"
      }
    ],
    "emotional_skills": [
      {
        "skill": "managing_anger",
        "scenario": "The emotional situation in the story",
        "strategy_shown": "The coping strategy demonstrated",
        "outcome": "How the character felt after using the strategy"
      }
    ],
    "behavior_lessons": ["bedtime_routine", "being_a_good_friend"],
    "primary_value": "${primaryValue}",
    "secondary_values": [${targetValues.slice(1, 4).map(v => `"${v}"`).join(', ')}],
    "overall_difficulty": 2,
    "reading_complexity": 2,
    "concept_complexity": 2
  }
}
\`\`\`

IMPORTANT GUIDELINES:
1. Each page's text should be appropriate length for the age band
2. Sight words should appear naturally, not forced
3. Illustration prompts should be detailed, child-safe, and match the story
4. The story should have a clear beginning, middle, and end
5. Include the required sight words at least once each
6. Ensure emotional themes are woven naturally into the narrative
7. VALUE LESSONS MUST be demonstrated through character actions, not stated directly
8. Social and emotional skills should be modeled by characters organically
9. Include at least ONE clear value lesson and ONE skill demonstration
10. Learning outcomes should feel natural, not forced or preachy
${input.colorPalette ? `11. Illustrations should use a ${input.colorPalette} color palette` : ''}`
}

/**
 * Build the learning objectives section for the prompt
 */
function buildLearningObjectives(
  input: StoryGenerationInputWithLearning,
  targetValues: CoreValue[],
  appropriateSocialSkills: SocialSkill[]
): string {
  const schoolLevel = getSchoolLevel(input.ageBand)

  let objectives = `LEARNING OBJECTIVES:

This story should naturally teach and reinforce the following learning outcomes.
DO NOT be preachy or explicit - weave these lessons into the narrative through
character actions, consequences, and emotional journeys.

PRIMARY VALUE TO TEACH: ${input.primaryValue || targetValues[0] || 'kindness'}
${VALUE_AGE_APPROPRIATENESS[input.primaryValue || targetValues[0] || 'kindness']?.description || ''}

SECONDARY VALUES (include 1-2 naturally):
${targetValues.slice(1, 4).map(v => `- ${v}: ${VALUE_AGE_APPROPRIATENESS[v]?.description || ''}`).join('\n')}
`

  // Add social skills targets
  if (input.targetSocialSkills?.length) {
    objectives += `
SOCIAL SKILLS TO MODEL:
${input.targetSocialSkills.map(s => `- ${s.replace(/_/g, ' ')}`).join('\n')}
`
  } else {
    // Suggest appropriate skills
    const suggestedSkills = appropriateSocialSkills.slice(0, 3)
    objectives += `
SUGGESTED SOCIAL SKILLS (include at least 1):
${suggestedSkills.map(s => `- ${s.replace(/_/g, ' ')}`).join('\n')}
`
  }

  // Add emotional skills targets
  if (input.targetEmotionalSkills?.length) {
    objectives += `
EMOTIONAL SKILLS TO DEVELOP:
${input.targetEmotionalSkills.map(s => `- ${s.replace(/_/g, ' ')}`).join('\n')}
`
  } else {
    // Suggest based on emotional focus
    objectives += `
EMOTIONAL DEVELOPMENT:
Show characters experiencing and appropriately managing emotions related to: ${input.emotionalFocus.join(', ') || 'general emotional growth'}
`
  }

  // Add behavior lessons
  if (input.targetBehaviors?.length) {
    objectives += `
BEHAVIOR LESSONS TO MODEL:
${input.targetBehaviors.map(b => `- ${b.replace(/_/g, ' ')}`).join('\n')}
`
  }

  // Add vocabulary targets
  if (input.vocabularyWords?.length) {
    objectives += `
TARGET VOCABULARY WORDS TO INTRODUCE:
${input.vocabularyWords.join(', ')}
Vocabulary Difficulty Level: ${input.vocabularyDifficulty || 2}/5
`
  }

  // Add curriculum standards
  if (input.curriculumStandards?.length) {
    objectives += `
CURRICULUM STANDARDS TO ADDRESS:
${input.curriculumStandards.map(s => `- ${s}`).join('\n')}
`
  }

  // Add age-specific guidance
  objectives += `
AGE-APPROPRIATE GUIDANCE FOR ${schoolLevel.replace(/_/g, ' ').toUpperCase()}:
`

  switch (schoolLevel) {
    case 'early_childhood':
      objectives += `- Use very simple cause-and-effect for lessons
- Show emotions through facial expressions and actions
- Keep value demonstrations concrete and visual
- Use repetition to reinforce lessons
- Characters should be models to imitate`
      break
    case 'elementary':
      objectives += `- Characters can verbalize their feelings and choices
- Show natural consequences of behavior
- Include moments of reflection after key events
- Use dialogue to express values
- Allow characters to make mistakes and learn`
      break
    case 'middle_school':
      objectives += `- Present moral complexity without easy answers
- Characters should face genuine dilemmas
- Explore multiple perspectives on issues
- Allow for nuanced understanding of values
- Include peer dynamics and social pressure`
      break
    case 'high_school':
      objectives += `- Address values in societal context
- Explore ethical reasoning and consequences
- Characters grapple with real-world complexity
- Allow ambiguity and growth
- Connect personal values to civic responsibility`
      break
  }

  return objectives
}

/**
 * Extract learning outcomes from generated story JSON
 */
export function parseLearningOutcomes(generatedStory: {
  learning_outcomes?: Partial<StoryLearningOutcomes>
  pages?: Array<{ vocabulary_on_page?: Array<{ word: string; definition: string; context: string }> }>
  discussion_questions?: string[]
}): Partial<StoryLearningOutcomes> {
  if (!generatedStory.learning_outcomes) {
    return {}
  }

  const outcomes = generatedStory.learning_outcomes

  return {
    sight_words: outcomes.sight_words || [],
    sight_word_count: outcomes.sight_words?.reduce((sum, sw) => sum + (sw.frequency || 0), 0) || 0,
    vocabulary_words: outcomes.vocabulary_words || [],
    vocabulary_count: outcomes.vocabulary_words?.length || 0,
    vocabulary_difficulty_avg: outcomes.vocabulary_words?.length
      ? outcomes.vocabulary_words.reduce((sum, v) => sum + (v.difficulty_level || 2), 0) / outcomes.vocabulary_words.length
      : 2,
    value_lessons: outcomes.value_lessons || [],
    primary_value: outcomes.primary_value,
    secondary_values: outcomes.secondary_values || [],
    social_skills: outcomes.social_skills || [],
    emotional_skills: outcomes.emotional_skills || [],
    behavior_lessons: outcomes.behavior_lessons || [],
    curriculum_standards: outcomes.curriculum_standards || [],
    comprehension_question_count: generatedStory.discussion_questions?.length || 0,
    overall_difficulty: outcomes.overall_difficulty || 2,
    reading_complexity: outcomes.reading_complexity || 2,
    concept_complexity: outcomes.concept_complexity || 2,
    generated_by: 'ai',
  }
}

/**
 * Get default learning targets for a story generation request
 */
export function getDefaultLearningTargets(
  category: StoryCategory,
  ageBand: AgeBand
): Pick<StoryGenerationInputWithLearning, 'targetValues' | 'primaryValue' | 'targetSocialSkills' | 'targetEmotionalSkills'> {
  const schoolLevel = getSchoolLevel(ageBand)
  const recommendedValues = getRecommendedValuesForCategory(category)
  const appropriateValues = getValuesForAgeBand(ageBand)
  const appropriateSocialSkills = getSocialSkillsForSchoolLevel(schoolLevel)

  // Filter recommended values to age-appropriate ones
  const targetValues = recommendedValues.filter(v => appropriateValues.includes(v))

  // Get emotional skills based on school level
  const emotionalSkillsByLevel: Record<SchoolLevel, EmotionalSkill[]> = {
    early_childhood: ['identifying_basic_emotions', 'naming_feelings', 'asking_for_comfort'],
    elementary: ['expressing_feelings_appropriately', 'calming_down_strategies', 'managing_anger', 'coping_with_disappointment'],
    middle_school: ['emotional_awareness', 'stress_management', 'growth_mindset', 'empathic_responding'],
    high_school: ['emotional_intelligence', 'self_compassion', 'managing_complex_emotions', 'supporting_others_emotionally'],
  }

  return {
    targetValues,
    primaryValue: targetValues[0],
    targetSocialSkills: appropriateSocialSkills.slice(0, 3),
    targetEmotionalSkills: emotionalSkillsByLevel[schoolLevel]?.slice(0, 2) || [],
  }
}

// =====================================================
// ILLUSTRATION PROMPT TEMPLATES
// =====================================================

export const ILLUSTRATION_STYLE_PROMPTS: Record<string, string> = {
  soft_flat: `Style: Soft, flat illustration style with gentle gradients.
Characteristics: Rounded shapes, warm lighting, minimal shadows,
pastel-leaning colors with pops of brightness. Similar to modern
children's book illustrations by artists like Christian Robinson or
Carson Ellis. Clean, uncluttered compositions.`,

  watercolor: `Style: Digital watercolor illustration style.
Characteristics: Soft, flowing edges, visible brush textures,
gentle color bleeds, dreamy atmosphere. Light and airy feel
with translucent color layers. Whimsical and magical quality.`,

  playful_vector: `Style: Playful vector illustration style.
Characteristics: Bold outlines, bright saturated colors,
geometric shapes, clear defined edges. Fun and energetic feel,
similar to Charley Harper or Malika Favre. Modern and graphic.`,

  cozy_textured: `Style: Cozy textured illustration style.
Characteristics: Visible paper or canvas textures, warm earthy
tones, hand-drawn quality, nostalgic feel. Reminiscent of
classic children's books. Comfortable and inviting atmosphere.`,

  whimsical_detailed: `Style: Whimsical detailed illustration style.
Characteristics: Rich details to discover, fantastical elements,
intricate patterns, magical realism. Layers of visual storytelling.
Encourages close examination and imagination.`
}

export function generateIllustrationPrompt(
  sceneDescription: string,
  style: string = 'soft_flat',
  colorPalette?: string,
  characterDescription?: string
): string {
  const stylePrompt = ILLUSTRATION_STYLE_PROMPTS[style] || ILLUSTRATION_STYLE_PROMPTS.soft_flat

  return `Create a children's book illustration for the following scene:

SCENE: ${sceneDescription}

${stylePrompt}

${characterDescription ? `CHARACTER DETAILS: ${characterDescription}` : ''}
${colorPalette ? `COLOR PALETTE: ${colorPalette}` : ''}

CHILD CONTENT SAFETY REQUIREMENTS (STRICTLY ENFORCED):
- Child-appropriate content ONLY (ages 2-10)
- No romantic themes, poses, or relationship imagery
- No couple-coded compositions or romantic gazes
- No heart symbols suggesting romantic love
- Characters interact as friends, family, or community only
- Age-appropriate clothing and appearance
- No suggestive elements of any kind
- Diverse, inclusive representation
- Warm, inviting, and safe atmosphere

GENERAL SAFETY:
- No scary or threatening elements
- No violence or conflict imagery
- Clear, positive emotional tone
- Family-friendly in all aspects

TECHNICAL REQUIREMENTS:
- High resolution suitable for both mobile and print
- Landscape orientation (16:9 aspect ratio)
- Leave some space for text overlay if needed
- Ensure main subjects are clearly visible
- No text in the image`
}

// =====================================================
// CATEGORY-SPECIFIC PROMPTS
// =====================================================

export const CATEGORY_THEMES: Record<StoryCategory, string[]> = {
  // Original Categories
  bedtime: [
    'Saying goodnight to the day',
    'Cozy bedtime routines',
    'Dream adventures',
    'Nighttime sounds and peace',
    'The moon and stars watching over',
    'Sleepy animal friends',
  ],
  seasonal: [
    'Seasons changing',
    'Holiday traditions',
    'Seasonal celebrations',
    'Weather wonders',
    'Nature through the year',
    'Cultural seasonal observances',
  ],
  cultural: [
    'Celebrating heritage',
    'Traditional customs and practices',
    'Cultural foods and recipes',
    'Traditional clothing and dress',
    'Festivals around the world',
    'Family traditions from different cultures',
  ],
  curriculum: [
    'Counting and math adventures',
    'Science exploration',
    'Historical events',
    'Geography discoveries',
    'Language and literacy',
    'Social studies concepts',
  ],
  emotional_social: [
    'Making a new friend',
    'Handling big feelings',
    'Being kind to others',
    'Sharing and taking turns',
    'Feeling left out and belonging',
    'Understanding different perspectives',
  ],
  school: [
    'First day feelings',
    'Making classroom friends',
    'Learning something new',
    'Show and tell',
    'Playground adventures',
    'Teacher appreciation',
  ],
  family: [
    'Special time with family',
    'New siblings',
    'Visiting grandparents',
    'Family traditions',
    'Helping at home',
    'Multi-generational stories',
  ],
  adventure: [
    'Exploring a new place',
    'Finding hidden treasures',
    'Making unexpected discoveries',
    'Overcoming a small challenge',
    'Journey with a friend',
    'Nature exploration',
  ],

  // New Global/Geographic Categories
  world_cultures: [
    'Day in the life in different countries',
    'Traditional games from around the world',
    'Foods and cuisines across cultures',
    'Music and dance traditions',
    'Art and crafts from different cultures',
    'Languages and communication',
    'Celebrations and festivals worldwide',
    'Traditional stories retold',
  ],
  geography_adventures: [
    'Exploring continents and countries',
    'Mountain and river journeys',
    'Ocean and island discoveries',
    'Desert and rainforest expeditions',
    'City and countryside contrasts',
    'Climate and ecosystems',
    'Maps and navigation',
    'Travel and transportation',
  ],
  historical_fiction: [
    'Ancient civilizations',
    'Medieval times and castles',
    'Age of exploration',
    'Industrial revolution era',
    'World War periods (age-appropriate)',
    'Civil rights movements',
    'Space age adventures',
    'Modern history events',
  ],
  mythology_folklore: [
    'Greek and Roman myths',
    'Norse mythology',
    'African folklore and tales',
    'Asian legends and stories',
    'Native American traditions',
    'Celtic and European folklore',
    'South American myths',
    'Creation stories from cultures',
  ],
  global_citizenship: [
    'Environmental responsibility',
    'Human rights and dignity',
    'Peace and conflict resolution',
    'Economic fairness and trade',
    'Cultural respect and understanding',
    'Community action and service',
    'Democratic participation',
    'Global challenges and solutions',
  ],
  environmental: [
    'Climate and weather patterns',
    'Endangered species protection',
    'Ocean conservation',
    'Forest preservation',
    'Sustainable living',
    'Renewable energy',
    'Reducing waste and recycling',
    'Protecting natural habitats',
  ],
  stem_stories: [
    'Scientific discoveries',
    'Inventors and innovations',
    'Space and astronomy',
    'Biology and nature science',
    'Technology and coding',
    'Engineering challenges',
    'Math in everyday life',
    'Medical breakthroughs',
  ],
  biography: [
    'Scientists and inventors',
    'Artists and musicians',
    'Leaders and activists',
    'Explorers and adventurers',
    'Athletes and champions',
    'Writers and poets',
    'Everyday heroes',
    'Trailblazers who changed history',
  ],
  coming_of_age: [
    'Finding your identity',
    'First major responsibilities',
    'Navigating friendships',
    'Dealing with change',
    'Discovering talents and passions',
    'Standing up for yourself',
    'Family dynamics and growth',
    'Planning for the future',
  ],
  social_issues: [
    'Bullying and standing up',
    'Inclusion and acceptance',
    'Economic differences',
    'Immigration stories',
    'Gender equality',
    'Disability awareness',
    'Mental health awareness',
    'Community and belonging',
  ],
}

// =====================================================
// SIGHT WORD LISTS BY GRADE LEVEL
// =====================================================

export const SIGHT_WORDS_BY_LEVEL: Record<AgeBand, string[]> = {
  pre_k: [
    'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
    'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little',
    'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
    'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you',
  ],
  k_prep: [
    'all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came',
    'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
    'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran',
    'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
    'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will',
    'with', 'yes',
  ],
  grade_1: [
    'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly',
    'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just',
    'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put',
    'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were',
    'when',
  ],
  grade_2: [
    'always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call', 'cold',
    'does', "don't", 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green', 'its',
    'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing', 'sit', 'sleep',
    'tell', 'their', 'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which',
    'why', 'wish', 'work', 'would', 'write', 'your',
  ],
  grade_3: [
    'about', 'better', 'bring', 'carry', 'clean', 'cut', 'done', 'draw', 'drink', 'eight',
    'fall', 'far', 'full', 'got', 'grow', 'hold', 'hot', 'hurt', 'if', 'keep',
    'kind', 'laugh', 'light', 'long', 'much', 'myself', 'never', 'only', 'own', 'pick',
    'seven', 'shall', 'show', 'six', 'small', 'start', 'ten', 'today', 'together', 'try',
    'warm',
  ],
  grade_4: [
    'above', 'across', 'against', 'along', 'already', 'although', 'among', 'answer', 'behind', 'believe',
    'below', 'between', 'beyond', 'built', 'caught', 'certain', 'change', 'children', 'country', 'course',
    'different', 'during', 'early', 'earth', 'enough', 'example', 'family', 'finally', 'follow', 'great',
    'group', 'heard', 'however', 'important', 'interest', 'known', 'learn', 'leave', 'might', 'number',
    'often', 'order', 'perhaps', 'place', 'point', 'problem', 'question', 'ready', 'really', 'remember',
    'school', 'second', 'sentence', 'should', 'since', 'something', 'sometimes', 'sound', 'special', 'still',
    'story', 'study', 'such', 'sure', 'though', 'thought', 'through', 'understand', 'until', 'usually',
    'whole', 'without', 'world', 'young',
  ],
  grade_5: [
    'ability', 'achieve', 'ancient', 'benefit', 'century', 'character', 'community', 'compare', 'conclusion',
    'contrast', 'culture', 'decision', 'describe', 'develop', 'discover', 'effect', 'environment', 'especially',
    'evidence', 'experience', 'government', 'history', 'imagine', 'include', 'individual', 'influence',
    'information', 'necessary', 'opportunity', 'particular', 'population', 'process', 'produce', 'purpose',
    'region', 'represent', 'resource', 'similar', 'solution', 'structure', 'suggest', 'support', 'tradition',
  ],
  // Middle school and above: focus shifts from sight words to academic vocabulary
  // These are high-frequency academic words for each level
  grade_6: [
    'analyze', 'approach', 'assume', 'authority', 'available', 'circumstance', 'complex', 'concept',
    'consequence', 'considerable', 'context', 'contribute', 'crucial', 'demonstrate', 'distinct',
    'emphasis', 'establish', 'evaluate', 'factor', 'function', 'identify', 'impact', 'indicate',
    'interpret', 'involve', 'method', 'occur', 'perspective', 'principle', 'significant', 'source',
    'specific', 'strategy', 'theory', 'vary',
  ],
  grade_7: [
    'acquire', 'advocate', 'alternative', 'approximate', 'assess', 'comprehensive', 'conduct',
    'constitute', 'construct', 'criteria', 'dimension', 'evident', 'explicit', 'extract', 'fundamental',
    'generate', 'hypothesis', 'implement', 'implicit', 'initial', 'investigate', 'justify', 'maintain',
    'modify', 'obtain', 'perceive', 'phenomenon', 'relevant', 'resolve', 'reveal', 'significant',
    'subsequent', 'sustain', 'valid',
  ],
  grade_8: [
    'abstract', 'acknowledge', 'adequate', 'adjacent', 'advocate', 'ambiguous', 'analogy', 'attribute',
    'coherent', 'compatible', 'contemporary', 'contradict', 'correlate', 'deduce', 'derive', 'discriminate',
    'empirical', 'enhance', 'ethical', 'formulate', 'hierarchy', 'ideology', 'inherent', 'integral',
    'liable', 'paradigm', 'parameter', 'predominant', 'premise', 'prevalent', 'rationale', 'simulate',
    'subordinate', 'synthesize',
  ],
  grade_9: [
    'aesthetic', 'affirm', 'alienate', 'allusion', 'ambivalent', 'articulate', 'assertion', 'brevity',
    'causality', 'cogent', 'compelling', 'connotation', 'consensus', 'contention', 'credible', 'denote',
    'dichotomy', 'disposition', 'elucidate', 'exemplify', 'facilitate', 'feasible', 'foreshadow',
    'illuminate', 'inference', 'irony', 'juxtaposition', 'metaphor', 'motif', 'nuance', 'objectivity',
    'paradox', 'rhetoric', 'satirical', 'thematic',
  ],
  grade_10: [
    'adversary', 'allegory', 'annotation', 'archetype', 'autonomy', 'catharsis', 'chronicle', 'circumvent',
    'cohesive', 'concur', 'conjecture', 'delineate', 'didactic', 'discourse', 'disseminate', 'eloquent',
    'epiphany', 'explication', 'extrapolate', 'hegemony', 'hyperbole', 'infer', 'innuendo', 'intrinsic',
    'manifesto', 'mediate', 'pathos', 'pragmatic', 'protagonist', 'reciprocal', 'refute', 'substantiate',
    'trajectory', 'verisimilitude',
  ],
  grade_11: [
    'advocacy', 'antithesis', 'authenticate', 'cognition', 'corroborate', 'dialectic', 'dichotomy',
    'disposition', 'dissent', 'efficacy', 'egalitarian', 'empiricism', 'epistemology', 'ethos', 'exigent',
    'explicate', 'fallacy', 'hermeneutics', 'hubris', 'ideology', 'imperialism', 'inference', 'logos',
    'machination', 'meritocracy', 'nihilism', 'ontology', 'pathos', 'polemic', 'postulate', 'predicate',
    'progenitor', 'solipsism', 'synthesis',
  ],
  grade_12: [
    'anachronism', 'antecedent', 'apotheosis', 'archaic', 'axiom', 'brevity', 'causation', 'conceit',
    'cosmopolitan', 'deconstruct', 'determinism', 'dialectical', 'didacticism', 'dualism', 'enlightenment',
    'epistemological', 'existential', 'humanism', 'idealism', 'materialism', 'metaphysical', 'modernism',
    'naturalism', 'nominalism', 'ontological', 'paradigmatic', 'phenomenology', 'postmodernism', 'rationalism',
    'reductionism', 'relativism', 'romanticism', 'transcendentalism', 'utilitarianism',
  ],
}

// =====================================================
// EMOTIONAL FOCUS DESCRIPTORS
// =====================================================

export const EMOTIONAL_FOCUS_PROMPTS: Record<string, string> = {
  // Self-regulation emotions
  calm: 'Include moments of peaceful calm, breathing, and relaxation. Show characters finding their quiet center.',
  patience: 'Model waiting and delayed gratification. Characters learn that good things take time.',
  self_regulation: 'Show characters recognizing big feelings and using healthy strategies to manage them.',

  // Positive emotions
  joy: 'Celebrate moments of pure happiness and delight. Let characters experience wonder and excitement.',
  gratitude: 'Weave in appreciation for small things, people, and experiences. Model thankfulness.',
  confidence: 'Show characters believing in themselves, trying new things, and being proud of their efforts.',

  // Social emotions
  empathy: 'Help characters understand and share the feelings of others. Model perspective-taking.',
  kindness: 'Show acts of kindness, big and small. Demonstrate how kindness creates ripples.',
  belonging: 'Create moments of inclusion and acceptance. Characters find their place and people.',

  // Growth emotions
  curiosity: 'Encourage wonder and questioning. Characters explore and discover with enthusiasm.',
  resilience: 'Show characters bouncing back from setbacks. Model the growth mindset.',
  courage: 'Depict bravery in age-appropriate ways. Characters face fears and try difficult things.',

  // Challenging emotions (handled sensitively)
  worry: 'Acknowledge anxiety as normal while showing healthy coping. Characters work through fears.',
  anger: 'Model healthy expression of anger. Characters learn that all feelings are valid.',
  sadness: 'Allow space for grief and disappointment. Show that sadness passes and support helps.',
  loneliness: 'Validate feeling alone while showing paths to connection. Characters find community.'
}

// =====================================================
// HELPER: BUILD COMPLETE GENERATION REQUEST
// =====================================================

export function buildCompletePrompt(input: StoryGenerationInput): {
  systemPrompt: string
  userPrompt: string
  illustrationStyle: string
} {
  const systemPrompt = AGE_BAND_SYSTEM_PROMPTS[input.ageBand]
  const userPrompt = generateStoryPrompt(input)

  // Add emotional focus context
  const emotionalContext = input.emotionalFocus
    .map(ef => EMOTIONAL_FOCUS_PROMPTS[ef])
    .filter(Boolean)
    .join('\n\n')

  const fullUserPrompt = emotionalContext
    ? `${userPrompt}\n\nEMOTIONAL GUIDANCE:\n${emotionalContext}`
    : userPrompt

  return {
    systemPrompt,
    userPrompt: fullUserPrompt,
    illustrationStyle: ILLUSTRATION_STYLE_PROMPTS.soft_flat,
  }
}

// =====================================================
// CULTURAL CONTEXT PROMPTS
// =====================================================

export const CONTINENT_PROMPTS: Record<Continent, string> = {
  africa: `Setting: African Continent
Cultural Context: Africa is incredibly diverse with 54 countries and thousands of ethnic groups.
Common Themes:
- Ubuntu philosophy (I am because we are)
- Respect for elders and community
- Oral storytelling traditions (griots)
- Connection to nature and animals
- Family and extended family bonds
- Traditional wisdom and proverbs

Visual Elements:
- Diverse landscapes: savannas, rainforests, deserts, mountains
- Rich textile traditions: kente, mud cloth, batik
- Wildlife: elephants, lions, giraffes, unique bird species
- Traditional architecture: from mud houses to modern cities
- Vibrant colors and patterns

Ensure cultural authenticity without stereotyping. Africa is modern and traditional, urban and rural.`,

  asia: `Setting: Asian Continent
Cultural Context: Asia spans from the Middle East to the Pacific, with incredible diversity.
Common Themes:
- Harmony and balance
- Family honor and respect
- Educational achievement
- Traditional arts and practices
- Seasonal festivals and celebrations
- Balance of modernity and tradition

Visual Elements:
- Diverse landscapes: mountains, rivers, islands, steppes
- Traditional architecture: temples, pagodas, palaces
- Cuisine and food culture
- Traditional dress: kimono, hanbok, sari, ao dai
- Calligraphy and art traditions

Represent the diversity of Asian cultures without conflating distinct traditions.`,

  europe: `Setting: European Continent
Cultural Context: Europe blends ancient history with modern culture across many nations.
Common Themes:
- Rich history and heritage
- Literary and artistic traditions
- Democratic values and debate
- Seasonal changes and celebrations
- Family meals and gatherings
- Environmental awareness

Visual Elements:
- Historic architecture: castles, cathedrals, villages
- Diverse landscapes: Alps, Mediterranean, Nordic fjords
- Art and museum culture
- Traditional crafts and industries
- Seasonal festivals and markets

Represent European diversity from Nordic to Mediterranean, East to West.`,

  north_america: `Setting: North American Continent
Cultural Context: North America is a melting pot of Indigenous, immigrant, and developing cultures.
Common Themes:
- Indigenous traditions and respect for land
- Immigration and multicultural heritage
- Innovation and entrepreneurship
- Community diversity
- Natural wonder and conservation
- Democratic participation

Visual Elements:
- Diverse landscapes: prairies, canyons, forests, coastlines
- Urban and rural contrasts
- Indigenous art and traditions
- Multicultural neighborhoods
- National parks and natural beauty

Honor Indigenous cultures and the multicultural reality of North America.`,

  south_america: `Setting: South American Continent
Cultural Context: South America blends Indigenous, European, and African influences.
Common Themes:
- Connection to nature and the Amazon
- Family and community bonds
- Music, dance, and celebration
- Indigenous wisdom and traditions
- Colonial history and independence
- Environmental stewardship

Visual Elements:
- Amazon rainforest and biodiversity
- Andes mountains and highlands
- Historic cities and colonial architecture
- Vibrant festivals (Carnival)
- Indigenous textiles and crafts

Celebrate the rich cultural blend while honoring Indigenous traditions.`,

  oceania: `Setting: Oceania (Australia, Pacific Islands, New Zealand)
Cultural Context: Oceania includes ancient Indigenous cultures and Pacific Island traditions.
Common Themes:
- Connection to land and sea
- Dreamtime and oral traditions
- Navigation and exploration
- Island community life
- Conservation and sustainability
- Cultural preservation

Visual Elements:
- Unique wildlife: kangaroos, koalas, marine life
- Coral reefs and ocean landscapes
- Indigenous art: dot painting, tapa cloth
- Island scenery and beaches
- Traditional boats and navigation

Honor Aboriginal, Māori, and Pacific Islander cultures with authenticity.`,

  antarctica: `Setting: Antarctica
Cultural Context: Antarctica is a scientific frontier without permanent residents.
Common Themes:
- Scientific discovery and exploration
- Environmental protection
- International cooperation
- Extreme conditions and adaptation
- Climate research importance
- Wildlife survival

Visual Elements:
- Ice landscapes and glaciers
- Penguin colonies and seals
- Research stations
- Aurora australis
- Expedition ships and equipment

Focus on scientific exploration and environmental awareness.`,
}

export const REGION_CULTURAL_CONTEXTS: Partial<Record<GlobalRegion, string>> = {
  // Africa Regions
  west_africa: `West African Context: Rich in music, storytelling traditions, and complex kingdoms.
Key elements: Anansi tales, drumming, extended family compounds, markets, gold coast history.`,

  east_africa: `East African Context: Swahili coast culture, safari lands, and diverse ethnicities.
Key elements: Safari wildlife, Maasai traditions, Swahili language, Great Rift Valley.`,

  // Asia Regions
  east_asia: `East Asian Context: Confucian values, technological advancement, ancient philosophies.
Key elements: Calligraphy, tea ceremonies, respect for education, seasonal festivals.`,

  southeast_asia: `Southeast Asian Context: Tropical islands, Buddhist traditions, diverse kingdoms.
Key elements: Rice cultivation, temple architecture, water festivals, family businesses.`,

  south_asia: `South Asian Context: Ancient civilizations, diverse religions, vibrant festivals.
Key elements: Bollywood, cricket, monsoons, spice trade, textile traditions.`,

  // Other key regions...
  northern_europe: `Northern European Context: Viking heritage, winter traditions, social democracy.
Key elements: Northern lights, fjords, design traditions, outdoor culture.`,

  caribbean: `Caribbean Context: Island life, reggae, colonial history, cultural fusion.
Key elements: Beach culture, Carnival, oral traditions, maritime heritage.`,
}

// =====================================================
// CULTURAL STORY GENERATION HELPERS
// =====================================================

export interface CulturalStoryInput extends StoryGenerationInput {
  continent?: Continent
  region?: GlobalRegion
  countryCode?: string
  culturalElements?: string[]
  languagesIncluded?: string[]
}

export function generateCulturalStoryPrompt(input: CulturalStoryInput): string {
  const basePrompt = generateStoryPrompt(input)

  let culturalContext = ''

  // Add continent context
  if (input.continent) {
    culturalContext += `\n\n${CONTINENT_PROMPTS[input.continent]}`
  }

  // Add region context
  if (input.region && REGION_CULTURAL_CONTEXTS[input.region]) {
    culturalContext += `\n\n${REGION_CULTURAL_CONTEXTS[input.region]}`
  }

  // Add specific country context
  if (input.countryCode) {
    const country = FEATURED_COUNTRIES.find(c => c.code === input.countryCode)
    if (country) {
      culturalContext += `\n\nSPECIFIC COUNTRY: ${country.name} ${country.flag}
Languages: ${country.languages.join(', ')}
Cultural Themes: ${country.culturalThemes.join(', ')}
Traditional Stories to Reference: ${country.traditionalStories.join(', ')}`
    }
  }

  // Add specific cultural elements
  if (input.culturalElements && input.culturalElements.length > 0) {
    culturalContext += `\n\nINCLUDE THESE CULTURAL ELEMENTS:
${input.culturalElements.map(e => `- ${e}`).join('\n')}`
  }

  // Add language integration
  if (input.languagesIncluded && input.languagesIncluded.length > 0) {
    culturalContext += `\n\nLANGUAGE INTEGRATION:
Include authentic words or phrases from: ${input.languagesIncluded.join(', ')}
- Provide pronunciation guides in parentheses
- Include meaning/translation in context
- Use respectfully and accurately`
  }

  return basePrompt + culturalContext
}

// =====================================================
// AGE-APPROPRIATE CULTURAL DEPTH
// =====================================================

export function getCulturalDepthForAge(ageBand: AgeBand): string {
  const schoolLevel = getSchoolLevel(ageBand)

  switch (schoolLevel) {
    case 'early_childhood':
      return `CULTURAL DEPTH FOR YOUNG CHILDREN:
- Focus on universal experiences: family, friends, food, play
- Introduce simple cultural elements (greetings, foods, celebrations)
- Use concrete, visual cultural markers
- Keep explanations simple and joyful
- Avoid complex historical or political contexts`

    case 'elementary':
      return `CULTURAL DEPTH FOR ELEMENTARY:
- Introduce cultural practices and traditions
- Explain "why" behind customs in simple terms
- Compare and contrast with familiar experiences
- Include vocabulary words from other languages
- Begin exploring history at child-friendly level`

    case 'middle_school':
      return `CULTURAL DEPTH FOR MIDDLE SCHOOL:
- Explore cultural identity and heritage
- Address historical contexts appropriately
- Discuss cultural exchange and globalization
- Examine both challenges and celebrations
- Encourage critical thinking about stereotypes`

    case 'high_school':
      return `CULTURAL DEPTH FOR HIGH SCHOOL:
- Analyze cultural dynamics and power structures
- Explore post-colonial perspectives
- Discuss cultural preservation and change
- Examine global interconnections
- Encourage nuanced understanding of cultural complexity`

    default:
      return ''
  }
}

// =====================================================
// EXTENDED EMOTIONAL FOCUS FOR OLDER STUDENTS
// =====================================================

export const EXTENDED_EMOTIONAL_PROMPTS: Record<string, string> = {
  // Original emotions (all ages)
  ...EMOTIONAL_FOCUS_PROMPTS,

  // Middle school additions
  self_discovery: `Guide characters through authentic self-discovery journeys.
Explore identity questions appropriate for adolescents without premature adult themes.`,

  peer_pressure: `Address peer pressure dynamics realistically. Show characters
making difficult choices and finding their own voice while valuing friendships.`,

  academic_stress: `Acknowledge academic pressures while modeling healthy coping.
Characters balance achievement with well-being and learn from setbacks.`,

  social_dynamics: `Navigate complex social hierarchies with authenticity.
Show characters building genuine connections beyond surface-level popularity.`,

  // High school additions
  ethical_reasoning: `Present genuine ethical dilemmas without easy answers.
Characters grapple with competing values and develop moral reasoning.`,

  social_responsibility: `Explore themes of civic engagement and community impact.
Characters discover their ability to create positive change.`,

  future_planning: `Address uncertainty about the future with hope and agency.
Characters explore possibilities while managing anxiety about decisions.`,

  global_awareness: `Develop understanding of global interconnectedness.
Characters see their place in the wider world and their potential impact.`,

  independence: `Navigate the transition toward adult independence.
Characters take on new responsibilities while maintaining important connections.`,

  cultural_identity: `Explore heritage, belonging, and cultural navigation.
Characters integrate multiple aspects of their cultural background.`,
}

// =====================================================
// ILLUSTRATION STYLE EXTENSIONS
// =====================================================

export const EXTENDED_ILLUSTRATION_STYLES: Record<string, string> = {
  ...ILLUSTRATION_STYLE_PROMPTS,

  // New styles for older readers
  manga_anime: `Style: Manga/anime-influenced illustration.
Characteristics: Expressive eyes, dynamic poses, action lines,
panel-style compositions. Appeal to middle school and high school readers.
Modern, energetic, character-focused.`,

  graphic_novel: `Style: Graphic novel illustration.
Characteristics: Bold lines, dramatic compositions, cinematic framing,
sequential art influence. Sophisticated visual storytelling for older readers.
Can handle complex themes with nuance.`,

  realistic: `Style: Realistic illustration approach.
Characteristics: Anatomically accurate, detailed environments,
photo-realistic elements. Appropriate for historical fiction,
biography, and serious themes. Professional quality.`,

  digital_art: `Style: Contemporary digital art.
Characteristics: Polished digital finish, vibrant colors,
modern aesthetic, social media influenced. Appeals to teens,
current and relatable visual language.`,

  cultural_traditional: `Style: Traditional cultural art influences.
Characteristics: Incorporate authentic artistic traditions
from the story's cultural context. Research and honor
traditional patterns, colors, and compositions.`,
}

// =====================================================
// HELPER: GET PROMPTS FOR AGE BAND
// =====================================================

export function getCompletePromptsForAgeBand(ageBand: AgeBand): {
  systemPrompt: string
  safetyGuardrail: string
  sightWords: string[]
  appropriateCategories: StoryCategory[]
} {
  const config = AGE_BANDS[ageBand]

  // Determine appropriate categories based on school level
  const elementaryCategories: StoryCategory[] = [
    'bedtime', 'seasonal', 'cultural', 'curriculum', 'emotional_social',
    'school', 'family', 'adventure', 'world_cultures', 'geography_adventures',
    'mythology_folklore', 'environmental', 'stem_stories',
  ]

  const middleSchoolCategories: StoryCategory[] = [
    ...elementaryCategories, 'historical_fiction', 'global_citizenship',
    'biography', 'coming_of_age',
  ]

  const highSchoolCategories: StoryCategory[] = [
    ...middleSchoolCategories, 'social_issues',
  ]

  let appropriateCategories: StoryCategory[]
  switch (config.schoolLevel) {
    case 'early_childhood':
    case 'elementary':
      appropriateCategories = elementaryCategories
      break
    case 'middle_school':
      appropriateCategories = middleSchoolCategories
      break
    case 'high_school':
      appropriateCategories = highSchoolCategories
      break
    default:
      appropriateCategories = elementaryCategories
  }

  return {
    systemPrompt: AGE_BAND_SYSTEM_PROMPTS[ageBand],
    safetyGuardrail: CONTENT_SAFETY_GUARDRAIL,
    sightWords: SIGHT_WORDS_BY_LEVEL[ageBand],
    appropriateCategories,
  }
}

// =====================================================
// ADDITIONAL HELPER FUNCTIONS FOR STORY GENERATION
// =====================================================

/**
 * Get the system prompt for a specific age band
 */
export function getSystemPromptForAge(ageBand: AgeBand): string {
  return AGE_BAND_SYSTEM_PROMPTS[ageBand]
}

/**
 * Get category-specific system prompt additions
 */
export function getCategorySystemPrompt(category: StoryCategory): string {
  const categoryThemes = CATEGORY_THEMES[category]
  if (!categoryThemes) {
    return ''
  }

  const categoryDescriptions: Record<StoryCategory, string> = {
    bedtime: 'Create a calming, soothing story perfect for bedtime. Use gentle imagery, soft tones, and a peaceful resolution.',
    seasonal: 'Focus on the current season or upcoming holiday. Include sensory details about weather, activities, and traditions.',
    cultural: 'Celebrate cultural diversity with authentic representation. Include cultural elements respectfully and accurately.',
    curriculum: 'Align with educational standards. Include learning objectives while maintaining engagement.',
    emotional_social: 'Focus on emotional intelligence and social skills. Model healthy emotional expression and social interactions.',
    school: 'Center the story around school experiences. Include relatable classroom, playground, or school event scenarios.',
    family: 'Celebrate family bonds and diverse family structures. Focus on love, support, and family traditions.',
    adventure: 'Create an exciting journey with challenges to overcome. Focus on bravery, problem-solving, and discovery.',
    world_cultures: 'Explore different cultures around the world. Include authentic cultural elements, traditions, and perspectives.',
    geography_adventures: 'Take readers on a geographic journey. Include accurate geographic details and fun facts.',
    historical_fiction: 'Bring history to life through storytelling. Balance historical accuracy with engaging narrative.',
    mythology_folklore: 'Draw from traditional stories and mythology. Adapt tales appropriately for the target age.',
    global_citizenship: 'Explore themes of global responsibility and interconnectedness. Encourage empathy for global issues.',
    environmental: 'Focus on environmental themes and nature appreciation. Encourage environmental stewardship.',
    stem_stories: 'Integrate science, technology, engineering, or math concepts. Make STEM accessible and exciting.',
    biography: 'Tell inspiring stories of real people. Focus on character traits and achievements appropriate for the age.',
    coming_of_age: 'Explore themes of growth, identity, and transition. Handle sensitive topics age-appropriately.',
    social_issues: 'Address social issues thoughtfully. Provide age-appropriate context and encourage critical thinking.',
  }

  const description = categoryDescriptions[category] || ''
  const themes = categoryThemes.join(', ')

  return `
CATEGORY: ${category.replace(/_/g, ' ').toUpperCase()}
${description}

Relevant themes to consider: ${themes}
`
}
