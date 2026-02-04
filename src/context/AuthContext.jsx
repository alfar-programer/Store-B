import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// Configure axios for cookie-based auth
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            // Verification can be done via a /me or /verify-session endpoint
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password
            });

            if (response.data.success) {
                const { user, role } = response.data;
                // Note: Token is now handled via httpOnly cookies
                localStorage.setItem('user', JSON.stringify({ ...user, role }));
                setUser({ ...user, role });
                return { success: true, role };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error('Login error:', error);

            // Extract field-specific errors from validation
            const fieldErrors = {};
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                error.response.data.errors.forEach(err => {
                    if (err.path) {
                        fieldErrors[err.path] = err.msg;
                    }
                });
            }

            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
                fieldErrors,
                requiresVerification: error.response?.data?.requiresVerification,
                email: error.response?.data?.email
            };
        }
    };

    const register = async (name, email, password, phone) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                name,
                email,
                password,
                phone
            });
            console.log('Registration response:', response.data);
            return {
                success: true,
                email: response.data.email,
                message: response.data.message,
                requiresVerification: response.data.requiresVerification
            };
        } catch (error) {
            console.error('Registration error:', error);

            // Extract field-specific errors from validation
            const fieldErrors = {};
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                error.response.data.errors.forEach(err => {
                    if (err.path) {
                        fieldErrors[err.path] = err.msg;
                    }
                });
            }

            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
                fieldErrors
            };
        }
    };

    const verifyEmail = async (email, code) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
                email,
                code
            });
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            console.error('Verification error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Verification failed',
                expired: error.response?.data?.expired || false
            };
        }
    };

    const resendVerification = async (email) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/resend-verification`, {
                email
            });
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            console.error('Resend verification error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to resend verification code'
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/auth/logout`);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const updateUser = (updatedUserData) => {
        const updatedUser = { ...user, ...updatedUserData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    /**
     * Login with Google credential token
     * Stateless OAuth - no redirects, just popup
     * @param {string} credential - ID token from Google Sign-In
     */
    const loginWithGoogle = async (credential) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/google/login`, {
                credential
            });

            if (response.data.success) {
                const { user } = response.data;
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                return { success: true, user };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error('Google login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Google login failed'
            };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            register,
            verifyEmail,
            resendVerification,
            updateUser,
            loginWithGoogle, // Add Google OAuth login
            loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
