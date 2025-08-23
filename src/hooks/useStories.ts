import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useStories = () => {
  return useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase not connected');
      }
      
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useSaveStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (storyId: string) => {
      if (!supabase) {
        throw new Error('Supabase not connected');
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/functions/v1/save-to-library', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storyId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save story');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Story saved to library!');
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save story');
    }
  });
};