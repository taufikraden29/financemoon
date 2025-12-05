import { v4 as uuidv4 } from 'uuid';

// Calculate per installment amount
export const calculateInstallment = (total, count) => {
    if (!total || !count || count <= 0) return 0;
    return total / count;
};

// Calculate progress percentage
export const calculateProgress = (payments) => {
    if (!payments || payments.length === 0) return 0;
    const paid = payments.filter(p => p.paid).length;
    return (paid / payments.length) * 100;
};

// Get remaining balance
export const getRemainingBalance = (totalAmount, payments) => {
    if (!payments) return totalAmount;
    const paidAmount = payments
        .filter(p => p.paid)
        .reduce((sum, p) => sum + p.amount, 0);
    return totalAmount - paidAmount;
};

// Get total paid amount
export const getTotalPaid = (payments) => {
    if (!payments) return 0;
    return payments
        .filter(p => p.paid)
        .reduce((sum, p) => sum + p.amount, 0);
};

// Get paid count
export const getPaidCount = (payments) => {
    if (!payments) return 0;
    return payments.filter(p => p.paid).length;
};

// Generate payment schedule
export const generatePaymentSchedule = (totalAmount, installments) => {
    const perInstallment = calculateInstallment(totalAmount, installments);
    return Array.from({ length: installments }, (_, i) => ({
        id: uuidv4(),
        installmentNumber: i + 1,
        amount: perInstallment,
        paid: false,
        paidDate: null
    }));
};

// Validate debt data
export const validateDebt = (data) => {
    const errors = {};

    if (!data.name || data.name.trim() === '') {
        errors.name = 'Debt name is required';
    }

    if (!data.totalAmount || parseFloat(data.totalAmount) <= 0) {
        errors.totalAmount = 'Total amount must be greater than 0';
    }

    if (!data.installments || parseInt(data.installments) < 1) {
        errors.installments = 'Installments must be at least 1';
    }

    if (parseInt(data.installments) > 60) {
        errors.installments = 'Maximum 60 installments allowed';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};
