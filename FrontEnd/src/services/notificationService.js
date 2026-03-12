import api from "./api";

const notificationService = {
  // Lấy danh sách thông báo của user đang đăng nhập
  getMyNotifications: async () => {
    try {
      const response = await api.get("/notifications");
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.warn("⚠️ GET /notifications failed:", err?.response?.status || err.message);
      return [];
    }
  },

  // Đánh dấu 1 thông báo là đã đọc
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: async () => {
    const response = await api.put("/notifications/read-all");
    return response.data;
  }
};

export default notificationService;