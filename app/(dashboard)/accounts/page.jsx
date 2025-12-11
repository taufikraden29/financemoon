'use client';

import clsx from 'clsx';
import { ArrowRightLeft, Building2, Edit, Plus, Smartphone, Trash2, Wallet } from 'lucide-react';
import { useState } from 'react';
import AddAccountModal from '@/components/AddAccountModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import TransferModal from '@/components/TransferModal';
import { useAccounts } from '@/hooks/useAccounts';

export default function AccountsPage() {
  const { accounts, deleteAccount } = useAccounts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const iconMap = {
    Wallet: Wallet,
    Building2: Building2,
    Smartphone: Smartphone
  };

  const colorMap = {
    green: { bg: 'from-green-600 to-emerald-600', border: 'border-green-700', text: 'text-green-400' },
    blue: { bg: 'from-blue-600 to-cyan-600', border: 'border-blue-700', text: 'text-blue-400' },
    purple: { bg: 'from-purple-600 to-pink-600', border: 'border-purple-700', text: 'text-purple-400' }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      deleteAccount(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handleAddNew = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">My Accounts</h2>
          <p className="text-slate-400 mt-1">
            Manage your balance sources
            {accounts.length > 0 && (
              <span className="ml-1">({accounts.length} accounts)</span>
            )}
          </p>
        </div>

        <div className="flex gap-3">
          {accounts.length >= 2 && (
            <button
              onClick={() => setIsTransferOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20 active:scale-95"
            >
              <ArrowRightLeft className="w-5 h-5" />
              Transfer
            </button>
          )}
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Account
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex p-4 bg-slate-800 rounded-full mb-4">
            <Wallet className="w-12 h-12 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Accounts Yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Add your first account to start tracking your balance from different sources.
          </p>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const Icon = iconMap[account.icon] || Wallet;
            const colors = colorMap[account.color] || colorMap.blue;

            return (
              <div
                key={account.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${colors.bg} rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(account)}
                      className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{account.name}</h3>
                <p className="text-sm text-slate-400 mb-4 capitalize">{account.type}</p>

                <div className={clsx(
                  "p-4 rounded-xl border",
                  `bg-gradient-to-br ${colors.bg} bg-opacity-10 ${colors.border}`
                )}>
                  <p className="text-xs text-slate-400 mb-1">Balance</p>
                  <p className={clsx("text-2xl font-bold", colors.text)}>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(account.balance)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddAccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        editAccount={editingAccount}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        title="Delete Account"
        message="Are you sure you want to delete this account? This action cannot be undone."
      />
    </div>
  );
}
