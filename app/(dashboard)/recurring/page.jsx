'use client';

import clsx from 'clsx';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Calendar, Edit, Pause, Play, Plus, RefreshCw, Trash2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import AddRecurringModal from '@/components/AddRecurringModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useRecurring } from '@/context/RecurringTransactionContext';
import { formatRupiah } from '@/utils/currencyHelpers';

export default function RecurringTransactionsPage() {
  const { recurringTransactions, deleteRecurring, toggleActive, getActiveCount, getMonthlyTotal } = useRecurring();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const activeTransactions = recurringTransactions.filter(r => r.isActive);
  const pausedTransactions = recurringTransactions.filter(r => !r.isActive);

  const handleEdit = (recurring) => {
    setEditingRecurring(recurring);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      deleteRecurring(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handleAddNew = () => {
    setEditingRecurring(null);
    setIsModalOpen(true);
  };

  const getRecurrenceLabel = (recurrence) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    };
    return labels[recurrence] || 'Monthly';
  };

  const getRecurrenceIcon = (recurrence) => {
    const icons = {
      daily: '📅',
      weekly: '📆',
      monthly: '🗓️',
      yearly: '📊'
    };
    return icons[recurrence] || '🗓️';
  };

  const RecurringCard = ({ recurring }) => {
    const nextDate = parseISO(recurring.nextOccurrence);

    return (
      <div className={clsx(
        "bg-slate-900 border rounded-2xl p-6 hover:border-slate-700 transition-all group",
        recurring.isActive ? "border-slate-800" : "border-slate-800/50 opacity-75"
      )}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">{recurring.name}</h3>
              {!recurring.isActive && (
                <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-full">
                  Paused
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className={clsx(
                "px-2 py-1 rounded-lg font-medium",
                recurring.type === 'income'
                  ? "bg-green-900/30 text-green-400"
                  : "bg-red-900/30 text-red-400"
              )}>
                {recurring.type}
              </span>
              <span>•</span>
              <span>{recurring.category}</span>
            </div>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => toggleActive(recurring.id)}
              className={clsx(
                "p-2 rounded-lg transition-all",
                recurring.isActive
                  ? "bg-slate-800 hover:bg-amber-600 text-slate-400 hover:text-white"
                  : "bg-slate-800 hover:bg-green-600 text-slate-400 hover:text-white"
              )}
              title={recurring.isActive ? "Pause" : "Resume"}
            >
              {recurring.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleEdit(recurring)}
              className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(recurring.id)}
              className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Amount</span>
            <span className={clsx(
              "text-xl font-bold",
              recurring.type === 'income' ? "text-green-400" : "text-red-400"
            )}>
              {formatRupiah(recurring.amount)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Recurrence
            </span>
            <span className="text-white font-medium text-sm flex items-center gap-1">
              {getRecurrenceIcon(recurring.recurrence)}
              {getRecurrenceLabel(recurring.recurrence)}
            </span>
          </div>

          {recurring.isActive && (
            <div className="pt-3 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Next occurrence
                </span>
                <div className="text-right">
                  <div className="text-white font-medium text-sm">
                    {format(nextDate, 'MMM dd, yyyy')}
                  </div>
                  <div className="text-slate-500 text-xs">
                    {formatDistanceToNow(nextDate, { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {recurring.accountId && (
            <div className="text-xs text-slate-500">
              Linked to account
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Recurring Transactions</h2>
          <p className="text-slate-400 mt-1">
            Automatic transactions for bills and subscriptions
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Recurring
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <RefreshCw className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Recurring</p>
              <p className="text-2xl font-bold text-white">{getActiveCount()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 border border-red-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Monthly Expenses</p>
              <p className="text-2xl font-bold text-white">{formatRupiah(getMonthlyTotal())}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Recurring</p>
              <p className="text-2xl font-bold text-white">{recurringTransactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Recurring */}
      {activeTransactions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Active ({activeTransactions.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTransactions.map(recurring => (
              <RecurringCard key={recurring.id} recurring={recurring} />
            ))}
          </div>
        </div>
      )}

      {/* Paused Recurring */}
      {pausedTransactions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-500">Paused ({pausedTransactions.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pausedTransactions.map(recurring => (
              <RecurringCard key={recurring.id} recurring={recurring} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recurringTransactions.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex p-4 bg-slate-800 rounded-full mb-4">
            <RefreshCw className="w-12 h-12 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Recurring Transactions Yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Set up automatic transactions for your regular bills, subscriptions, and income sources.
          </p>
          <button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Your First Recurring
          </button>
        </div>
      )}

      <AddRecurringModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecurring(null);
        }}
        editRecurring={editingRecurring}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        title="Delete Recurring Transaction"
        message="Are you sure? Future transactions won't be generated automatically."
      />
    </div>
  );
}
