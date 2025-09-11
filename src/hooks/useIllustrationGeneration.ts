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
  avatarUrl?: string;
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
      const { data, error: functionError } = await supabase.functions.invoke('generate-story-illustration-replicate', {
        body: {
          prompt: `Full-page storybook illustration. Scene: ${params.prompt}. 
Featuring the main character: ${params.childFeatures.name}, age ${params.childFeatures.age}, with ${params.childFeatures.skinTone} skin, ${params.childFeatures.hairColor} ${params.childFeatures.hairStyle} hair, ${params.childFeatures.eyeColor} eyes, and ${params.childFeatures.faceShape} face shape.
Style: ${params.style || 'colorful cartoon illustration, Pixar-style, storybook art, child-friendly'}.
The character should maintain consistent appearance throughout the story - same clothes, hairstyle, and facial features.
High quality, professional children's book illustration, vibrant colors, detailed background.`,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, extra limbs, watermark, signature, text, letters",
          width: parseInt(params.size?.split('x')[0] || '1024'),
          height: parseInt(params.size?.split('x')[1] || '768'),
          style: params.style || 'cartoon'
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