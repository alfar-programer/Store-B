import axios from 'axios';

/**
 * Axios instance configured for Google OAuth authentication
 * 
 * Key features:
 * - Credentials enabled for httpOnly cookies
 * - Automatic base URL configuration
 * - Error interceptor for auth failures
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // CRITICAL: Send cookies with every request
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for handling auth errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - redirect to login
            console.log('Authentication failed, redirecting to login...');
            // You can dispatch a logout action here if using Redux/Context
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
