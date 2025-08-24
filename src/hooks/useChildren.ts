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

export const useCartoonifyAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ childId, imageFile }: { childId: string; imageFile: File }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      console.log('Cartoonifying avatar for child:', childId);
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('childId', childId);

      // Use the Supabase project URL for FormData uploads
      const response = await fetch('https://bsjjxgpaxfawoyjgufgo.supabase.co/functions/v1/cartoonify-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cartoonify error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: `HTTP ${response.status}: ${errorText}` };
        }
        throw new Error(errorData.error || 'Failed to cartoonify avatar');
      }

      const result = await response.json();
      console.log('Cartoonify success:', result);
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Avatar cartoonified successfully!');
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
    onError: (error: Error) => {
      console.error('Cartoonify mutation error:', error);
      toast.error(error.message || 'Failed to cartoonify avatar');
    }
  });
};