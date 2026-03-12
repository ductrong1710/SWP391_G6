import api from "./api";

const wasteReportService = {

  
  // Get all waste reports
  getAllReports: async () => {
    const response = await api.get("/waste-reports");
    return response.data;
  },

  // Get waste report by ID
  getReportById: async (id) => {
    const response = await api.get(`/waste-reports/${id}`);
    return response.data;
  },

  // Citizen: Create waste report
  createReport: async (formData) => {
    const response = await api.post("/waste-reports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Enterprise: Accept waste report
  acceptReport: async (id) => {
    const response = await api.put(`/waste-reports/${id}/accept`);
    return response.data;
  },

  // Enterprise: Reject waste report
  rejectReport: async (id, reason) => {
    const response = await api.put(`/waste-reports/${id}/reject`, { reason });
    return response.data;
  },

  // Get waste types
  getWasteTypes: async () => {
    const response = await api.get("/waste-types");
    return response.data;
  },
};

export default wasteReportService;
