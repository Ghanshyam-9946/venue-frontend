import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // required to send and receive cookies seamlessly
});

// Request interceptor to add token if it exists in cookies/storage
api.interceptors.request.use(
  (config) => {
    // In our case, cookie is mostly used for token but just in case we store it somewhere else too
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

// Response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // clear local storage and probably redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Alternatively handled in context/components
    }
    return Promise.reject(error);
  }
);

export default api;
