-- Add template support to stories table
ALTER TABLE public.stories 
ADD COLUMN is_template boolean DEFAULT false,
ADD COLUMN template_content jsonb,
ADD COLUMN original_content text;

-- Update the existing story to be a template
UPDATE public.stories 
SET 
  is_template = true,
  original_content = content,
  template_content = jsonb_build_object(
    'content', 'Once upon a time, there were three little pigs who decided to leave their mother''s house and build homes of their own.

The first little pig was in a hurry. He found some straw and quickly built a house. "This straw is light and easy to work with," said [CHILD_NAME]. But straw, while quick to use, is not very strong.

The second little pig wanted something a bit stronger. He gathered sticks and wood branches. "Wood is stronger than straw," thought [CHILD_NAME] as they built their house. At [CHILD_AGE] years old, [CHILD_NAME] was learning about different materials.

The third little pig knew that building a good house takes time and the right materials. [CHILD_NAME] decided to use bricks. "Bricks are heavy and hard to work with, but they make the strongest houses," said [CHILD_NAME]. It took much longer to build, but the house was very strong.

Soon, a big bad wolf came by. He went to [CHILD_NAME]''s first house and huffed and puffed and blew the straw house down! [CHILD_NAME] ran to their brother''s stick house.

The wolf followed and huffed and puffed and blew the stick house down too! Both pigs ran to their brother''s brick house.

When the wolf tried to blow down the brick house, he huffed and puffed until he was tired, but the house stood strong. The wolf couldn''t get in!

[CHILD_NAME] learned that choosing the right materials and taking time to build properly keeps you safe and secure.',
    'illustrations', jsonb_build_array(
      jsonb_build_object(
        'page', 1,
        'description', 'Three little pigs leaving home, with [CHILD_NAME] as the main character',
        'placeholder_avatar', true
      ),
      jsonb_build_object(
        'page', 2,
        'description', '[CHILD_NAME] building a straw house',
        'placeholder_avatar', true
      ),
      jsonb_build_object(
        'page', 3,
        'description', '[CHILD_NAME] building a wooden house',
        'placeholder_avatar', true
      ),
      jsonb_build_object(
        'page', 4,
        'description', '[CHILD_NAME] building a brick house',
        'placeholder_avatar', true
      ),
      jsonb_build_object(
        'page', 5,
        'description', 'The wolf trying to blow down [CHILD_NAME]''s brick house',
        'placeholder_avatar', true
      )
    )
  )
WHERE title = 'The Three Little Pigs';