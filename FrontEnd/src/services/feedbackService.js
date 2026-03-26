import api from "./api";

const feedbackService = {
  // Citizen: create feedback for a report (with optional image)
  createFeedback: async (reportId, content, image) => {
    const formData = new FormData();
    formData.append("reportId", reportId);
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }
    const response = await api.post("/feedbacks", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
