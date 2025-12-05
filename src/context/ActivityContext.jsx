import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ActivityContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useActivity = () => useContext(ActivityContext);

export const ActivityProvider = ({ children }) => {
    const [activities, setActivities] = useState(() => {
        const saved = localStorage.getItem('financial_moo_activities');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('financial_moo_activities', JSON.stringify(activities));
    }, [activities]);

    const logActivity = useCallback((type, action, amount = null, details = {}) => {
        const activity = {
            id: uuidv4(),
            type, // 'transaction', 'debt', 'savings', 'transfer', 'budget'
            action,
            amount,
            details,
            timestamp: new Date().toISOString()
        };

        setActivities(prev => [activity, ...prev]);
    }, []);

    const getFilteredActivities = (filter = 'all') => {
        if (filter === 'all') return activities;
        return activities.filter(a => a.type === filter);
    };

    const searchActivities = (query) => {
        const lowerQuery = query.toLowerCase();
        return activities.filter(a =>
            a.action.toLowerCase().includes(lowerQuery) ||
            JSON.stringify(a.details).toLowerCase().includes(lowerQuery)
        );
    };

    const clearActivities = () => {
        setActivities([]);
    };

    return (
        <ActivityContext.Provider value={{
            activities,
            logActivity,
            getFilteredActivities,
            searchActivities,
            clearActivities
        }}>
            {children}
        </ActivityContext.Provider>
    );
};

ActivityProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
