import api from "./api";

const feedbackService = {
  // Citizen: create feedback for a report
  createFeedback: async (reportId, content) => {
    const response = await api.post("/feedbacks", { reportId, content });
    return response.data;
  },

  // Get feedbacks for a specific report
  getFeedbacksByReport: async (reportId) => {
    const response = await api.get(`/feedbacks/report/${reportId}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  // Admin: get all feedbacks
  getAllFeedbacks: async () => {
    const response = await api.get("/feedbacks");
    return Array.isArray(response.data) ? response.data : [];
  },

  // Admin: get feedback detail with full context
  getFeedbackDetail: async (id) => {
    const response = await api.get(`/feedbacks/${id}`);
    return response.data;
  },

  // Admin: resolve feedback with actions
  resolveFeedback: async (id, actions) => {
    const response = await api.put(`/feedbacks/${id}/resolve`, actions);
    return response.data;
  },

  // Admin: reject feedback
  rejectFeedback: async (id) => {
    const response = await api.put(`/feedbacks/${id}/reject`);
    return response.data;
  },
};

export default feedbackService;
