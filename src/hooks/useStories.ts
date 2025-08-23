import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStories = () => {
  return useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase not connected');
      }
      
      const { data, error } = await (supabase as any)
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

      const { data: libraryItem, error } = await (supabase as any)
        .from('library_items')
        .insert({
          user_id: session.user.id,
          story_id: storyId,
          status: 'saved'
        })
        .select()
        .single();

      if (error) throw error;
      return libraryItem;
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