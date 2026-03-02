import api from './api';

const assignmentService = {
  /**
   * 🏭 ENTERPRISE: Lấy danh sách collection requests
   */
  getMyRequests: async () => {
    try {
      const response = await api.get('/collection-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  },

  /**
   * 🏭 ENTERPRISE: Phân công Collector cho một request
   * @param {string} requestId - ID của collection request
   * @param {string} collectorId - ID của collector
   */
  assignCollector: async (requestId, collectorId) => {
    try {
      const response = await api.post('/assignments', {
        requestId,
        collectorId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning collector:', error);
      throw error;
    }
  },

  /**
   * 🏭 ENTERPRISE: Lấy danh sách Collectors từ assignments history
   * (Lấy tất cả collectors đã từng được phân công bởi enterprise này)
   */
  getCollectorsFromAssignments: async () => {
    try {
      // Lấy tất cả assignments của enterprise này
      const response = await api.get('/assignments');
      const assignments = response.data;

      if (!Array.isArray(assignments) || assignments.length === 0) {
        console.log('No assignments found, returning empty array');
        return [];
      }

      // Extract unique collectors từ assignments
      const collectorsMap = new Map();
      
      assignments.forEach(assignment => {
        const collectorId = assignment.collectorId || assignment.assignedCollectorId;
        const collectorName = assignment.collectorName || assignment.assignedCollectorName;
        
        if (collectorId && !collectorsMap.has(collectorId)) {
          collectorsMap.set(collectorId, {
            id: collectorId,
            userId: collectorId,
            username: collectorName || `Collector ${collectorId}`,
            fullName: collectorName || `Collector ${collectorId}`,
            email: assignment.collectorEmail || '',
            status: 'Available', // Default status
            lastAssignment: assignment.assignedAt || assignment.createdAt
          });
        }
      });

      // Convert Map to Array
      const collectors = Array.from(collectorsMap.values());
      console.log('Extracted collectors from assignments:', collectors);
      return collectors;
      
    } catch (error) {
      console.error('Error fetching collectors from assignments:', error);
      // Return empty array để trigger manual input
      return [];
    }
  },

  /**
   * 👷 COLLECTOR: Lấy danh sách assignments của collector
   */
  getMyAssignments: async () => {
    try {
      const response = await api.get('/assignments/my-assignments');
      return response.data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  },

  /**
   * 👷 COLLECTOR: Lấy chi tiết một assignment
   */
  getAssignmentDetail: async (assignmentId) => {
    try {
      const response = await api.get(`/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment detail:', error);
      throw error;
    }
  },

  /**
   * 👷 COLLECTOR: Bắt đầu collection
   */
  startCollection: async (assignmentId) => {
    try {
      const response = await api.put(`/collections/${assignmentId}/start`, {});
      return response.data;
    } catch (error) {
      console.error('Error starting collection:', error);
      throw error;
    }
  },

  /**
   * 👷 COLLECTOR: Từ chối assignment
   */
  declineAssignment: async (assignmentId, reason) => {
    try {
      const response = await api.post(`/assignments/${assignmentId}/decline`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error declining assignment:', error);
      throw error;
    }
  }
};

export default assignmentService;