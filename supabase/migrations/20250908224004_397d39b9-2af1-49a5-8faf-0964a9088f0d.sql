-- Create table for caching personalized story images
CREATE TABLE public.personalized_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  story_id TEXT NOT NULL,
  child_id UUID NOT NULL,
  page_index INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  emotion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.personalized_images ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own personalized images
CREATE POLICY "Users can view personalized images for their children" 
ON public.personalized_images 
FOR SELECT 
USING (
  child_id IN (
    SELECT id FROM public.children WHERE user_id = auth.uid()
  )
);

-- Create policy for the service to insert personalized images
CREATE POLICY "Service can insert personalized images" 
ON public.personalized_images 
FOR INSERT 
WITH CHECK (true);

-- Add index for faster cache lookups
CREATE INDEX idx_personalized_images_cache_key ON public.personalized_images(cache_key);
CREATE INDEX idx_personalized_images_story_child ON public.personalized_images(story_id, child_id);