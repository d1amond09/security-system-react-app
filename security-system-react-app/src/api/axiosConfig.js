import axios from 'axios';

export const USER_API_URL = 'https://d1amond-user-management.runasp.net/api';
export const SCANNER_API_URL = 'https://ai-security-system.runasp.net/api/v1';

const axiosInstance = axios.create({
    timeout: 600000 
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 403) {
            window.location.href = '/blocked';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;