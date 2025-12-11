'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { budgetService } from '@/services/supabase';
import { useToast } from '@/context/ToastContext';

const QUERY_KEY = ['budgets'];

export function useBudgets() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all budgets
  const {
    data: budgets = [],
    isLoading: loading,
    error,
    refetch: refreshBudgets
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      return await budgetService.getAll();
    },
  });

  // Add budget mutation
  const addMutation = useMutation({
    mutationFn: async (budgetData) => {
      return await budgetService.add(budgetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Budget created successfully', 'success');
    },
    onError: (err) => {
      console.error('Error adding budget:', err);
      showToast('Failed to create budget', 'error');
    }
  });

  // Update budget mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      return await budgetService.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Budget updated', 'success');
    },
    onError: (err) => {
      console.error('Error updating budget:', err);
      showToast('Failed to update budget', 'error');
    }
  });

  // Delete budget mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await budgetService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Budget deleted', 'success');
    },
    onError: (err) => {
      console.error('Error deleting budget:', err);
      showToast('Failed to delete budget', 'error');
    }
  });

  // Update spent mutation
  const updateSpentMutation = useMutation({
    mutationFn: async ({ id, amount }) => {
      return await budgetService.updateSpent(id, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (err) => {
      console.error('Error updating budget spent:', err);
    }
  });

  // Helper functions
  const getCurrentMonthBudgets = () => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    return budgets
      .filter(b => b.month === currentMonth)
      .map(budget => ({
        ...budget,
        status: getStatus(budget)
      }));
  };

  const getStatus = (budget) => {
    const percentage = (budget.spent / budget.limit) * 100;
    if (percentage >= 100) return 'exceeded';
    if (percentage >= budget.alertThreshold) return 'warning';
    return 'safe';
  };

  const checkBudgetAlert = (category, amount) => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const budget = budgets.find(b => b.category === category && b.month === currentMonth);

    if (!budget) return null;

    const newSpent = budget.spent + amount;
    const percentage = (newSpent / budget.limit) * 100;

    if (percentage >= 100) {
      return { type: 'exceeded', category, percentage };
    } else if (percentage >= budget.alertThreshold) {
      return { type: 'warning', category, percentage };
    }
    return null;
  };

  return {
    budgets,
    loading,
    error,
    addBudget: addMutation.mutateAsync,
    updateBudget: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteBudget: deleteMutation.mutateAsync,
    updateSpent: (id, amount) => updateSpentMutation.mutateAsync({ id, amount }),
    getCurrentMonthBudgets,
    checkBudgetAlert,
    refreshBudgets,
  };
}
