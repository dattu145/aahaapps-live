import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user'); // Simple check, ideally verify token with backend
            if (token && storedUser) {
                const storedEmail = localStorage.getItem('email');
                setUser({ username: storedUser, email: storedEmail });
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, username, password) => {
        try {
            const { data } = await api.post('/users/login', { email, username, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', data.username);
            localStorage.setItem('email', data.email);
            setUser({ username: data.username, email: data.email });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('email');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
