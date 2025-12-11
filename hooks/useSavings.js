'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { savingsService } from '@/services/supabase';
import { useToast } from '@/context/ToastContext';

const QUERY_KEY = ['savings'];

export function useSavings() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all savings goals
  const {
    data: savings = [],
    isLoading: loading,
    error,
    refetch: refreshSavings
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      return await savingsService.getAll();
    },
  });

  // Add savings mutation
  const addMutation = useMutation({
    mutationFn: async (savingsData) => {
      return await savingsService.add(savingsData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Savings goal created', 'success');
    },
    onError: (err) => {
      console.error('Error adding savings:', err);
      showToast('Failed to create savings goal', 'error');
    }
  });

  // Update savings mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      return await savingsService.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Savings goal updated', 'success');
    },
    onError: (err) => {
      console.error('Error updating savings:', err);
      showToast('Failed to update savings goal', 'error');
    }
  });

  // Delete savings mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await savingsService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Savings goal deleted', 'success');
    },
    onError: (err) => {
      console.error('Error deleting savings:', err);
      showToast('Failed to delete savings goal', 'error');
    }
  });

  // Add deposit mutation
  const addDepositMutation = useMutation({
    mutationFn: async ({ id, amount, note }) => {
      return await savingsService.addDeposit(id, amount, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Deposit added', 'success');
    },
    onError: (err) => {
      console.error('Error adding deposit:', err);
      showToast('Failed to add deposit', 'error');
    }
  });

  // Helper functions
  const getActiveSavings = () => {
    return savings.filter(s => s.status === 'active');
  };

  const getCompletedSavings = () => {
    return savings.filter(s => s.status === 'completed');
  };

  const getTotalSaved = () => {
    return savings.reduce((sum, s) => sum + (s.currentAmount || 0), 0);
  };

  return {
    savings,
    loading,
    error,
    addSavings: addMutation.mutateAsync,
    updateSavings: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteSavings: deleteMutation.mutateAsync,
    addDeposit: (id, amount, note) => addDepositMutation.mutateAsync({ id, amount, note }),
    getActiveSavings,
    getCompletedSavings,
    getTotalSaved,
    refreshSavings,
  };
}
