import api from "./api";

const userService = {
  // Admin: Get all users
  getAllUsers: async () => {
    const response = await api.get("/Users");
    return response.data;
  },

  // Authenticated: Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/Users/${userId}`);
    return response.data;
  },

  // Admin/Enterprise: Get all collectors
  getCollectors: async () => {
    try {
      const response = await api.get("/Users/collectors");
      console.log("✅ GET /Users/collectors:", response.status, response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(
        "❌ GET /Users/collectors failed:",
        error?.response?.status,
        error?.response?.data
      );
      return [];
    }
  },
};

export default userService;
