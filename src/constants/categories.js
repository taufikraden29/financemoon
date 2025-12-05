import {
    Briefcase,
    Car,
    Coffee,
    DollarSign,
    Gamepad2,
    Gift,
    Home,
    ShoppingCart,
    TrendingUp
} from 'lucide-react';

export const EXPENSE_CATEGORIES = [
    { value: 'Food', label: 'Food', icon: Coffee },
    { value: 'Transport', label: 'Transport', icon: Car },
    { value: 'Shopping', label: 'Shopping', icon: ShoppingCart },
    { value: 'Bills', label: 'Bills', icon: Home },
    { value: 'Entertainment', label: 'Entertainment', icon: Gamepad2 },
    { value: 'General', label: 'General', icon: DollarSign },
];

export const INCOME_CATEGORIES = [
    { value: 'Salary', label: 'Salary', icon: Briefcase },
    { value: 'Freelance', label: 'Freelance', icon: TrendingUp },
    { value: 'Gift', label: 'Gift', icon: Gift },
    { value: 'Other', label: 'Other', icon: DollarSign },
];

export const getCategoryIcon = (category) => {
    const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
    const found = allCategories.find(cat => cat.value === category);
    return found ? found.icon : DollarSign;
};

export const getCategoriesByType = (type) => {
    return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};
