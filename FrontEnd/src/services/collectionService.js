import api from "./api";

const collectionService = {
  // Collector: Bắt đầu đi thu gom
  startCollection: async (assignmentId) => {
    const response = await api.put(`/collections/${assignmentId}/start`);
    return response.data;
  },

  // Collector: Đã đến nơi (cần gửi kèm ảnh trước khi dọn - BeforeImage)
  arrivedAtLocation: async (assignmentId, formData) => {
    const response = await api.put(`/collections/${assignmentId}/arrived`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Collector: Hoàn thành thu gom (cần gửi kèm ảnh sau khi dọn - AfterImage và ActualWeights nếu có)
  completeCollection: async (assignmentId, formData) => {
    const response = await api.put(`/collections/${assignmentId}/complete`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Collector: Báo cáo sự cố trong quá trình thu gom
  reportIssue: async (assignmentId, formData) => {
    const response = await api.put(`/collections/${assignmentId}/report-issue`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  
  // Collector: Từ chối nhiệm vụ
  declineAssignment: async (assignmentId, reasonData) => {
    const response = await api.put(`/collections/${assignmentId}/decline`, reasonData);
    return response.data;
  }
};

export default collectionService;