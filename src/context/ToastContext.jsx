import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        const toast = { id, message, type };

        setToasts(prev => [...prev, toast]);

        // Auto dismiss after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

ToastProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
