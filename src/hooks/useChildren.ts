import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useChildren = () => {
  return useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/functions/v1/manage-children', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch children');
      }

      const data = await response.json();
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/functions/v1/manage-children', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(childData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create child');
      }

      return response.json();
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/functions/v1/manage-children?id=${childId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(childData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update child');
      }

      return response.json();
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/functions/v1/manage-children?id=${childId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete child');
      }

      return response.json();
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

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('childId', childId);

      const response = await fetch('/functions/v1/cartoonify-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cartoonify avatar');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Avatar cartoonified successfully!');
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cartoonify avatar');
    }
  });
};