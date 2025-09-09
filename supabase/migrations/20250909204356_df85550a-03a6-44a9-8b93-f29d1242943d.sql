-- Upload circular mask to Supabase Storage
-- This will be used by the inject-avatar edge function for DALL-E inpainting

-- First ensure the masks directory exists in StoryVoyagers bucket
-- The mask image will be uploaded manually to: StoryVoyagers/masks/circle_512.png

-- Create a simple function to help with mask creation if needed in the future
CREATE OR REPLACE FUNCTION public.get_mask_url(mask_name TEXT DEFAULT 'circle_512.png')
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://bsjjxgpaxfawoyjgufgo.supabase.co/storage/v1/object/public/StoryVoyagers/masks/' || mask_name;
END;
$$ LANGUAGE plpgsql;