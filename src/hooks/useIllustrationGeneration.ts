import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChildFeatures {
  name: string;
  age: number;
  skinTone: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  faceShape: string;
}

interface GenerateIllustrationParams {
  prompt: string;
  childFeatures: ChildFeatures;
  style?: string;
  size?: string;
}

export const useIllustrationGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateIllustration = async (params: GenerateIllustrationParams): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-story-illustration', {
        body: {
          prompt: params.prompt,
          childFeatures: params.childFeatures,
          style: params.style || 'cartoon',
          size: params.size || '1024x768'
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data?.imageUrl) {
        throw new Error('No image URL received');
      }

      return data.imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate illustration';
      setError(errorMessage);
      console.error('Illustration generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const extractChildFeatures = (child: any): ChildFeatures => {
    // Extract features from child profile or provide defaults
    return {
      name: child.name || 'Child',
      age: child.age || 6,
      skinTone: 'light',
      hairColor: 'dark brown',
      hairStyle: 'straight medium-length with middle part',
      eyeColor: 'brown',
      faceShape: 'oval'
    };
  };

  return {
    generateIllustration,
    extractChildFeatures,
    isGenerating,
    error
  };
};