import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('needyConnectToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
