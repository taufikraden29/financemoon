'use client';

import { CreditCard, Plus, Send } from 'lucide-react';
import { useState } from 'react';
import AddDebtModal from '@/components/AddDebtModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import DebtCard from '@/components/DebtCard';
import DebtDetailModal from '@/components/DebtDetailModal';
import EditDebtModal from '@/components/EditDebtModal';
import { useDebt } from '@/context/DebtContext';
import { useToast } from '@/context/ToastContext';
import { isTelegramConfigured, sendTestMessage } from '@/services/telegramService';

export default function DebtsPage() {
  const { debts, deleteDebt } = useDebt();
  const { showToast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [testingTelegram, setTestingTelegram] = useState(false);

  const handleTestTelegram = async () => {
    if (!isTelegramConfigured()) {
      showToast('Telegram not configured. Check .env file', 'error');
      return;
    }

    setTestingTelegram(true);
    const success = await sendTestMessage();
    setTestingTelegram(false);

    if (success) {
      showToast('✅ Test message sent! Check your Telegram', 'success');
    } else {
      showToast('❌ Failed to send message. Check console', 'error');
    }
  };

  const handleViewDetails = (debt) => {
    setSelectedDebt(debt);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (debt) => {
    setEditingDebt(debt);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.id) {
      deleteDebt(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, id: null });
  };

  // Sort active debts by next unpaid payment due date (earliest first)
  const activeDebts = debts
    .filter(d => d.status === 'active')
    .sort((a, b) => {
      const aNextPayment = a.payments?.find(p => !p.paid);
      const bNextPayment = b.payments?.find(p => !p.paid);

      if (!aNextPayment?.dueDate) return 1;
      if (!bNextPayment?.dueDate) return -1;

      return new Date(aNextPayment.dueDate) - new Date(bNextPayment.dueDate);
    });

  const completedDebts = debts.filter(d => d.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Debts & Installments</h2>
          <p className="text-slate-400 mt-1">
            Track your debts and payment progress
            {debts.length > 0 && (
              <span className="ml-1">
                ({activeDebts.length} active, {completedDebts.length} completed)
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-95"
            title="Test Telegram bot connection"
          >
            <Send className="w-5 h-5" />
            {testingTelegram ? 'Testing...' : 'Test Telegram'}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Debt
          </button>
        </div>
      </div>

      {debts.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex p-4 bg-slate-800 rounded-full mb-4">
            <CreditCard className="w-12 h-12 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Debts Yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Start tracking your debts and installment payments. Add your first debt to get started.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Your First Debt
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Debts */}
          {activeDebts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Active Debts ({activeDebts.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeDebts.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Debts */}
          {completedDebts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>Completed Debts ({completedDebts.length})</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                  All Paid
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedDebts.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddDebtModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <DebtDetailModal
        debt={selectedDebt}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <EditDebtModal
        debt={editingDebt}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Debt"
        message="Are you sure you want to delete this debt? This action cannot be undone."
      />
    </div>
  );
}
