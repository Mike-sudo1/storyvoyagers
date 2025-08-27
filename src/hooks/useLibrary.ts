import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLibrary = () => {
  return useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data: libraryItems, error } = await (supabase as any)
        .from('library_items')
        .select(`
          *,
          stories (
            id,
            title,
            description,
            subject,
            age_min,
            age_max,
            reading_time,
            genre,
            difficulty,
            cover_image_url,
            is_premium
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return libraryItems || [];
    }
  });
};

export const useSaveToLibrary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (storyId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('library_items')
        .insert({
          user_id: session.user.id,
          story_id: storyId,
          status: 'saved'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Story saved to library!');
    },
    onError: (error) => {
      console.error('Save to library error:', error);
      toast.error('Failed to save story to library');
    }
  });
};

export const useRemoveFromLibrary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (storyId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('library_items')
        .delete()
        .eq('user_id', session.user.id)
        .eq('story_id', storyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Story removed from library');
    },
    onError: (error) => {
      console.error('Remove from library error:', error);
      toast.error('Failed to remove story from library');
    }
  });
};