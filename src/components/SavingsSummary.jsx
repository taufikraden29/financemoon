import { Target } from 'lucide-react';
import { useSavings } from '../context/SavingsContext';

const SavingsSummary = () => {
    const { savings, getTotalSaved } = useSavings();

    const activeSavings = savings.filter(s => s.status === 'active');
    const completedCount = savings.filter(s => s.status === 'completed').length;

    if (savings.length === 0) return null;

    const totalTarget = activeSavings.reduce((sum, s) => sum + s.targetAmount, 0);
    const totalProgress = totalTarget > 0 ? (getTotalSaved() / totalTarget) * 100 : 0;

    return (
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
                <Target className="w-32 h-32 text-purple-500" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Savings Goals</h3>
                        <p className="text-sm text-purple-200">
                            {activeSavings.length} active {completedCount > 0 && `· ${completedCount} completed`}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-xs text-purple-200 mb-1">Total Saved</p>
                        <p className="text-lg font-bold text-white">
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                            }).format(getTotalSaved())}
                        </p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-xs text-purple-200 mb-1">Target</p>
                        <p className="text-lg font-bold text-purple-300">
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                            }).format(totalTarget)}
                        </p>
                    </div>
                </div>

                {activeSavings.length > 0 && (
                    <div>
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
            </div>
        </div>
    );
};

export default SavingsSummary;
