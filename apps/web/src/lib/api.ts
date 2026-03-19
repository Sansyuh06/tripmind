import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tripmind-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const lang = localStorage.getItem('tripmind-lang') || 'en';
  config.headers['Accept-Language'] = lang;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      const refreshToken = localStorage.getItem('tripmind-refresh');
      if (refreshToken && error.config && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('tripmind-token', data.accessToken);
          localStorage.setItem('tripmind-refresh', data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(error.config);
        } catch {
          localStorage.removeItem('tripmind-token');
          localStorage.removeItem('tripmind-refresh');
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
