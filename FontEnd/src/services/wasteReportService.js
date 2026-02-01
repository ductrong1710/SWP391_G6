import api from './api';

export const wasteReportService = {
  // Tạo báo cáo mới
  createReport: async (reportData) => {
    const response = await api.post('/WasteReports', reportData);
    return response.data;
  },

  // Lấy danh sách báo cáo
  getReports: async () => {
    const response = await api.get('/WasteReports');
    return response.data;
  },

  // Lấy báo cáo theo ID
  getReportById: async (id) => {
    const response = await api.get(`/WasteReports/${id}`);
    return response.data;
  },

  // Kiểm tra trạng thái báo cáo
  checkStatus: async (id) => {
    const response = await api.get(`/WasteReports/${id}/status`);
    return response.data;
  },
};