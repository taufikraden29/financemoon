import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { activityService } from '../services/supabase';

const ActivityContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useActivity = () => useContext(ActivityContext);

export const ActivityProvider = ({ children }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch activities on mount
    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const data = await activityService.getAll();
            setActivities(data);
        } catch (err) {
            console.error('Error loading activities:', err);
            setError(err.message);
            // Fallback to localStorage
            const saved = localStorage.getItem('financial_moo_activities');
            if (saved) setActivities(JSON.parse(saved));
        } finally {
            setLoading(false);
        }
    };

    const logActivity = useCallback(async (type, action, amount = null, details = {}) => {
        try {
            const activity = await activityService.log(type, action, amount, details);
            setActivities(prev => [activity, ...prev]);
        } catch (err) {
            console.error('Error logging activity:', err);
            // Don't show error to user for activity logging failures
        }
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

    const clearActivities = async () => {
        try {
            await activityService.clearAll();
            setActivities([]);
        } catch (err) {
            console.error('Error clearing activities:', err);
        }
    };

    return (
        <ActivityContext.Provider value={{
            activities,
            loading,
            error,
            logActivity,
            getFilteredActivities,
            searchActivities,
            clearActivities,
            refreshActivities: loadActivities
        }}>
            {children}
        </ActivityContext.Provider>
    );
};

ActivityProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
