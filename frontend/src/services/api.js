import axios from 'axios';

const TOKEN_KEY = 'auctionary_token';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((request) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        request.headers['X-Authorization'] = token;
    }
    return request;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('auctionary_user');
            window.dispatchEvent(new CustomEvent('auctionary:unauthorised'));
        }
        return Promise.reject(error);
    }
);

export const apiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => (
    error.response?.data?.error_message
    || error.message
    || fallback
);

export { TOKEN_KEY };
export default api;
