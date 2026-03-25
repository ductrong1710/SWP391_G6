import api from "./api";

const dashboardService = {
  getAdminDashboard: async (year) => {
    const params = year ? { year } : {};
    const response = await api.get("/dashboard/admin", { params });
    return response.data;
  },
};

export default dashboardService;
