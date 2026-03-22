import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
// const BASE = 'https://be-hisabkhata.vercel.app/api/v1';

export const axiosPublic = axios.create({ baseURL: BASE, withCredentials: true });

export const axiosPrivate = axios.create({ baseURL: BASE, withCredentials: true });

axiosPrivate.interceptors.request.use(cfg => {
  const token = localStorage.getItem('accessToken');
  if (token) cfg.headers.Authorization = token;
  return cfg;
});

axiosPrivate.interceptors.response.use(
  r => r,
  async error => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const { data } = await axiosPublic.post('/auth/refresh-token');
        const t = data.data.accessToken;
        localStorage.setItem('accessToken', t);
        orig.headers.Authorization = t;
        return axiosPrivate(orig);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
