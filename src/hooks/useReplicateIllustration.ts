import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReplicateIllustrationParams {
  prompt: string;
  childFeatures: string;
  avatarUrl?: string;
  style?: string;
  size?: string;
}

export const useReplicateIllustration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateIllustration = async (params: ReplicateIllustrationParams): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Build enhanced prompt for Stable Diffusion
      const enhancedPrompt = `Full-page storybook illustration. Scene: ${params.prompt}. 
Featuring the main character: ${params.childFeatures}.
Style: ${params.style || 'colorful cartoon illustration, Pixar-style, storybook art, child-friendly'}.
The character should maintain consistent appearance throughout the story - same clothes, hairstyle, and facial features.
High quality, professional children's book illustration, vibrant colors, detailed background.`;

      const { data, error: functionError } = await supabase.functions.invoke('generate-story-illustration-replicate', {
        body: {
          prompt: enhancedPrompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, extra limbs, watermark, signature, text, letters",
          width: 1024,
          height: 1024,
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
      console.error('Replicate illustration generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateIllustration,
    isGenerating,
    error
  };
};