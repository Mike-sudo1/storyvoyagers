import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DalleInjectParams {
  illustrationUrl: string;
  avatarUrl: string;
  storyId: string;
  childId: string;
  pageIndex: number;
  emotion?: 'happy' | 'curious' | 'surprised' | 'excited' | 'thoughtful' | 'confident';
  storyText?: string;
}

export const useDalleFaceInjection = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCache = async (cacheKey: string): Promise<string | null> => {
    const { data } = await supabase
      .from('personalized_images')
      .select('image_url')
      .eq('cache_key', cacheKey)
      .maybeSingle();
    return data?.image_url || null;
  };

  const injectFaceWithDalle = async (params: DalleInjectParams): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const cacheKey = `dalle_${params.storyId}_${params.childId}_${params.pageIndex}`;
      
      // Check cache first
      const cached = await checkCache(cacheKey);
      if (cached) {
        console.log('Using cached DALL-E image:', cached);
        return cached;
      }

      console.log('Generating new DALL-E personalized image...');

      // Detect emotion from story text if not provided
      const detectedEmotion = params.emotion || detectEmotionFromText(params.storyText || '');

      const { data, error: functionError } = await supabase.functions.invoke('dalle-face-injection', {
        body: {
          illustrationUrl: params.illustrationUrl,
          avatarUrl: params.avatarUrl,
          storyId: params.storyId,
          childId: params.childId,
          pageIndex: params.pageIndex,
          emotion: detectedEmotion,
          storyText: params.storyText,
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate personalized image');
      }

      console.log('Successfully generated DALL-E personalized image:', data.imageUrl);
      return data.imageUrl;

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'DALL-E face injection failed';
      console.error('DALL-E face injection error:', e);
      setError(msg);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { injectFaceWithDalle, isProcessing, error };
};

function detectEmotionFromText(storyText: string): 'happy' | 'curious' | 'surprised' | 'excited' | 'thoughtful' | 'confident' {
  const text = storyText.toLowerCase();
  
  // Emotion detection patterns
  if (text.includes('smiled') || text.includes('happy') || text.includes('laughed') || text.includes('joy')) {
    return 'happy';
  }
  if (text.includes('stepped forward') || text.includes('confident') || text.includes('boldly') || text.includes('determined')) {
    return 'confident';
  }
  if (text.includes('curious') || text.includes('wondered') || text.includes('explore') || text.includes('mystery')) {
    return 'curious';
  }
  if (text.includes('surprised') || text.includes('amazed') || text.includes('gasped') || text.includes('wow')) {
    return 'surprised';
  }
  if (text.includes('excited') || text.includes('eager') || text.includes('thrilled') || text.includes('adventure')) {
    return 'excited';
  }
  if (text.includes('thought') || text.includes('pondered') || text.includes('considered') || text.includes('carefully')) {
    return 'thoughtful';
  }
  
  // Default to happy for positive engagement
  return 'happy';
}