'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { debtService } from '@/services/supabase';
import { useToast } from '@/context/ToastContext';

const QUERY_KEY = ['debts'];

export function useDebts() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all debts
  const {
    data: debts = [],
    isLoading: loading,
    error,
    refetch: refreshDebts
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      return await debtService.getAll();
    },
  });

  // Add debt mutation
  const addMutation = useMutation({
    mutationFn: async (debtData) => {
      return await debtService.add(debtData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Debt added successfully', 'success');
    },
    onError: (err) => {
      console.error('Error adding debt:', err);
      showToast('Failed to add debt', 'error');
    }
  });

  // Update debt mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      return await debtService.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Debt updated', 'success');
    },
    onError: (err) => {
      console.error('Error updating debt:', err);
      showToast('Failed to update debt', 'error');
    }
  });

  // Delete debt mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await debtService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Debt deleted', 'success');
    },
    onError: (err) => {
      console.error('Error deleting debt:', err);
      showToast('Failed to delete debt', 'error');
    }
  });

  // Mark payment as paid mutation
  const markPaymentPaidMutation = useMutation({
    mutationFn: async ({ debtId, paymentIndex }) => {
      return await debtService.markPaymentPaid(debtId, paymentIndex);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Payment marked as paid', 'success');
    },
    onError: (err) => {
      console.error('Error marking payment:', err);
      showToast('Failed to mark payment', 'error');
    }
  });

  // Helper functions
  const getActiveDebts = () => {
    return debts.filter(d => d.status === 'active');
  };

  const getCompletedDebts = () => {
    return debts.filter(d => d.status === 'completed');
  };

  const getTotalDebt = () => {
    return debts
      .filter(d => d.status === 'active')
      .reduce((sum, d) => sum + d.totalAmount, 0);
  };

  return {
    debts,
    loading,
    error,
    addDebt: addMutation.mutateAsync,
    updateDebt: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteDebt: deleteMutation.mutateAsync,
    markPaymentPaid: (debtId, paymentIndex) =>
      markPaymentPaidMutation.mutateAsync({ debtId, paymentIndex }),
    getActiveDebts,
    getCompletedDebts,
    getTotalDebt,
    refreshDebts,
  };
}
