import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in
    useEffect(() => {
        const authStatus = localStorage.getItem('financial_moo_auth');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        // Credentials from env or fallback
        const envUsername = import.meta.env.VITE_NAME || 'dbraden26';
        const envPassword = import.meta.env.VITE_KEY || 'raden@boss';

        const inputUsername = username.trim();
        const inputPassword = password.trim();

        if (inputUsername === envUsername && inputPassword === envPassword) {
            setIsAuthenticated(true);
            localStorage.setItem('financial_moo_auth', 'true');
            return { success: true };
        }
        return { success: false, error: 'Invalid username or password' };
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('financial_moo_auth');
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            loading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
