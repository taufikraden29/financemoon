import clsx from 'clsx';
import { Calculator, Check, Copy, Delete, X } from 'lucide-react';
import { useState } from 'react';

const FloatingCalculator = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState(null);
    const [operation, setOperation] = useState(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [copied, setCopied] = useState(false);

    const inputDigit = (digit) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const inputDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
            return;
        }
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const clear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
    };

    const deleteDigit = () => {
        if (display.length === 1 || (display.length === 2 && display[0] === '-')) {
            setDisplay('0');
        } else {
            setDisplay(display.slice(0, -1));
        }
    };

    const performOperation = (nextOperation) => {
        const inputValue = parseFloat(display);

        if (previousValue === null) {
            setPreviousValue(inputValue);
        } else if (operation) {
            const currentValue = previousValue || 0;
            let result;

            switch (operation) {
                case '+':
                    result = currentValue + inputValue;
                    break;
                case '-':
                    result = currentValue - inputValue;
                    break;
                case '×':
                    result = currentValue * inputValue;
                    break;
                case '÷':
                    result = inputValue !== 0 ? currentValue / inputValue : 0;
                    break;
                default:
                    result = inputValue;
            }

            setDisplay(String(result));
            setPreviousValue(result);
        }

        setWaitingForOperand(true);
        setOperation(nextOperation);
    };

    const calculate = () => {
        if (!operation || previousValue === null) return;

        const inputValue = parseFloat(display);
        let result;

        switch (operation) {
            case '+':
                result = previousValue + inputValue;
                break;
            case '-':
                result = previousValue - inputValue;
                break;
            case '×':
                result = previousValue * inputValue;
                break;
            case '÷':
                result = inputValue !== 0 ? previousValue / inputValue : 0;
                break;
            default:
                result = inputValue;
        }

        setDisplay(String(result));
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(true);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(display);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatDisplay = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return value;

        // Format with thousand separators for display
        if (value.includes('.') && value.endsWith('.')) {
            return num.toLocaleString('id-ID') + '.';
        }
        if (value.includes('.')) {
            const [integer, decimal] = value.split('.');
            return parseFloat(integer).toLocaleString('id-ID') + '.' + decimal;
        }
        return num.toLocaleString('id-ID');
    };

    const buttons = [
        { label: 'C', action: clear, className: 'bg-red-500/20 text-red-400 hover:bg-red-500/30' },
        { label: <Delete className="w-5 h-5" />, action: deleteDigit, className: 'bg-slate-700 hover:bg-slate-600' },
        { label: '÷', action: () => performOperation('÷'), className: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' },
        { label: '×', action: () => performOperation('×'), className: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' },
        { label: '7', action: () => inputDigit('7') },
        { label: '8', action: () => inputDigit('8') },
        { label: '9', action: () => inputDigit('9') },
        { label: '-', action: () => performOperation('-'), className: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' },
        { label: '4', action: () => inputDigit('4') },
        { label: '5', action: () => inputDigit('5') },
        { label: '6', action: () => inputDigit('6') },
        { label: '+', action: () => performOperation('+'), className: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' },
        { label: '1', action: () => inputDigit('1') },
        { label: '2', action: () => inputDigit('2') },
        { label: '3', action: () => inputDigit('3') },
        { label: '=', action: calculate, className: 'bg-emerald-500 text-white hover:bg-emerald-600 row-span-2' },
        { label: '0', action: () => inputDigit('0'), className: 'col-span-2' },
        { label: '.', action: inputDecimal },
    ];

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={clsx(
                    "fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full",
                    "bg-gradient-to-br from-emerald-500 to-emerald-600",
                    "shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50",
                    "flex items-center justify-center",
                    "transition-all duration-300 hover:scale-110",
                    "md:bottom-8 md:right-8",
                    isOpen && "opacity-0 pointer-events-none"
                )}
            >
                <Calculator className="w-6 h-6 text-white" />
            </button>

            {/* Calculator Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Calculator */}
                    <div className="relative w-full max-w-xs bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <div className="flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-emerald-400" />
                                <span className="font-semibold text-white">Calculator</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Display */}
                        <div className="p-4 bg-slate-900/50">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-500">
                                    {previousValue !== null && operation && `${previousValue.toLocaleString('id-ID')} ${operation}`}
                                </span>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Copy result"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-slate-500" />
                                    )}
                                </button>
                            </div>
                            <div className="text-right text-3xl font-bold text-white truncate">
                                {formatDisplay(display)}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-4 gap-1 p-2">
                            {buttons.map((btn, index) => (
                                <button
                                    key={index}
                                    onClick={btn.action}
                                    className={clsx(
                                        "p-4 rounded-xl text-lg font-semibold transition-all duration-150",
                                        "active:scale-95",
                                        btn.className || "bg-slate-700/50 text-white hover:bg-slate-700"
                                    )}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Animation styles */}
            <style>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.2s ease-out;
                }
            `}</style>
        </>
    );
};

export default FloatingCalculator;
