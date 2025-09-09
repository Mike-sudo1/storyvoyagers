-- Enable RLS on personalized_images table if not already enabled
DO $$ 
BEGIN
  -- Only enable RLS if it's not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class 
    WHERE relname = 'personalized_images' 
    AND relrowsecurity = true
  ) THEN
    ALTER TABLE public.personalized_images ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create missing policies for personalized_images table
-- Use IF NOT EXISTS pattern to avoid conflicts

-- Allow users to insert their own personalized images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'personalized_images' 
    AND policyname = 'Users can insert personalized images'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert personalized images" 
             ON public.personalized_images 
             FOR INSERT 
             WITH CHECK (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- Allow users to view personalized images (for caching checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'personalized_images' 
    AND policyname = 'Users can view personalized images'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view personalized images" 
             ON public.personalized_images 
             FOR SELECT 
             USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- Allow users to update their personalized images (for upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'personalized_images' 
    AND policyname = 'Users can update personalized images'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update personalized images" 
             ON public.personalized_images 
             FOR UPDATE 
             USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;