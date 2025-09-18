-- Add sample Ancient Egypt story content if it doesn't exist
INSERT INTO stories (
  id,
  title,
  subject,
  description,
  content,
  template_content,
  age_min,
  age_max,
  is_template,
  created_at,
  updated_at
) VALUES (
  'ancient-egypt',
  'Adventure in Ancient Egypt',
  'history',
  'Travel back in time to ancient Egypt and uncover the mysteries of pharaohs, pyramids, and hieroglyphs.',
  '"Kid" opens a dusty book and—whoosh!—a warm breeze smells like river plants and sunshine. "Welcome to Kemet, the land of the Black Soil," says Hori, a cheerful young scribe. "I''m Hori! Come explore Ancient Egypt with me!"

They stand by the long Nile River, the life of Egypt. "The river gives water, food, and travel," Hori says. "It flows from south to north!" "Kid" cups water in their hands and smiles.

They ride a small boat. Fishermen cast nets, an ibis stalks the shore, and a crocodile sunbathes far away. "People eat bread and fish," Hori whispers. "The river feeds us."',
  jsonb_build_object(
    'content', '[CHILD_NAME] opens a dusty book and—whoosh!—a warm breeze smells like river plants and sunshine. "Welcome to Kemet, the land of the Black Soil," says Hori, a cheerful young scribe. "I''m Hori! Come explore Ancient Egypt with me!"

They stand by the long Nile River, the life of Egypt. "The river gives water, food, and travel," Hori says. "It flows from south to north!" [CHILD_NAME] cups water in their hands and smiles.

They ride a small boat. Fishermen cast nets, an ibis stalks the shore, and a crocodile sunbathes far away. "People eat bread and fish," Hori whispers. "The river feeds us."

"I''m learning to be a scribe," Hori says proudly. He shows a reed pen and a smooth sheet of papyrus. "We write with pictures called hieroglyphs."

Hori paints symbols that sound like "[CHILD_NAME]." [CHILD_NAME] tries too, tongue sticking out in concentration. "You wrote your name the Egyptian way!"',
    'illustrations', jsonb_build_array(
      jsonb_build_object('page', 1, 'description', '[CHILD_NAME] opens a dusty book and travels to ancient Egypt', 'placeholder_avatar', true),
      jsonb_build_object('page', 2, 'description', '[CHILD_NAME] stands by the Nile River with Hori the scribe', 'placeholder_avatar', true),
      jsonb_build_object('page', 3, 'description', '[CHILD_NAME] rides a boat on the Nile River', 'placeholder_avatar', true),
      jsonb_build_object('page', 4, 'description', '[CHILD_NAME] learns to write hieroglyphs with Hori', 'placeholder_avatar', true),
      jsonb_build_object('page', 5, 'description', '[CHILD_NAME] writes their name in hieroglyphs', 'placeholder_avatar', true)
    )
  ),
  6,
  9,
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  template_content = EXCLUDED.template_content,
  updated_at = now();