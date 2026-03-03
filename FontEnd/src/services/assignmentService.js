import api from './api';

const assignmentService = {
  // Phân công collector cho collection request
  // Body: { requestId (từ collection-requests, KHÔNG phải reportId), collectorId }
  assignCollector: async (data) => {
    const response = await api.post('/assignments', {
      requestId: parseInt(data.requestId),
      collectorId: parseInt(data.collectorId)
    });
    return response.data;
  },

  // Lấy tất cả collection requests của enterprise (có thông tin assignment)
  getCollectionRequests: async () => {
    try {
      const response = await api.get('/collection-requests');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.$values || data?.data || []);
    } catch (err) {
      console.warn('⚠️ Get collection-requests failed:', err.response?.status);
      return [];
    }
  },

  // Lấy tất cả assignments
  getAssignmentHistory: async () => {
    try {
      const response = await api.get('/assignments');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.$values || data?.data || []);
    } catch (err) {
      console.warn('⚠️ Get assignments failed:', err.response?.status);
      return [];
    }
  },

  // Hủy phân công
  cancelAssignment: async (assignmentId) => {
    const response = await api.put(`/assignments/${assignmentId}/cancel`);
    return response.data;
  },
};

export default assignmentService;