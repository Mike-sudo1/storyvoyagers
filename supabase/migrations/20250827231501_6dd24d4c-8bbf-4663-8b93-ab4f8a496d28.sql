-- Clear existing stories
DELETE FROM public.stories;

-- Insert a real story for testing
INSERT INTO public.stories (
  title,
  description,
  subject,
  age_min,
  age_max,
  content,
  reading_time,
  difficulty,
  genre,
  is_premium,
  language
) VALUES (
  'The Three Little Pigs',
  'Join the three little pigs as they learn about construction, materials, and problem-solving while building their homes. A classic tale with educational twists about engineering and perseverance.',
  'Science',
  4,
  8,
  'Once upon a time, there were three little pigs who decided to leave their mother''s house and build homes of their own.

The first little pig was in a hurry. He found some straw and quickly built a house. "This straw is light and easy to work with," he said. But straw, while quick to use, is not very strong.

The second little pig wanted something a bit stronger. He gathered sticks and wood branches. "Wood is stronger than straw," he thought as he built his house. His house took longer to build but was sturdier than his brother''s.

The third little pig knew that building a good house takes time and the right materials. He decided to use bricks. "Bricks are heavy and hard to work with, but they make the strongest houses," he said. It took him much longer to build, but his house was very strong.

Soon, a big bad wolf came by. He went to the first pig''s house and huffed and puffed and blew the straw house down! The first pig ran to his brother''s stick house.

The wolf followed and huffed and puffed and blew the stick house down too! Both pigs ran to their brother''s brick house.

When the wolf tried to blow down the brick house, he huffed and puffed until he was tired, but the house stood strong. The wolf couldn''t get in!

The three pigs learned that choosing the right materials and taking time to build properly keeps you safe and secure.',
  12,
  'easy',
  'Classic Tale',
  false,
  'en'
);