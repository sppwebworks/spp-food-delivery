/**
 * ============================================================
 * ADMIN API SERVICE
 * ============================================================
 */

import axios from "axios";

const TOKEN_KEY = "admin_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ Purely from .env
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export const adminTokenKey = TOKEN_KEY;
export default api;
