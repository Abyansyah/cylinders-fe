import axios from 'axios';

const SESSION_COOKIE_NAME = 'session_token';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk request
api.interceptors.request.use(
  async (config) => {
    let token;

    // Cek apakah kode berjalan di server atau client
    if (typeof window === 'undefined') {
      // Server-side: Gunakan 'next/headers' untuk mengambil cookie
      const { cookies } = await import('next/headers');
      token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    } else {
      const Cookies = (await import('js-cookie')).default;
      token = Cookies.get(SESSION_COOKIE_NAME);
    }

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
  async (error) => {
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const fetcher = (url: string) => api.get(url).then((res) => res.data);
