/**
 * ============================================================
 * API SERVICE
 * ============================================================
 */

import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  // ✅ Increased from 15000 to 30000 (30 seconds)
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const downloadInvoice = async (orderId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${baseURL}/orders/${orderId}/invoice`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    let message = "Failed to download invoice";
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${orderId.slice(-8).toUpperCase()}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export default api;
