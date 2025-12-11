'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activityService } from '@/services/supabase';

const QUERY_KEY = ['activities'];

export function useActivities() {
  const queryClient = useQueryClient();

  // Fetch all activities
  const {
    data: activities = [],
    isLoading: loading,
    error,
    refetch: refreshActivities
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      return await activityService.getAll();
    },
  });

  // Log activity mutation
  const logMutation = useMutation({
    mutationFn: async (activity) => {
      return await activityService.log(activity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (err) => {
      console.error('Error logging activity:', err);
    }
  });

  // Helper functions
  const filterByType = (type) => {
    return activities.filter(a => a.type === type);
  };

  const searchActivities = (query) => {
    const lowerQuery = query.toLowerCase();
    return activities.filter(a =>
      a.description?.toLowerCase().includes(lowerQuery) ||
      a.type?.toLowerCase().includes(lowerQuery)
    );
  };

  const getRecentActivities = (limit = 10) => {
    return activities.slice(0, limit);
  };

  return {
    activities,
    loading,
    error,
    logActivity: logMutation.mutateAsync,
    filterByType,
    searchActivities,
    getRecentActivities,
    refreshActivities,
  };
}
