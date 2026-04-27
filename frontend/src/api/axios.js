// यह file backend se baat karne ka setup karti hai
import axios from 'axios';

// Axios instance banao - base URL aur timeout ke saath
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 20000, // 20 seconds wait karo (free hosting slow hota hai)
});

// Request interceptor: har request ke saath token attach karo
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('token');
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: errors handle karo
API.interceptors.response.use(
  (res) => res, // success: waise hi return karo

  async (error) => {
    const config = error.config;

    // 401 = token expire ho gaya, logout karo
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

   const isSafeMethod = ['get', 'head', 'options']
      .includes(config.method?.toLowerCase());

    if (!config._retry && isSafeMethod &&
        (!error.response || error.response.status >= 500)) {
      config._retry = true;
      await new Promise((r) => setTimeout(r, 2000));
      return API(config);
    }

    return Promise.reject(error);
  }
);

export default API;
