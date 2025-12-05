import clsx from 'clsx';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Edit, Plus, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import AddBudgetModal from '../components/AddBudgetModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useBudget } from '../context/BudgetContext';
import { calculatePercentage, formatRupiah } from '../utils/currencyHelpers';

const Budgets = () => {
    const { budgets, deleteBudget, getCurrentMonthBudgets } = useBudget();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

    const currentMonthBudgets = getCurrentMonthBudgets();

    const handleEdit = (budget) => {
        setEditingBudget(budget);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteConfirm({ isOpen: true, id });
    };

    const confirmDelete = () => {
        if (deleteConfirm.id) {
            deleteBudget(deleteConfirm.id);
        }
        setDeleteConfirm({ isOpen: false, id: null });
    };

    const handleAddNew = () => {
        setEditingBudget(null);
        setIsModalOpen(true);
    };

    const getStatusInfo = (budget) => {
        const percentage = calculatePercentage(budget.spent, budget.limit);

        if (percentage >= 100) {
            return {
                status: 'exceeded',
                color: 'red',
                icon: AlertCircle,
                message: 'Budget exceeded!'
            };
        } else if (percentage >= budget.alertThreshold) {
            return {
                status: 'warning',
                color: 'amber',
                icon: TrendingUp,
                message: 'Approaching limit'
            };
        } else {
            return {
                status: 'safe',
                color: 'green',
                icon: CheckCircle,
                message: 'On track'
            };
        }
    };

    const statusColors = {
        safe: {
            bg: 'from-green-600 to-emerald-600',
            border: 'border-green-700',
            text: 'text-green-400',
            progressBg: 'bg-green-500'
        },
        warning: {
            bg: 'from-amber-600 to-yellow-600',
            border: 'border-amber-700',
            text: 'text-amber-400',
            progressBg: 'bg-amber-500'
        },
        exceeded: {
            bg: 'from-red-600 to-rose-600',
            border: 'border-red-700',
            text: 'text-red-400',
            progressBg: 'bg-red-500'
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Budget Management</h2>
                    <p className="text-slate-400 mt-1">
                        Track your monthly spending limits
                        {currentMonthBudgets.length > 0 && (
                            <span className="ml-1">({currentMonthBudgets.length} active budgets)</span>
                        )}
                    </p>
                </div>

                <button
                    onClick={handleAddNew}
                    className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Set Budget
                </button>
            </div>

            {currentMonthBudgets.length === 0 ? (
                <div className="text-center py-16">
                    <div className="inline-flex p-4 bg-slate-800 rounded-full mb-4">
                        <Wallet className="w-12 h-12 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Budgets Set</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Set monthly budgets for different categories to track your spending and stay on target.
                    </p>
                    <button
                        onClick={handleAddNew}
                        className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Set Your First Budget
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentMonthBudgets.map((budget) => {
                        const statusInfo = getStatusInfo(budget);
                        const colors = statusColors[statusInfo.status];
                        const StatusIcon = statusInfo.icon;
                        const percentage = Math.min(calculatePercentage(budget.spent, budget.limit), 100);
                        const remaining = budget.limit - budget.spent;

                        return (
                            <div
                                key={budget.id}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 bg-gradient-to-br ${colors.bg} rounded-xl`}>
                                            <StatusIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{budget.category}</h3>
                                            <p className={clsx("text-xs font-medium", colors.text)}>
                                                {statusInfo.message}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(budget)}
                                            className="p-2 bg-slate-800 hover:bg-amber-600 text-slate-400 hover:text-white rounded-lg transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(budget.id)}
                                            className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Spent</span>
                                        <span className={clsx("font-bold", colors.text)}>
                                            {formatRupiah(budget.spent)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Limit</span>
                                        <span className="font-semibold text-white">
                                            {formatRupiah(budget.limit)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Remaining</span>
                                        <span className={clsx("font-semibold", remaining >= 0 ? "text-green-400" : "text-red-400")}>
                                            {formatRupiah(remaining)}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Progress</span>
                                        <span>{percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={clsx("h-full rounded-full transition-all", colors.progressBg)}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <p className="text-xs text-slate-500">
                                        Period: {format(new Date(budget.month + '-01'), 'MMMM yyyy')}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AddBudgetModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBudget(null);
                }}
                editBudget={editingBudget}
            />

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
                title="Delete Budget"
                message="Are you sure you want to delete this budget? This action cannot be undone."
            />
        </div>
    );
};

export default Budgets;
