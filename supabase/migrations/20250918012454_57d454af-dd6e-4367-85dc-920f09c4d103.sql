-- Create story_pages table for storing individual story page illustrations
CREATE TABLE IF NOT EXISTS public.story_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  page_number INTEGER NOT NULL,
  text_content TEXT NOT NULL,
  image_url TEXT,
  generation_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique page numbers per story
  UNIQUE(story_id, page_number)
);

-- Enable RLS
ALTER TABLE public.story_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for story_pages
CREATE POLICY "Anyone can view story pages" 
ON public.story_pages 
FOR SELECT 
USING (true);

CREATE POLICY "Service can manage story pages" 
ON public.story_pages 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_story_pages_updated_at
BEFORE UPDATE ON public.story_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();