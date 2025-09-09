import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StoryPage {
  page_number: number;
  text: string;
}

interface GenerationProgress {
  total_pages: number;
  completed_pages: number;
  current_page: number;
  status: 'idle' | 'generating' | 'completed' | 'error';
  error?: string;
}

interface IllustrationResult {
  page_number: number;
  image_url: string;
  generation_status: string;
}

export const useStoryIllustrations = () => {
  const [progress, setProgress] = useState<GenerationProgress>({
    total_pages: 0,
    completed_pages: 0,
    current_page: 0,
    status: 'idle'
  });
  
  const [illustrations, setIllustrations] = useState<{ [key: number]: string }>({});

  const checkExistingIllustrations = async (storyId: string, childId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('story_illustrations')
        .select('page_number, image_url, generation_status')
        .eq('story_id', storyId)
        .eq('child_id', childId)
        .eq('generation_status', 'success');

      if (error) throw error;

      if (data && data.length > 0) {
        const illustrationMap: { [key: number]: string } = {};
        data.forEach((item: IllustrationResult) => {
          illustrationMap[item.page_number] = item.image_url;
        });
        setIllustrations(illustrationMap);
        return data.length > 0;
      }

      return false;
    } catch (error) {
      console.error('Error checking existing illustrations:', error);
      return false;
    }
  };

  const generateStoryIllustrations = async (
    storyId: string,
    childId: string,
    storyPages: StoryPage[],
    childAvatarUrl: string,
    characterPrompt: string,
    stylePrompt?: string
  ): Promise<boolean> => {
    try {
      setProgress({
        total_pages: storyPages.length,
        completed_pages: 0,
        current_page: 1,
        status: 'generating'
      });

      const { data, error } = await supabase.functions.invoke('generate-illustrated-story', {
        body: {
          story_id: storyId,
          child_id: childId,
          story_pages: storyPages,
          child_avatar_url: childAvatarUrl,
          character_prompt: characterPrompt,
          style_prompt: stylePrompt
        }
      });

      if (error) throw error;

      if (data.success) {
        // Build illustrations map from results
        const illustrationMap: { [key: number]: string } = {};
        data.results.forEach((result: any) => {
          if (result.image_url) {
            illustrationMap[result.page_number] = result.image_url;
          }
        });

        setIllustrations(illustrationMap);
        setProgress({
          total_pages: data.total_pages,
          completed_pages: data.generated_count + data.cached_count,
          current_page: data.total_pages,
          status: 'completed'
        });

        return true;
      } else {
        throw new Error('Generation failed');
      }

    } catch (error) {
      console.error('Error generating story illustrations:', error);
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      return false;
    }
  };

  const getIllustrationUrl = (pageNumber: number): string | null => {
    return illustrations[pageNumber] || null;
  };

  const buildCharacterPrompt = (child: any): string => {
    const age = child.age || 6;
    const grade = child.grade || 'elementary';
    
    // Build basic character description
    let prompt = `${age}-year-old child`;
    
    // Add more details if available
    if (child.interests && child.interests.length > 0) {
      const mainInterest = child.interests[0];
      prompt += ` who loves ${mainInterest}`;
    }

    return prompt;
  };

  const resetProgress = () => {
    setProgress({
      total_pages: 0,
      completed_pages: 0,
      current_page: 0,
      status: 'idle'
    });
  };

  return {
    progress,
    illustrations,
    generateStoryIllustrations,
    checkExistingIllustrations,
    getIllustrationUrl,
    buildCharacterPrompt,
    resetProgress
  };
};