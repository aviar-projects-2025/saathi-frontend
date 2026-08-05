import axios from 'axios';
import API_CONFIG from './config.js'; 

const api = axios.create({
    baseURL: API_CONFIG.baseURL,
    headers: API_CONFIG.headers,
    timeout: API_CONFIG.timeout,
});
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            console.error('No response from server:', error.request);
        } else {
            console.error('Request error:', error.message);
        }
        return Promise.reject(error);
    }
);

const authApi = {
    forgotPassword: (email) => {
        return api.post('/auth/forgot-password', { email });
    },
    verifyOTP: (email, otp) => {
        return api.post('/auth/verify-otp', { email, otp });
    },
    resetPassword: (email, token, newPassword) => {
        return api.post('/auth/reset-password', { email, token, newPassword });
    },
    resendOTP: (email) => {
        return api.post('/auth/resend-otp', { email });
    },
    login: (email, password) => {
        return api.post('/auth/login', { email, password });
    },
    register: (userData) => {
        return api.post('/auth/register', userData);
    },
};

export default authApi;