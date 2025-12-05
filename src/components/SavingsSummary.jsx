import { Plus, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSavings } from '../context/SavingsContext';

const SavingsSummary = () => {
    const { savings, getTotalSaved } = useSavings();
    const navigate = useNavigate();

    const activeSavings = savings.filter(s => s.status === 'active');
    const completedCount = savings.filter(s => s.status === 'completed').length;

    if (savings.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 hover:border-slate-700 transition-all h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Target className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-white">Savings</h3>
                    </div>
                </div>
                <div className="text-center py-6 md:py-8 flex-1 flex flex-col items-center justify-center">
                    <div className="inline-flex p-2 md:p-3 bg-slate-800 rounded-full mb-2 md:mb-3">
                        <Target className="w-6 h-6 md:w-8 md:h-8 text-slate-600" />
                    </div>
                    <h4 className="text-sm font-medium text-white mb-1">No Savings Yet</h4>
                    <p className="text-xs text-slate-400 mb-2 md:mb-3">
                        Set your goals
                    </p>
                    <button
                        onClick={() => navigate('/budgets')}
                        className="text-xs md:text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                        Add Goal
                    </button>
                </div>
            </div>
        );
    }

    const totalTarget = activeSavings.reduce((sum, s) => sum + s.targetAmount, 0);
    const totalProgress = totalTarget > 0 ? (getTotalSaved() / totalTarget) * 100 : 0;

    return (
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-800 rounded-2xl p-4 md:p-6 relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 opacity-10">
                <Target className="w-24 h-24 md:w-32 md:h-32 text-purple-500" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Target className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base md:text-lg font-bold text-white">Savings Goals</h3>
                        <p className="text-xs md:text-sm text-purple-200 truncate">
                            {activeSavings.length} active {completedCount > 0 && `· ${completedCount} completed`}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-4">
                    <div className="bg-black/20 rounded-lg p-2 md:p-3">
                        <p className="text-xs text-purple-200 mb-1">Total Saved</p>
                        <p className="text-sm md:text-lg font-bold text-white truncate">
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                notation: 'compact',
                                compactDisplay: 'short'
                            }).format(getTotalSaved())}
                        </p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2 md:p-3">
                        <p className="text-xs text-purple-200 mb-1">Target</p>
                        <p className="text-sm md:text-lg font-bold text-purple-300 truncate">
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                notation: 'compact',
                                compactDisplay: 'short'
                            }).format(totalTarget)}
                        </p>
                    </div>
                </div>

                {activeSavings.length > 0 && (
                    <div className="flex-1">
                        <div className="flex justify-between text-xs text-purple-200 mb-2">
                            <span>Overall Progress</span>
                            <span>{totalProgress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
                                style={{ width: `${Math.min(totalProgress, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                <button
                    onClick={() => navigate('/budgets')}
                    className="w-full mt-3 md:mt-4 text-xs md:text-sm text-purple-200 hover:text-white transition-colors py-2 rounded-lg hover:bg-black/20"
                >
                    Manage Savings →
                </button>
            </div>
        </div>
    );
};

export default SavingsSummary;
