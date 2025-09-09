-- Fix storage policies for face injection
-- Create storage policies for the StoryVoyagers bucket to allow personalized image uploads

-- Allow authenticated users to upload personalized images to their own folders
CREATE POLICY "Users can upload personalized images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'StoryVoyagers' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'personalized'
);

-- Allow authenticated users to view personalized images
CREATE POLICY "Users can view personalized images" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'StoryVoyagers'
  AND (
    -- Allow public access to public story images
    (storage.foldername(name))[1] != 'personalized'
    OR
    -- Allow users to access their own personalized images
    auth.uid() IS NOT NULL
  )
);

-- Allow authenticated users to update their personalized images (for upsert)
CREATE POLICY "Users can update personalized images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'StoryVoyagers' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'personalized'
);

-- Create RLS policies for personalized_images table
ALTER TABLE public.personalized_images ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own personalized images
CREATE POLICY "Users can insert personalized images" 
ON public.personalized_images 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view personalized images (for caching checks)
CREATE POLICY "Users can view personalized images" 
ON public.personalized_images 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow users to update their personalized images (for upsert)
CREATE POLICY "Users can update personalized images" 
ON public.personalized_images 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);