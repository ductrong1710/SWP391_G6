import api from './api';

const collectionRequestService = {
    // Enterprise: tạo yêu cầu thu gom
    createRequest: async (requestData) => {
        const response = await api.post('/CollectionRequests', requestData);
        return response.data;
    },

    // Enterprise: lấy requests theo enterprise
    getByEnterprise: async (enterpriseId) => {
        const response = await api.get(`/CollectionRequests/enterprise/${enterpriseId}`);
        return response.data;
    },

    // Cập nhật trạng thái request
    updateStatus: async (requestId, statusData) => {
        const response = await api.put(`/CollectionRequests/${requestId}/status`, statusData);
        return response.data;
    }
};

export default collectionRequestService;