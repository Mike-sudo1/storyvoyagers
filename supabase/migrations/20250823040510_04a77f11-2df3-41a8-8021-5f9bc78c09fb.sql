-- Create profiles table for user settings and preferences
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'es', 'bilingual')),
  font_preference TEXT DEFAULT 'regular' CHECK (font_preference IN ('regular', 'dyslexia')),
  high_contrast BOOLEAN DEFAULT false,
  narration_speed TEXT DEFAULT 'normal' CHECK (narration_speed IN ('slow', 'normal', 'fast')),
  auto_play BOOLEAN DEFAULT true,
  reading_reminders TEXT DEFAULT 'daily',
  auto_download TEXT DEFAULT 'wifi' CHECK (auto_download IN ('wifi', 'always', 'never')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create children table for child profiles
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pronouns TEXT DEFAULT 'they' CHECK (pronouns IN ('he', 'she', 'they')),
  age INTEGER CHECK (age >= 3 AND age <= 18),
  grade TEXT,
  avatar_url TEXT,
  reading_level TEXT CHECK (reading_level IN ('A', 'B', 'C', 'D', 'E')),
  interests TEXT[] DEFAULT '{}',
  language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'es', 'bilingual')),
  stories_completed INTEGER DEFAULT 0,
  badges INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Create policies for children
CREATE POLICY "Users can view their own children" 
ON public.children 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own children" 
ON public.children 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children" 
ON public.children 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children" 
ON public.children 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create stories table for story content
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  age_min INTEGER NOT NULL CHECK (age_min >= 3 AND age_min <= 18),
  age_max INTEGER NOT NULL CHECK (age_max >= 3 AND age_max <= 18),
  reading_time INTEGER,
  genre TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es')),
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cover_image_url TEXT,
  content TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policy for stories (publicly readable for now)
CREATE POLICY "Stories are viewable by everyone" 
ON public.stories 
FOR SELECT 
USING (true);

-- Create library_items table for user's saved stories
CREATE TABLE public.library_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'reading', 'completed')),
  progress NUMERIC DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Enable Row Level Security
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- Create policies for library_items
CREATE POLICY "Users can view their own library items" 
ON public.library_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own library items" 
ON public.library_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own library items" 
ON public.library_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own library items" 
ON public.library_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_library_items_updated_at
  BEFORE UPDATE ON public.library_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();