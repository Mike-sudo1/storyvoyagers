import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useChildren = () => {
  return useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-children', {
        body: { method: 'GET' }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch children');
      }

      return data.children || [];
    }
  });
};

export const useCreateChild = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (childData: {
      name: string;
      age: number;
      pronouns?: string;
      grade?: string;
      reading_level?: string;
      interests?: string[];
      language_preference?: string;
      avatar_json?: any;
      avatar_url?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('manage-children', {
        body: { method: 'POST', ...childData }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create child');
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success('Child profile created successfully!');
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create child profile');
    }
  });
};

export const useUpdateChild = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ childId, ...childData }: {
      childId: string;
      name?: string;
      age?: number;
      pronouns?: string;
      grade?: string;
      reading_level?: string;
      interests?: string[];
      language_preference?: string;
      avatar_json?: any;
      avatar_url?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('manage-children', {
        body: { method: 'PUT', id: childId, ...childData }
      });

      if (error) {
        throw new Error(error.message || 'Failed to update child');
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success('Child profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update child profile');
    }
  });
};

export const useDeleteChild = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (childId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-children', {
        body: { method: 'DELETE', id: childId }
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete child');
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success('Child profile deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete child profile');
    }
  });
};