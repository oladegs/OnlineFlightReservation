import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 15000,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      window.dispatchEvent(
        new CustomEvent('appointly:auth:expired', {
          detail: { message: 'Your session expired. Please sign in again.' },
        }),
      );
    }
    return Promise.reject(error);
  },
);

export default client;


