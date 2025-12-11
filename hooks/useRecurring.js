'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, addMonths, addWeeks, addYears, isAfter, isBefore, parseISO } from 'date-fns';
import { recurringService } from '@/services/supabase';
import { useToast } from '@/context/ToastContext';

const QUERY_KEY = ['recurring'];

export function useRecurring() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all recurring transactions
  const {
    data: recurringTransactions = [],
    isLoading: loading,
    error,
    refetch: refreshRecurring
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      return await recurringService.getAll();
    },
  });

  // Add recurring mutation
  const addMutation = useMutation({
    mutationFn: async (data) => {
      return await recurringService.add(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Recurring transaction added', 'success');
    },
    onError: (err) => {
      console.error('Error adding recurring:', err);
      showToast('Failed to add recurring transaction', 'error');
    }
  });

  // Update recurring mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      return await recurringService.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Recurring transaction updated', 'success');
    },
    onError: (err) => {
      console.error('Error updating recurring:', err);
      showToast('Failed to update recurring transaction', 'error');
    }
  });

  // Delete recurring mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await recurringService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Recurring transaction deleted', 'success');
    },
    onError: (err) => {
      console.error('Error deleting recurring:', err);
      showToast('Failed to delete recurring transaction', 'error');
    }
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async (id) => {
      const recurring = recurringTransactions.find(r => r.id === id);
      if (recurring) {
        return await recurringService.update(id, { isActive: !recurring.isActive });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }
  });

  // Helper functions
  const getActiveCount = () => {
    return recurringTransactions.filter(r => r.isActive).length;
  };

  const getMonthlyTotal = () => {
    return recurringTransactions
      .filter(r => r.isActive && r.type === 'expense')
      .reduce((sum, r) => {
        let monthly = r.amount;
        if (r.recurrence === 'daily') monthly = r.amount * 30;
        else if (r.recurrence === 'weekly') monthly = r.amount * 4;
        else if (r.recurrence === 'yearly') monthly = r.amount / 12;
        return sum + monthly;
      }, 0);
  };

  const getUpcoming = (days = 30) => {
    const now = new Date();
    const endDate = addDays(now, days);

    return recurringTransactions
      .filter(r => r.isActive && r.nextOccurrence)
      .filter(r => {
        const nextDate = parseISO(r.nextOccurrence);
        return isAfter(nextDate, now) && isBefore(nextDate, endDate);
      })
      .sort((a, b) => parseISO(a.nextOccurrence) - parseISO(b.nextOccurrence));
  };

  const calculateNextOccurrence = (date, recurrence) => {
    const currentDate = parseISO(date);
    switch (recurrence) {
      case 'daily': return addDays(currentDate, 1).toISOString();
      case 'weekly': return addWeeks(currentDate, 1).toISOString();
      case 'monthly': return addMonths(currentDate, 1).toISOString();
      case 'yearly': return addYears(currentDate, 1).toISOString();
      default: return addMonths(currentDate, 1).toISOString();
    }
  };

  return {
    recurringTransactions,
    loading,
    error,
    addRecurring: addMutation.mutateAsync,
    updateRecurring: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteRecurring: deleteMutation.mutateAsync,
    toggleActive: toggleActiveMutation.mutateAsync,
    getActiveCount,
    getMonthlyTotal,
    getUpcoming,
    calculateNextOccurrence,
    refreshRecurring,
  };
}
