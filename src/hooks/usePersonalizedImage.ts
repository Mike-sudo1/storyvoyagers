import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PersonalizeImageParams {
  storyImageUrl: string;
  childAvatarUrl: string;
  childId: string;
  storyId: string;
  pageIndex: number;
  emotion?: 'happy' | 'curious' | 'surprised' | 'excited' | 'thoughtful' | 'confident';
}

export const usePersonalizedImage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const personalizeImage = async (params: PersonalizeImageParams): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('personalize-story-image', {
        body: {
          storyImageUrl: params.storyImageUrl,
          childAvatarUrl: params.childAvatarUrl,
          childId: params.childId,
          storyId: params.storyId,
          pageIndex: params.pageIndex,
          emotion: params.emotion || 'happy'
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data?.imageUrl) {
        throw new Error('No personalized image URL received');
      }

      return data.imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to personalize image';
      setError(errorMessage);
      console.error('Image personalization error:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const getEmotionForScene = (content: string, pageIndex: number): 'happy' | 'curious' | 'surprised' | 'excited' | 'thoughtful' | 'confident' => {
    const lowerContent = content.toLowerCase();
    
    // Analyze content to determine appropriate emotion
    if (lowerContent.includes('puzzle') || lowerContent.includes('mystery') || lowerContent.includes('wonder')) {
      return 'curious';
    } else if (lowerContent.includes('surprise') || lowerContent.includes('amazing') || lowerContent.includes('incredible')) {
      return 'surprised';
    } else if (lowerContent.includes('adventure') || lowerContent.includes('exciting') || lowerContent.includes('discover')) {
      return 'excited';
    } else if (lowerContent.includes('think') || lowerContent.includes('solve') || lowerContent.includes('understand')) {
      return 'thoughtful';
    } else if (lowerContent.includes('brave') || lowerContent.includes('confident') || lowerContent.includes('strong')) {
      return 'confident';
    }
    
    // Default to happy for most scenes
    return 'happy';
  };

  return {
    personalizeImage,
    getEmotionForScene,
    isProcessing,
    error
  };
};