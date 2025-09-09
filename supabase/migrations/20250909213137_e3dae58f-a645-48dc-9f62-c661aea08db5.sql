-- Create table for tracking story illustration generation
CREATE TABLE public.story_illustrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  child_id UUID NOT NULL,
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  generation_status TEXT NOT NULL DEFAULT 'pending',
  prompt_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, child_id, page_number)
);

-- Enable RLS
ALTER TABLE public.story_illustrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view illustrations for their children"
ON public.story_illustrations
FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE user_id = auth.uid()
));

CREATE POLICY "Service can manage story illustrations"
ON public.story_illustrations
FOR ALL
USING (true);

-- Create function to update timestamps
CREATE TRIGGER update_story_illustrations_updated_at
BEFORE UPDATE ON public.story_illustrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();