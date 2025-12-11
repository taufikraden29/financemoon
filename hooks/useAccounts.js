'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountService } from '@/services/supabase';
import { useToast } from '@/context/ToastContext';

const QUERY_KEY = ['accounts'];

const DEFAULT_ACCOUNTS = [
  { name: 'Cash', type: 'cash', balance: 0, icon: 'Wallet', color: 'green', isActive: true },
  { name: 'Bank Account', type: 'bank', balance: 0, icon: 'Building2', color: 'blue', isActive: true },
  { name: 'E-Wallet', type: 'ewallet', balance: 0, icon: 'Smartphone', color: 'purple', isActive: true },
];

export function useAccounts() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all accounts
  const {
    data: accounts = [],
    isLoading: loading,
    error,
    refetch: refreshAccounts
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const data = await accountService.getAll();
      // If no accounts, create defaults
      if (data.length === 0) {
        for (const defaultAcc of DEFAULT_ACCOUNTS) {
          await accountService.add(defaultAcc);
        }
        return await accountService.getAll();
      }
      return data;
    },
  });

  // Add account mutation
  const addMutation = useMutation({
    mutationFn: async (accountData) => {
      return await accountService.add(accountData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast(`Account "${variables.name}" added`, 'success');
    },
    onError: (err) => {
      console.error('Error adding account:', err);
      showToast('Failed to add account', 'error');
    }
  });

  // Update account mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      return await accountService.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Account updated', 'success');
    },
    onError: (err) => {
      console.error('Error updating account:', err);
      showToast('Failed to update account', 'error');
    }
  });

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await accountService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Account deleted', 'success');
    },
    onError: (err) => {
      console.error('Error deleting account:', err);
      showToast('Failed to delete account', 'error');
    }
  });

  // Update balance mutation
  const updateBalanceMutation = useMutation({
    mutationFn: async ({ accountId, amount, operation }) => {
      return await accountService.updateBalance(accountId, amount, operation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (err) => {
      console.error('Error updating balance:', err);
    }
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async ({ fromId, toId, amount }) => {
      return await accountService.transfer(fromId, toId, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Transfer completed', 'success');
    },
    onError: (err) => {
      console.error('Error transferring:', err);
      showToast('Failed to transfer', 'error');
    }
  });

  // Helper functions
  const getTotalBalance = () => {
    return accounts
      .filter(acc => acc.isActive)
      .reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getAccountById = (id) => {
    return accounts.find(acc => acc.id === id);
  };

  return {
    accounts,
    loading,
    error,
    addAccount: addMutation.mutateAsync,
    updateAccount: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteAccount: deleteMutation.mutateAsync,
    updateBalance: (accountId, amount, operation = 'add') =>
      updateBalanceMutation.mutateAsync({ accountId, amount, operation }),
    transfer: (fromId, toId, amount) =>
      transferMutation.mutateAsync({ fromId, toId, amount }),
    getTotalBalance,
    getAccountById,
    refreshAccounts,
  };
}
