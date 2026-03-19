import axios from "axios";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:5021").replace(/\/+$/, "");
const API_BASE_URL = `${API_ROOT}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const buildFileUrl = (path) => {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_ROOT}${path.startsWith("/") ? "" : "/"}${path}`;
};

export { API_ROOT, API_BASE_URL };
export default api;
