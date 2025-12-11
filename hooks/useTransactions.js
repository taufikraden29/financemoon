'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/supabase';
import { useToast } from '@/context/ToastContext';

const QUERY_KEY = ['transactions'];

export function useTransactions() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all transactions
  const {
    data: transactions = [],
    isLoading: loading,
    error,
    refetch: refreshTransactions
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const data = await transactionService.getAll();
      return data;
    },
  });

  // Add transaction mutation
  const addMutation = useMutation({
    mutationFn: async (transaction) => {
      return await transactionService.add({
        ...transaction,
        date: transaction.date || new Date().toISOString(),
        amount: parseFloat(transaction.amount)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showToast('Transaction added successfully', 'success');
    },
    onError: (err) => {
      console.error('Error adding transaction:', err);
      showToast('Failed to add transaction', 'error');
    }
  });

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await transactionService.update(id, {
        ...data,
        amount: parseFloat(data.amount)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showToast('Transaction updated successfully', 'success');
    },
    onError: (err) => {
      console.error('Error updating transaction:', err);
      showToast('Failed to update transaction', 'error');
    }
  });

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await transactionService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showToast('Transaction deleted', 'success');
    },
    onError: (err) => {
      console.error('Error deleting transaction:', err);
      showToast('Failed to delete transaction', 'error');
    }
  });

  // Helper functions
  const getBalance = () => {
    return transactions
      .filter(t => !t.accountId)
      .reduce((acc, curr) => {
        return curr.type === 'income'
          ? acc + curr.amount
          : acc - curr.amount;
      }, 0);
  };

  const getIncome = () => {
    return transactions
      .filter(t => t.type === 'income' && !t.accountId)
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const getExpense = () => {
    return transactions
      .filter(t => t.type === 'expense' && !t.accountId)
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  return {
    transactions,
    loading,
    error,
    addTransaction: addMutation.mutateAsync,
    updateTransaction: (id, data) => updateMutation.mutateAsync({ id, data }),
    deleteTransaction: deleteMutation.mutateAsync,
    getBalance,
    getIncome,
    getExpense,
    refreshTransactions,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
