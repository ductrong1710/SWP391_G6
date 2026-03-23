import api from "./api";

const complaintService = {
  getComplaints: async () => {
    const response = await api.get("/complaints");
    return Array.isArray(response.data) ? response.data : [];
  },

  approveComplaint: async (id) => {
    const response = await api.put(`/complaints/${id}/approve`, {});
    return response.data;
  },

  rejectComplaint: async (id) => {
    const response = await api.put(`/complaints/${id}/reject`, {});
    return response.data;
  },

  updateComplaint: async (id, payload) => {
    const response = await api.put(`/complaints/${id}`, payload);
    return response.data;
  },

  sendComplaintMessage: async (id, payload) => {
    const response = await api.post(`/complaints/${id}/messages`, payload);
    return response.data;
  },
};

export default complaintService;
