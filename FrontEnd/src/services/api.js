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
    // Kiểm tra xem URL của API vừa gọi có chứa chữ "/auth/login" không
    const isLoginApi = error.config?.url?.includes("/auth/login");

    // Nếu lỗi 401 và KHÔNG PHẢI đang gọi API login thì mới ép tải lại trang
    if (error.response?.status === 401 && !isLoginApi) {
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
