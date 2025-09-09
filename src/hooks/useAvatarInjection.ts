import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AvatarInjectionParams {
  template_image_url: string;
  avatar_url: string;
  face_anchor: {
    x: number;
    y: number;
    r: number;
    units?: string;
  };
  emotion?: 'happy' | 'curious' | 'surprised' | 'excited' | 'thoughtful' | 'confident' | 'sad' | 'scared';
  angle?: 'front' | 'left' | 'right' | 'profile';
  story_id: string;
  child_id: string;
  page_index: number;
}

export const useAvatarInjection = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const injectAvatar = async (params: AvatarInjectionParams): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Injecting avatar with params:', params);

      const { data, error: functionError } = await supabase.functions.invoke('inject-avatar', {
        body: params,
      });

      if (functionError) {
        throw functionError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to inject avatar');
      }

      console.log('Successfully injected avatar:', data.imageUrl);
      return data.imageUrl;

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Avatar injection failed';
      console.error('Avatar injection error:', e);
      setError(msg);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const getInjectedImageUrl = (storyId: string, pageIndex: number): string => {
    return supabase.storage
      .from('StoryVoyagers')
      .getPublicUrl(`story_injected/${storyId}/page_${pageIndex}.png`).data.publicUrl;
  };

  return { injectAvatar, isProcessing, error, getInjectedImageUrl };
};

// Helper function to detect emotion from story text
export const detectEmotionFromText = (storyText: string): 'happy' | 'curious' | 'surprised' | 'excited' | 'thoughtful' | 'confident' | 'sad' | 'scared' => {
  const text = storyText.toLowerCase();
  
  if (text.includes('scared') || text.includes('afraid') || text.includes('frightened')) {
    return 'scared';
  }
  if (text.includes('sad') || text.includes('cried') || text.includes('upset')) {
    return 'sad';
  }
  if (text.includes('smiled') || text.includes('happy') || text.includes('laughed') || text.includes('joy')) {
    return 'happy';
  }
  if (text.includes('confident') || text.includes('boldly') || text.includes('determined') || text.includes('stepped forward')) {
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
  
  return 'happy'; // Default fallback
};