-- Add avatar_json column to children table to store avatar configuration
ALTER TABLE public.children 
ADD COLUMN avatar_json JSONB DEFAULT NULL;