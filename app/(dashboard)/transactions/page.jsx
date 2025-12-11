'use client';

import clsx from 'clsx';
import { format } from 'date-fns';
import { Download, Pencil, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AddTransactionModal from '@/components/AddTransactionModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import DateRangeFilter from '@/components/DateRangeFilter';
import { useAccounts } from '@/hooks/useAccounts';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/context/ToastContext';
import { DATE_FILTERS, isInDateRange } from '@/utils/dateHelpers';
import { downloadCSV, exportToCSV, generateFilename } from '@/utils/exportHelpers';

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useTransactions();
  const { updateBalance } = useAccounts();
  const { updateSpent } = useBudgets();
  const { showToast } = useToast();
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editTransaction, setEditTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS.ALL);
  const [dateRange, setDateRange] = useState(null);

  // Sort by date descending (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Apply all filters
  const filteredTransactions = sortedTransactions
    .filter(t => filterType === 'all' ? true : t.type === filterType)
    .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(t => {
      if (!dateRange) return true;
      return isInDateRange(t.date, dateRange.start, dateRange.end);
    });

  const handleEdit = (transaction) => {
    setEditTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditTransaction(null);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.id) {
      // Find transaction for rollback
      const transaction = transactions.find(t => t.id === deleteConfirm.id);

      if (transaction) {
        // Rollback account balance if linked
        if (transaction.accountId) {
          if (transaction.type === 'income') {
            updateBalance(transaction.accountId, transaction.amount, 'subtract');
          } else {
            updateBalance(transaction.accountId, transaction.amount, 'add');
          }
        }

        // Rollback budget spending if expense
        if (transaction.type === 'expense') {
          updateSpent(transaction.category, -transaction.amount);
        }
      }

      deleteTransaction(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handleDateFilterChange = (filter, range) => {
    setDateFilter(filter);
    setDateRange(range);
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      showToast('No transactions to export', 'warning');
      return;
    }

    const csvContent = exportToCSV(filteredTransactions);
    if (csvContent) {
      downloadCSV(csvContent, generateFilename());
      showToast(`Exported ${filteredTransactions.length} transactions`, 'success');
    } else {
      showToast('Export failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Transactions</h2>
          <p className="text-slate-400">
            Manage and view your history.
            {filteredTransactions.length > 0 && (
              <span className="ml-1">
                ({filteredTransactions.length}
                {filteredTransactions.length !== transactions.length && ` of ${transactions.length}`} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'})
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        onFilterChange={handleDateFilterChange}
        activeFilter={dateFilter}
      />

      {/* Type and Search Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {['all', 'income', 'expense'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                filterType === type
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-slate-500">No transactions found.</p>
                      {searchTerm || dateFilter !== DATE_FILTERS.ALL ? (
                        <p className="text-sm text-slate-600">Try adjusting your filters.</p>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {format(new Date(t.date), 'dd MMM yyyy')}
                    </td>
                    <td className="p-4 text-white font-medium">
                      {t.description}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {t.category}
                      </span>
                    </td>
                    <td className={clsx("p-4 font-bold whitespace-nowrap", t.type === 'income' ? 'text-green-400' : 'text-slate-200')}>
                      {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(t.amount)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="Edit Transaction"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(t.id)}
                          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editTransaction={editTransaction}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
}
