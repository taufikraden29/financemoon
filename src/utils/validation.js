export const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);

    if (!amount || amount === '') {
        return { valid: false, error: 'Amount is required' };
    }

    if (isNaN(numAmount)) {
        return { valid: false, error: 'Amount must be a valid number' };
    }

    if (numAmount <= 0) {
        return { valid: false, error: 'Amount must be greater than 0' };
    }

    return { valid: true, error: null };
};

export const validateDescription = (description) => {
    if (!description || description.trim() === '') {
        return { valid: false, error: 'Description is required' };
    }

    if (description.trim().length < 3) {
        return { valid: false, error: 'Description must be at least 3 characters' };
    }

    return { valid: true, error: null };
};

export const validateTransaction = (data) => {
    const errors = {};

    const amountValidation = validateAmount(data.amount);
    if (!amountValidation.valid) {
        errors.amount = amountValidation.error;
    }

    const descriptionValidation = validateDescription(data.description);
    if (!descriptionValidation.valid) {
        errors.description = descriptionValidation.error;
    }

    if (!data.type || !['income', 'expense'].includes(data.type)) {
        errors.type = 'Invalid transaction type';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};
