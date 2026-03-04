import axios from 'axios';

const API_BASE_URL = 'http://localhost:5021/api';

const wasteReportService = {
  // Lấy danh sách waste reports
  getAllReports: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/waste-reports`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  // Lấy chi tiết waste report
  getReportById: async (id, token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/waste-reports/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  },

  // Tạo waste report
  createReport: async (formData, token) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/waste-reports`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  // Duyệt waste report (Enterprise)
  acceptReport: async (id, token) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/waste-reports/${id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error accepting report:', error);
      throw error;
    }
  },

  // Từ chối waste report (Enterprise)
  rejectReport: async (id, reason, token) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/waste-reports/${id}/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error rejecting report:', error);
      throw error;
    }
  },

  // Lấy danh sách waste types
  getWasteTypes: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/waste-types`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching waste types:', error);
      throw error;
    }
  }
};

export default wasteReportService;