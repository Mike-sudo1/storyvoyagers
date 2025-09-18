import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GenerationProgress {
  total_pages: number;
  generated_count: number;
  cached_count: number;
  error_count: number;
  current_page?: number;
  status: 'idle' | 'generating' | 'complete' | 'error';
}

interface StoryPage {
  page_number: number;
  text_content: string;
  image_url?: string;
  generation_status: 'pending' | 'generating' | 'success' | 'error';
}

export const useStoryGeneration = () => {
  const [progress, setProgress] = useState<GenerationProgress>({
    total_pages: 0,
    generated_count: 0,
    cached_count: 0,
    error_count: 0,
    status: 'idle'
  });
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkExistingPages = async (storyId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('story_pages')
        .select('page_number, text_content, image_url, generation_status')
        .eq('story_id', storyId)
        .order('page_number');

      if (error) {
        console.error('Error checking existing pages:', error);
        return false;
      }

      const hasAllPages = data && data.length === 35;
      const allGenerated = data?.every(page => page.generation_status === 'success' && page.image_url);
      
      if (hasAllPages && allGenerated) {
        setStoryPages(data as StoryPage[]);
        setProgress({
          total_pages: 35,
          generated_count: 0,
          cached_count: 35,
          error_count: 0,
          status: 'complete'
        });
        return true;
      }

      if (data && data.length > 0) {
        setStoryPages(data as StoryPage[]);
        const successCount = data.filter(p => p.generation_status === 'success').length;
        const errorCount = data.filter(p => p.generation_status === 'error').length;
        setProgress({
          total_pages: data.length,
          generated_count: 0,
          cached_count: successCount,
          error_count: errorCount,
          status: successCount === data.length ? 'complete' : 'idle'
        });
      }

      return false;
    } catch (err) {
      console.error('Error checking existing pages:', err);
      return false;
    }
  };

  const generateStoryIllustrations = async (storyId: string, childId: string): Promise<boolean> => {
    setProgress(prev => ({ ...prev, status: 'generating' }));
    setError(null);

    try {
      console.log('Starting story illustration generation:', { storyId, childId });

      const { data, error: functionError } = await supabase.functions.invoke('generate-illustrated-story', {
        body: {
          story_id: storyId,
          child_id: childId
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Story generation failed');
      }

      // Update progress with final results
      setProgress({
        total_pages: data.total_pages || 35,
        generated_count: data.generated_count || 0,
        cached_count: data.cached_count || 0,
        error_count: data.error_count || 0,
        status: data.error_count > 0 ? 'error' : 'complete'
      });

      // Fetch updated pages
      await checkExistingPages(storyId);

      console.log('Story generation completed:', data);
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate story illustrations';
      setError(errorMessage);
      setProgress(prev => ({ ...prev, status: 'error' }));
      console.error('Story generation error:', err);
      return false;
    }
  };

  const resetProgress = () => {
    setProgress({
      total_pages: 0,
      generated_count: 0,
      cached_count: 0,
      error_count: 0,
      status: 'idle'
    });
    setStoryPages([]);
    setError(null);
  };

  const getPageUrl = (pageNumber: number): string | null => {
    const page = storyPages.find(p => p.page_number === pageNumber);
    return page?.image_url || null;
  };

  return {
    progress,
    storyPages,
    error,
    checkExistingPages,
    generateStoryIllustrations,
    resetProgress,
    getPageUrl
  };
};