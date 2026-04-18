import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  timeout: 20000, // 20s — accounts for Render free tier cold start
});

// ── Request: attach token ─────────────────────────────────────────────────────
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  },
  (error) => Promise.reject(error)
);

// ── Response: auto-logout on 401, retry on network error ─────────────────────
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config;
    // Auto-logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }
    // Retry once on network error or 5xx (handles Render cold start)
    if (!config._retry && (!error.response || error.response.status >= 500)) {
      config._retry = true;
      await new Promise((r) => setTimeout(r, 2000)); // wait 2s then retry
      return API(config);
    }
    return Promise.reject(error);
  }
);

export default API;
