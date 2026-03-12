import api from "./api";

const rewardService = {
  // Citizen: Xem tổng điểm hiện có
  getMyBalance: async () => {
    const response = await api.get("/rewards/balance");
    return response.data;
  },

  // Citizen: Xem lịch sử giao dịch điểm thưởng
  getMyTransactionHistory: async () => {
    try {
      const response = await api.get("/rewards/history");
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.warn("⚠️ GET /rewards/history failed:", err?.response?.status || err.message);
      return [];
    }
  }
};

export default rewardService;