-- StorySprout Sample Stories Seed Data
-- These are the sample stories from the PRD with full curriculum alignment

-- =====================================================
-- STORY PATHS
-- =====================================================

INSERT INTO story_paths (id, name, description, age_band, path_type, color_theme, display_order, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Learning to Read', 'Start your reading journey with simple, engaging stories', 'pre_k', 'learning_to_read', '#FF6B9D', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'First School Stories', 'Stories about school life and making friends', 'k_prep', 'school_stories', '#4ECDC4', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'Big Feelings', 'Understanding and managing emotions through stories', 'grade_1', 'big_feelings', '#45B7D1', 3, true),
  ('44444444-4444-4444-4444-444444444444', 'Seasonal Adventures', 'Celebrate seasons and holidays with fun stories', 'k_prep', 'seasonal_adventures', '#96CEB4', 4, true),
  ('55555555-5555-5555-5555-555555555555', 'Bedtime Collection', 'Calm, soothing stories for peaceful sleep', 'pre_k', 'bedtime_collection', '#6B5B95', 5, true),
  ('66666666-6666-6666-6666-666666666666', 'Reading with Confidence', 'Build fluency with engaging chapter stories', 'grade_2', 'reading_with_confidence', '#FFEAA7', 6, true);

-- =====================================================
-- SAMPLE STORIES
-- =====================================================

-- Story 1: Milo Finds His Shoes (Pre-K, Ages 2-3)
INSERT INTO stories (
  id, story_code, title, subtitle, author,
  age_band, min_age, max_age, reading_level_system, reading_level,
  category, themes, emotional_focus,
  sight_words, vocabulary_tier,
  estimated_read_time_minutes, page_count, modes_supported,
  illustration_style, is_featured,
  curriculum_alignment, learning_objectives,
  story_path_id, sequence_in_path
) VALUES (
  'aaaa1111-1111-1111-1111-111111111111',
  'SS-PK-001',
  'Milo Finds His Shoes',
  'A calming story about looking and finding',
  'StorySprout Authors',
  'pre_k', 2, 3, 'guided', 'A',
  'bedtime',
  ARRAY['daily_routine', 'problem_solving'],
  ARRAY['calm', 'patience', 'joy'],
  ARRAY['his', 'the', 'is', 'no', 'are'],
  1,
  3, 8, ARRAY['read_to_me', 'read_with_me', 'read_alone']::reading_mode[],
  'soft_flat', true,
  ARRAY['Print Awareness', 'Object Permanence'],
  ARRAY['Listening comprehension', 'Object recognition', 'Emotional reassurance'],
  '55555555-5555-5555-5555-555555555555', 1
);

-- Story 1 Pages
INSERT INTO story_pages (story_id, page_number, text_content, illustration_alt_text, sight_word_positions) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 1, 'Milo looks down. His shoes are not there.', 'Milo, a small bunny, looking at his bare feet with a puzzled expression', '[{"word": "his", "index": 3}]'::jsonb),
  ('aaaa1111-1111-1111-1111-111111111111', 2, 'Milo looks by the bed. No shoes.', 'Milo peeking under a cozy bed with soft blankets', '[{"word": "the", "index": 4}, {"word": "no", "index": 6}]'::jsonb),
  ('aaaa1111-1111-1111-1111-111111111111', 3, 'Milo looks by the door. No shoes.', 'Milo looking behind a colorful door', '[{"word": "the", "index": 4}, {"word": "no", "index": 6}]'::jsonb),
  ('aaaa1111-1111-1111-1111-111111111111', 4, 'Milo feels worried.', 'Milo with a slightly worried expression, ears drooping', null),
  ('aaaa1111-1111-1111-1111-111111111111', 5, 'Milo looks under the chair.', 'Milo bending down to look under a comfy chair', '[{"word": "the", "index": 4}]'::jsonb),
  ('aaaa1111-1111-1111-1111-111111111111', 6, 'There are his shoes!', 'Two small shoes visible under the chair', '[{"word": "are", "index": 2}, {"word": "his", "index": 3}]'::jsonb),
  ('aaaa1111-1111-1111-1111-111111111111', 7, 'Milo smiles. His shoes are right there.', 'Milo happily putting on his shoes with a big smile', '[{"word": "his", "index": 2}, {"word": "are", "index": 4}]'::jsonb),
  ('aaaa1111-1111-1111-1111-111111111111', 8, 'Now Milo is ready.', 'Milo standing proudly with shoes on, ready for the day', '[{"word": "is", "index": 3}]'::jsonb);

-- Story 2: The Red Ball at School (Kindergarten, Ages 4-5)
INSERT INTO stories (
  id, story_code, title, subtitle, author,
  age_band, min_age, max_age, reading_level_system, reading_level,
  category, themes, emotional_focus,
  sight_words, vocabulary_tier,
  estimated_read_time_minutes, page_count, modes_supported,
  illustration_style, is_featured,
  curriculum_alignment, learning_objectives,
  story_path_id, sequence_in_path
) VALUES (
  'bbbb2222-2222-2222-2222-222222222222',
  'SS-K-001',
  'The Red Ball at School',
  'A simple story about play and sharing',
  'StorySprout Authors',
  'k_prep', 4, 5, 'guided', 'A',
  'school',
  ARRAY['school', 'sharing', 'play'],
  ARRAY['joy', 'belonging'],
  ARRAY['the', 'is', 'at', 'to', 'see', 'I', 'we'],
  1,
  4, 8, ARRAY['read_to_me', 'read_with_me', 'read_alone']::reading_mode[],
  'soft_flat', true,
  ARRAY['Foundational Literacy', 'Sight Word Acquisition'],
  ARRAY['Sight word recognition', 'Simple sentence structure', 'School routine familiarity'],
  '22222222-2222-2222-2222-222222222222', 1
);

-- Story 2 Pages
INSERT INTO story_pages (story_id, page_number, text_content, illustration_alt_text, sight_word_positions) VALUES
  ('bbbb2222-2222-2222-2222-222222222222', 1, 'The red ball is at school.', 'A bright red ball sitting on a playground', '[{"word": "the", "index": 0}, {"word": "is", "index": 3}, {"word": "at", "index": 4}]'::jsonb),
  ('bbbb2222-2222-2222-2222-222222222222', 2, 'I see the red ball.', 'A child pointing excitedly at the red ball', '[{"word": "I", "index": 0}, {"word": "see", "index": 1}, {"word": "the", "index": 2}]'::jsonb),
  ('bbbb2222-2222-2222-2222-222222222222', 3, 'The ball is big.', 'Close-up of the large, shiny red ball', '[{"word": "the", "index": 0}, {"word": "is", "index": 2}]'::jsonb),
  ('bbbb2222-2222-2222-2222-222222222222', 4, 'The ball is fun.', 'Child bouncing the ball with a happy face', '[{"word": "the", "index": 0}, {"word": "is", "index": 2}]'::jsonb),
  ('bbbb2222-2222-2222-2222-222222222222', 5, 'I play with the ball.', 'Child playing with the ball on the playground', '[{"word": "I", "index": 0}, {"word": "the", "index": 3}]'::jsonb),
  ('bbbb2222-2222-2222-2222-222222222222', 6, 'We play at school.', 'Two children playing together with the ball', '[{"word": "we", "index": 0}, {"word": "at", "index": 2}]'::jsonb),
  ('bbbb2222-2222-2222-2222-222222222222', 7, 'The red ball is still at school.', 'The ball resting on a shelf in the classroom', '[{"word": "the", "index": 0}, {"word": "is", "index": 3}, {"word": "at", "index": 5}]'::jsonb),
  ('bbbb2222-2222-2222-2222-222222222222', 8, 'I will see it again.', 'Child waving goodbye to the ball with a smile', '[{"word": "I", "index": 0}, {"word": "see", "index": 2}]'::jsonb);

-- Story 3: Lina and the Quiet Corner (Grade 1, Ages 6-7)
INSERT INTO stories (
  id, story_code, title, subtitle, author,
  age_band, min_age, max_age, reading_level_system, reading_level,
  category, themes, emotional_focus,
  sight_words, vocabulary_tier,
  estimated_read_time_minutes, page_count, modes_supported,
  illustration_style, is_featured,
  curriculum_alignment, learning_objectives,
  story_path_id, sequence_in_path
) VALUES (
  'cccc3333-3333-3333-3333-333333333333',
  'SS-G1-001',
  'Lina and the Quiet Corner',
  'Finding calm when feelings get big',
  'StorySprout Authors',
  'grade_1', 6, 7, 'guided', 'C',
  'emotional_social',
  ARRAY['school', 'feelings', 'self_care'],
  ARRAY['self_regulation', 'calm', 'confidence'],
  ARRAY['the', 'she', 'her', 'was', 'when', 'could', 'there'],
  1,
  5, 10, ARRAY['read_to_me', 'read_with_me', 'read_alone']::reading_mode[],
  'soft_flat', true,
  ARRAY['Social Emotional Learning', 'Reading Comprehension'],
  ARRAY['Independent reading', 'Emotional self-regulation', 'Inference skills'],
  '33333333-3333-3333-3333-333333333333', 1
);

-- Story 3 Pages
INSERT INTO story_pages (story_id, page_number, text_content, illustration_alt_text, sight_word_positions) VALUES
  ('cccc3333-3333-3333-3333-333333333333', 1, 'Lina was at school. She liked her class.', 'A classroom with colorful decorations and children at desks', '[{"word": "was", "index": 2}, {"word": "she", "index": 5}, {"word": "her", "index": 7}]'::jsonb),
  ('cccc3333-3333-3333-3333-333333333333', 2, 'But today, Lina felt different. The sounds were too loud.', 'Lina covering her ears slightly, looking overwhelmed', '[{"word": "the", "index": 6}]'::jsonb),
  ('cccc3333-3333-3333-3333-333333333333', 3, 'Her chest felt tight. She wanted to cry.', 'Lina with a worried expression, hand on her chest', '[{"word": "her", "index": 0}, {"word": "she", "index": 4}]'::jsonb),
  ('cccc3333-3333-3333-3333-333333333333', 4, 'Lina remembered the quiet corner. It was in the back of the room.', 'A cozy corner with cushions and soft lighting', '[{"word": "the", "index": 3}, {"word": "was", "index": 7}, {"word": "the", "index": 10}]'::jsonb),
  ('cccc3333-3333-3333-3333-333333333333', 5, 'She walked there slowly. She sat on a soft cushion.', 'Lina walking quietly toward the corner', '[{"word": "she", "index": 0}, {"word": "there", "index": 2}, {"word": "she", "index": 4}]'::jsonb),
  ('cccc3333-3333-3333-3333-333333333333', 6, 'Lina took a deep breath. In and out. In and out.', 'Lina sitting peacefully, eyes closed, breathing deeply', null),
  ('cccc3333-3333-3333-3333-333333333333', 7, 'The sounds seemed quieter now. Her chest felt lighter.', 'The classroom looking calmer from Lina perspective', '[{"word": "the", "index": 0}, {"word": "her", "index": 5}]'::jsonb),
  ('cccc3333-3333-3333-3333-333333333333', 8, 'When she was ready, Lina went back to her desk.', 'Lina walking back to her desk with a small smile', '[{"word": "when", "index": 0}, {"word": "she", "index": 1}, {"word": "was", "index": 2}, {"word": "her", "index": 9}]'::jsonb),
  ('cccc3333-3333-3333-3333-333333333333', 9, 'She could do this. She felt calmer now.', 'Lina sitting at her desk, looking peaceful', '[{"word": "she", "index": 0}, {"word": "could", "index": 1}, {"word": "she", "index": 4}]'::jsonb),
  ('cccc3333-3333-3333-3333-333333333333', 10, 'Lina smiled. She knew where to go when feelings got big.', 'Lina smiling confidently, the quiet corner visible in the background', '[{"word": "she", "index": 2}, {"word": "when", "index": 7}]'::jsonb);

-- Story 4: The Day the Wind Changed (Grade 2, Ages 7-8)
INSERT INTO stories (
  id, story_code, title, subtitle, author,
  age_band, min_age, max_age, reading_level_system, reading_level,
  category, themes, emotional_focus,
  sight_words, vocabulary_tier,
  estimated_read_time_minutes, page_count, modes_supported,
  illustration_style, is_featured,
  curriculum_alignment, learning_objectives,
  story_path_id, sequence_in_path
) VALUES (
  'dddd4444-4444-4444-4444-444444444444',
  'SS-G2-001',
  'The Day the Wind Changed',
  'Learning about cause and effect',
  'StorySprout Authors',
  'grade_2', 7, 8, 'guided', 'E',
  'adventure',
  ARRAY['nature', 'learning', 'observation'],
  ARRAY['curiosity', 'resilience'],
  ARRAY['the', 'was', 'by', 'something', 'even', 'small', 'can'],
  2,
  5, 8, ARRAY['read_to_me', 'read_with_me', 'read_alone']::reading_mode[],
  'watercolor', true,
  ARRAY['Reading Comprehension', 'Vocabulary Development'],
  ARRAY['Cause and effect', 'Vocabulary in context', 'Prediction'],
  '66666666-6666-6666-6666-666666666666', 1
);

-- Story 4 Pages
INSERT INTO story_pages (story_id, page_number, text_content, illustration_alt_text, sight_word_positions) VALUES
  ('dddd4444-4444-4444-4444-444444444444', 1, 'In the morning, the wind was quiet. The leaves barely moved.', 'A calm morning scene with still trees and gentle sunlight', '[{"word": "the", "index": 1}, {"word": "the", "index": 4}, {"word": "was", "index": 5}, {"word": "the", "index": 8}]'::jsonb),
  ('dddd4444-4444-4444-4444-444444444444', 2, 'Lena walked to school. She noticed how still everything was.', 'Lena walking on a peaceful path, trees standing still', '[{"word": "was", "index": 9}]'::jsonb),
  ('dddd4444-4444-4444-4444-444444444444', 3, 'By noon, the wind grew stronger. Paper flew across the playground.', 'Papers and leaves swirling in the wind on a playground', '[{"word": "by", "index": 0}, {"word": "the", "index": 2}]'::jsonb),
  ('dddd4444-4444-4444-4444-444444444444', 4, 'Lena held her hat. The wind tugged at her jacket.', 'Lena holding onto her hat, jacket blowing in the wind', '[{"word": "the", "index": 5}]'::jsonb),
  ('dddd4444-4444-4444-4444-444444444444', 5, '"Something changed," she said. "The morning was so calm."', 'Lena looking up at the sky with a thoughtful expression', '[{"word": "something", "index": 0}, {"word": "the", "index": 5}, {"word": "was", "index": 7}]'::jsonb),
  ('dddd4444-4444-4444-4444-444444444444', 6, 'The wind taught Lena something new.', 'Lena watching leaves dance in the wind', '[{"word": "the", "index": 0}, {"word": "something", "index": 4}]'::jsonb),
  ('dddd4444-4444-4444-4444-444444444444', 7, 'Even small changes can become big ones.', 'A visual showing small ripples becoming larger waves', '[{"word": "even", "index": 0}, {"word": "small", "index": 1}, {"word": "can", "index": 3}]'::jsonb),
  ('dddd4444-4444-4444-4444-444444444444', 8, 'She smiled and walked home carefully.', 'Lena walking home with a knowing smile, wind in her hair', null);

-- Story 5: Goodnight, Little Star (Pre-K Bedtime)
INSERT INTO stories (
  id, story_code, title, subtitle, author,
  age_band, min_age, max_age, reading_level_system, reading_level,
  category, themes, emotional_focus,
  sight_words, vocabulary_tier,
  estimated_read_time_minutes, page_count, modes_supported,
  illustration_style, is_featured,
  curriculum_alignment, learning_objectives,
  story_path_id, sequence_in_path
) VALUES (
  'eeee5555-5555-5555-5555-555555555555',
  'SS-PK-002',
  'Goodnight, Little Star',
  'A gentle bedtime story',
  'StorySprout Authors',
  'pre_k', 2, 3, 'guided', 'A',
  'bedtime',
  ARRAY['bedtime', 'nature', 'sleep'],
  ARRAY['calm', 'love'],
  ARRAY['the', 'is', 'a', 'you', 'and'],
  1,
  3, 6, ARRAY['read_to_me', 'read_with_me', 'read_alone']::reading_mode[],
  'soft_flat', true,
  ARRAY['Print Awareness', 'Listening Comprehension'],
  ARRAY['Calm down routine', 'Sleep association', 'Simple vocabulary'],
  '55555555-5555-5555-5555-555555555555', 2
);

-- Story 5 Pages
INSERT INTO story_pages (story_id, page_number, text_content, illustration_alt_text, sight_word_positions) VALUES
  ('eeee5555-5555-5555-5555-555555555555', 1, 'The sun is going down. The sky is soft and pink.', 'A beautiful sunset with soft pink and orange colors', '[{"word": "the", "index": 0}, {"word": "is", "index": 2}, {"word": "the", "index": 5}, {"word": "is", "index": 7}, {"word": "and", "index": 9}]'::jsonb),
  ('eeee5555-5555-5555-5555-555555555555', 2, 'A little star appears. It twinkles just for you.', 'A single star appearing in the twilight sky', '[{"word": "a", "index": 0}, {"word": "you", "index": 8}]'::jsonb),
  ('eeee5555-5555-5555-5555-555555555555', 3, 'The moon is rising. It is round and bright.', 'A friendly-looking moon rising over hills', '[{"word": "the", "index": 0}, {"word": "is", "index": 2}, {"word": "is", "index": 5}, {"word": "and", "index": 7}]'::jsonb),
  ('eeee5555-5555-5555-5555-555555555555', 4, 'The world is getting sleepy. And so are you.', 'A cozy landscape with houses with warm lights', '[{"word": "the", "index": 0}, {"word": "is", "index": 2}, {"word": "and", "index": 5}, {"word": "you", "index": 8}]'::jsonb),
  ('eeee5555-5555-5555-5555-555555555555', 5, 'Close your eyes. Dream happy dreams.', 'A child in bed, eyes closing peacefully', '[{"word": "your", "index": 1}]'::jsonb),
  ('eeee5555-5555-5555-5555-555555555555', 6, 'Goodnight, little star. Goodnight, little you.', 'Stars and moon watching over a sleeping child', '[{"word": "you", "index": 5}]'::jsonb);

-- Story 6: My First Day (K-Prep)
INSERT INTO stories (
  id, story_code, title, subtitle, author,
  age_band, min_age, max_age, reading_level_system, reading_level,
  category, themes, emotional_focus,
  sight_words, vocabulary_tier,
  estimated_read_time_minutes, page_count, modes_supported,
  illustration_style, is_featured, seasonal_tag,
  curriculum_alignment, learning_objectives,
  story_path_id, sequence_in_path
) VALUES (
  'ffff6666-6666-6666-6666-666666666666',
  'SS-K-002',
  'My First Day',
  'Starting school with courage',
  'StorySprout Authors',
  'k_prep', 4, 5, 'guided', 'B',
  'school',
  ARRAY['school', 'courage', 'friendship'],
  ARRAY['courage', 'belonging', 'joy'],
  ARRAY['I', 'am', 'my', 'can', 'and', 'we', 'see'],
  1,
  4, 8, ARRAY['read_to_me', 'read_with_me', 'read_alone']::reading_mode[],
  'soft_flat', true, 'back_to_school',
  ARRAY['Foundational Literacy', 'Social Emotional Learning'],
  ARRAY['Sight word recognition', 'School vocabulary', 'Managing new situations'],
  '22222222-2222-2222-2222-222222222222', 2
);

-- Story 6 Pages
INSERT INTO story_pages (story_id, page_number, text_content, illustration_alt_text, sight_word_positions) VALUES
  ('ffff6666-6666-6666-6666-666666666666', 1, 'Today is my first day of school. I am a little nervous.', 'A child getting ready for school, looking slightly nervous', '[{"word": "is", "index": 1}, {"word": "my", "index": 2}, {"word": "I", "index": 8}, {"word": "am", "index": 9}]'::jsonb),
  ('ffff6666-6666-6666-6666-666666666666', 2, 'I walk into my classroom. I see so many new faces.', 'A bright classroom with children at tables', '[{"word": "I", "index": 0}, {"word": "my", "index": 3}, {"word": "I", "index": 5}, {"word": "see", "index": 6}]'::jsonb),
  ('ffff6666-6666-6666-6666-666666666666', 3, 'My teacher smiles. "Welcome! I am glad you are here."', 'A friendly teacher welcoming the child', '[{"word": "my", "index": 0}, {"word": "I", "index": 4}, {"word": "am", "index": 5}]'::jsonb),
  ('ffff6666-6666-6666-6666-666666666666', 4, 'I find my seat. I can do this.', 'Child finding a desk with their name on it', '[{"word": "I", "index": 0}, {"word": "my", "index": 2}, {"word": "I", "index": 4}, {"word": "can", "index": 5}]'::jsonb),
  ('ffff6666-6666-6666-6666-666666666666', 5, 'A girl sits next to me. "Hi! I am Mia."', 'Two children smiling at each other at their desks', '[{"word": "I", "index": 7}, {"word": "am", "index": 8}]'::jsonb),
  ('ffff6666-6666-6666-6666-666666666666', 6, '"Hi! I am Ben." We smile at each other.', 'The two children becoming friends', '[{"word": "I", "index": 1}, {"word": "am", "index": 2}, {"word": "we", "index": 4}]'::jsonb),
  ('ffff6666-6666-6666-6666-666666666666', 7, 'We play and learn together. School is fun!', 'Children playing and learning together happily', '[{"word": "we", "index": 0}, {"word": "and", "index": 2}]'::jsonb),
  ('ffff6666-6666-6666-6666-666666666666', 8, 'I can not wait for tomorrow. I love my school.', 'Child waving goodbye with a big smile', '[{"word": "I", "index": 0}, {"word": "can", "index": 1}, {"word": "I", "index": 6}, {"word": "my", "index": 8}]'::jsonb);

-- Update story path counts
UPDATE story_paths SET total_stories = (
  SELECT COUNT(*) FROM stories WHERE story_path_id = story_paths.id
);
