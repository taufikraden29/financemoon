import { endOfDay, endOfMonth, endOfWeek, isWithinInterval, parseISO, startOfDay, startOfMonth, startOfWeek, subMonths } from 'date-fns';

export const getToday = () => ({
    start: startOfDay(new Date()),
    end: endOfDay(new Date())
});

export const getThisWeek = () => ({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
});

export const getThisMonth = () => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
});

export const getLastMonth = () => {
    const lastMonth = subMonths(new Date(), 1);
    return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth)
    };
};

export const isInDateRange = (dateString, startDate, endDate) => {
    if (!startDate || !endDate) return true;

    try {
        const date = parseISO(dateString);
        return isWithinInterval(date, { start: startDate, end: endDate });
    } catch {
        return false;
    }
};

export const DATE_FILTERS = {
    ALL: 'all',
    TODAY: 'today',
    THIS_WEEK: 'this_week',
    THIS_MONTH: 'this_month',
    LAST_MONTH: 'last_month',
    CUSTOM: 'custom'
};

export const getDateRangeByFilter = (filter) => {
    switch (filter) {
        case DATE_FILTERS.TODAY:
            return getToday();
        case DATE_FILTERS.THIS_WEEK:
            return getThisWeek();
        case DATE_FILTERS.THIS_MONTH:
            return getThisMonth();
        case DATE_FILTERS.LAST_MONTH:
            return getLastMonth();
        default:
            return null;
    }
};
