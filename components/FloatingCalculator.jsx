'use client';

import clsx from 'clsx';
import { Calculator, Check, Clock, Copy, Delete, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const HISTORY_KEY = 'calculator_history';
const MAX_HISTORY = 20;

const FloatingCalculator = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState(null);
    const [operation, setOperation] = useState(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [copiedHistoryId, setCopiedHistoryId] = useState(null);

    // Load history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(HISTORY_KEY);
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch {
                setHistory([]);
            }
        }
    }, []);

    // Save history to localStorage
    const saveHistory = (newHistory) => {
        setHistory(newHistory);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    };

    // Add to history
    const addToHistory = (expression, result) => {
        const newEntry = {
            id: Date.now(),
            expression,
            result,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        const newHistory = [newEntry, ...history].slice(0, MAX_HISTORY);
        saveHistory(newHistory);
    };

    // Clear history
    const clearHistory = () => {
        saveHistory([]);
    };

    // Copy history item
    const copyHistoryItem = async (item) => {
        try {
            await navigator.clipboard.writeText(item.result);
            setCopiedHistoryId(item.id);
            setTimeout(() => setCopiedHistoryId(null), 1500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

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

        // Add to history
        const expression = `${formatNumber(previousValue)} ${operation} ${formatNumber(inputValue)}`;
        addToHistory(expression, String(result));

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

    const formatNumber = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return num.toLocaleString('id-ID');
    };

    const formatDisplay = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return value;

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
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className={clsx(
                                        "p-1.5 rounded-lg transition-colors",
                                        showHistory ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-slate-700 text-slate-400"
                                    )}
                                    title="History"
                                >
                                    <Clock className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {showHistory ? (
                            /* History Panel */
                            <div className="max-h-80 overflow-y-auto">
                                <div className="flex items-center justify-between p-3 border-b border-slate-700">
                                    <span className="text-sm text-slate-400">History ({history.length})</span>
                                    {history.length > 0 && (
                                        <button
                                            onClick={clearHistory}
                                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Clear
                                        </button>
                                    )}
                                </div>
                                {history.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">
                                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No history yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-700/50">
                                        {history.map((item) => (
                                            <div
                                                key={item.id}
                                                className="p-3 hover:bg-slate-700/30 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-slate-500 truncate">
                                                            {item.expression}
                                                        </p>
                                                        <p className="text-lg font-bold text-white truncate">
                                                            = {formatNumber(item.result)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-600">
                                                            {item.timestamp}
                                                        </span>
                                                        <button
                                                            onClick={() => copyHistoryItem(item)}
                                                            className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
                                                            title="Copy result"
                                                        >
                                                            {copiedHistoryId === item.id ? (
                                                                <Check className="w-4 h-4 text-emerald-400" />
                                                            ) : (
                                                                <Copy className="w-4 h-4 text-slate-500" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
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

