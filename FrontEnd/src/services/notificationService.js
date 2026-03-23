import api from "./api";

const notificationService = {
  getMyNotifications: async () => {
    const response = await api.get("/notifications");
    return Array.isArray(response.data) ? response.data : [];
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/notifications/read-all");
    return response.data;
  },
};

export default notificationService;
