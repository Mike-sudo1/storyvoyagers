import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLibrary = () => {
  return useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data: libraryItems, error } = await supabase
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