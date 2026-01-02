/**
 * StorySprout AI Story Generation Prompts
 *
 * These prompts are designed for Claude/GPT to generate age-appropriate,
 * curriculum-aligned children's stories with sight word integration.
 */

import { AgeBand, StoryCategory } from './types'

// =====================================================
// CHILD LIFE & CONTENT NEUTRALITY GUARDRAIL
// =====================================================

/**
 * MANDATORY CONTENT SAFETY POLICY
 *
 * All child-focused content must remain strictly age-appropriate,
 * non-romantic, and non-sexualized in nature.
 */
export const CONTENT_SAFETY_GUARDRAIL = `
═══════════════════════════════════════════════════════════════════════════════
MANDATORY CHILD CONTENT SAFETY GUARDRAIL - STRICTLY ENFORCED
═══════════════════════════════════════════════════════════════════════════════

All content MUST comply with the following non-negotiable safety requirements:

ABSOLUTELY PROHIBITED CONTENT:
1. Romantic relationships of ANY kind between ANY characters
2. Dating, crushes, attraction, or romantic interest themes
3. Marriage or wedding themes except parent/guardian references
4. Kissing, hand-holding, or physical affection beyond family/friendship norms
5. "Boyfriend," "girlfriend," or relationship-coded language
6. Heart symbols or imagery suggesting romantic love
7. Identity exploration related to relationships or attraction
8. Coded references, symbolic messaging, or subtext about relationships
9. Any content that could normalize adult relationship concepts for children

PERMITTED RELATIONSHIP CONTEXTS ONLY:
✓ Family bonds: parents, guardians, siblings, grandparents, extended family
✓ Friendship: making friends, being a good friend, teamwork, cooperation
✓ Community: neighbors, teachers, coaches, librarians, community helpers
✓ Peer relationships: classmates, playmates, teammates (non-romantic only)
✓ Mentorship: learning from adults in appropriate roles
✓ Animal companions: pets, animal friends in stories

EMOTIONAL THEMES MUST BE LIMITED TO:
✓ Self-confidence and self-worth
✓ Kindness, empathy, and compassion
✓ Courage and facing fears
✓ Resilience and growth mindset
✓ Gratitude and appreciation
✓ Curiosity and wonder
✓ Responsibility and helping others
✓ Managing emotions (anger, sadness, worry, joy)
✓ Belonging to family, school, and community
✓ Friendship and cooperation

CHARACTER DESIGN REQUIREMENTS:
- No suggestive clothing or appearance
- Age-appropriate attire for activities depicted
- No emphasis on physical attractiveness between characters
- Diverse, inclusive representation without relationship undertones

ILLUSTRATION REQUIREMENTS:
- No romantic poses, gazes, or compositions
- No heart imagery suggesting romantic love (family love hearts acceptable)
- No couple-coded visual arrangements
- Characters interact as friends, family, or community members only

PURPOSE OF THIS GUARDRAIL:
• Preserve developmentally appropriate content for ages 2-10
• Respect diverse family values and cultural expectations
• Keep focus on learning, imagination, safety, and emotional well-being
• Avoid premature exposure to adult social or relational constructs

If ANY content request conflicts with these guardrails, you MUST:
1. Refuse to generate the prohibited content
2. Suggest an appropriate alternative that maintains the story's purpose
3. Ensure all output strictly adheres to permitted themes

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

  grade_4: `You are a children's story writer specializing in books for Grade 4 children (ages 8-10).

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
- Characters show subtle emotions`
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
  bedtime: [
    'Saying goodnight to the day',
    'Cozy bedtime routines',
    'Dream adventures',
    'Nighttime sounds and peace',
    'The moon and stars watching over',
    'Sleepy animal friends'
  ],
  adventure: [
    'Exploring a new place',
    'Finding hidden treasures',
    'Making unexpected discoveries',
    'Overcoming a small challenge',
    'Journey with a friend',
    'Nature exploration'
  ],
  emotional_social: [
    'Making a new friend',
    'Handling big feelings',
    'Being kind to others',
    'Sharing and taking turns',
    'Feeling left out and belonging',
    'Understanding different perspectives'
  ],
  educational: [
    'Counting adventures',
    'Color discoveries',
    'Shape hunts',
    'Letter sounds in action',
    'Science exploration',
    'Learning about the world'
  ],
  family: [
    'Special time with family',
    'New siblings',
    'Visiting grandparents',
    'Family traditions',
    'Helping at home',
    'Multi-generational stories'
  ],
  nature: [
    'Seasons changing',
    'Garden growing',
    'Animal homes',
    'Weather wonders',
    'Ocean exploration',
    'Forest friends'
  ],
  school: [
    'First day feelings',
    'Making classroom friends',
    'Learning something new',
    'Show and tell',
    'Playground adventures',
    'Teacher appreciation'
  ],
  holiday: [
    'Celebrating together',
    'Holiday traditions',
    'Giving and gratitude',
    'Seasonal celebrations',
    'Cultural holidays',
    'Making memories'
  ]
}

// =====================================================
// SIGHT WORD LISTS BY GRADE LEVEL
// =====================================================

export const SIGHT_WORDS_BY_LEVEL: Record<AgeBand, string[]> = {
  pre_k: [
    'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
    'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little',
    'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
    'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you'
  ],
  k_prep: [
    'all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came',
    'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
    'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran',
    'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
    'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will',
    'with', 'yes'
  ],
  grade_1: [
    'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly',
    'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just',
    'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put',
    'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were',
    'when'
  ],
  grade_2: [
    'always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call', 'cold',
    'does', "don't", 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green', 'its',
    'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing', 'sit', 'sleep',
    'tell', 'their', 'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which',
    'why', 'wish', 'work', 'would', 'write', 'your'
  ],
  grade_3: [
    'about', 'better', 'bring', 'carry', 'clean', 'cut', 'done', 'draw', 'drink', 'eight',
    'fall', 'far', 'full', 'got', 'grow', 'hold', 'hot', 'hurt', 'if', 'keep',
    'kind', 'laugh', 'light', 'long', 'much', 'myself', 'never', 'only', 'own', 'pick',
    'seven', 'shall', 'show', 'six', 'small', 'start', 'ten', 'today', 'together', 'try',
    'warm'
  ],
  grade_4: [
    'above', 'across', 'against', 'along', 'already', 'although', 'among', 'answer', 'behind', 'believe',
    'below', 'between', 'beyond', 'built', 'caught', 'certain', 'change', 'children', 'country', 'course',
    'different', 'during', 'early', 'earth', 'enough', 'example', 'family', 'finally', 'follow', 'great',
    'group', 'heard', 'however', 'important', 'interest', 'known', 'learn', 'leave', 'might', 'number',
    'often', 'order', 'perhaps', 'place', 'point', 'problem', 'question', 'ready', 'really', 'remember',
    'school', 'second', 'sentence', 'should', 'since', 'something', 'sometimes', 'sound', 'special', 'still',
    'story', 'study', 'such', 'sure', 'though', 'thought', 'through', 'understand', 'until', 'usually',
    'whole', 'without', 'world', 'young'
  ]
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
    illustrationStyle: ILLUSTRATION_STYLE_PROMPTS.soft_flat
  }
}
