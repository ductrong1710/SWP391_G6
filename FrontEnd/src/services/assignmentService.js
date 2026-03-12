import api from "./api";
import userService from "./userService";

const assignmentService = {
  // Enterprise: Assign collector to a collection request
  assignCollector: async ({ requestId, collectorId }) => {
    const response = await api.post("/assignments", {
      requestId: parseInt(requestId),
      collectorId: parseInt(collectorId),
    });
    return response.data;
  },

  // Enterprise: Get all collection requests
  getCollectionRequests: async () => {
    try {
      const response = await api.get("/collection-requests");
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.warn(
        "⚠️ GET /collection-requests failed:",
        err?.response?.status || err.message
      );
      return [];
    }
  },

  // Enterprise: Get assignment history
  getAssignmentHistory: async () => {
    try {
      const response = await api.get("/assignments");
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.warn(
        "⚠️ GET /assignments failed:",
        err?.response?.status || err.message
      );
      return [];
    }
  },

  // Enterprise: Cancel an assignment
  cancelAssignment: async (assignmentId) => {
    const response = await api.put(`/assignments/${assignmentId}/cancel`);
    return response.data;
  },

  // Enterprise/Admin: Get all collectors (delegate to userService)
  getCollectors: () => userService.getCollectors(),

  // Collector: Get all my assignments
  getMyAssignments: async () => {
    try {
      const response = await api.get("/assignments/my-assignments");
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.warn("⚠️ GET /assignments/my-assignments failed:", err?.response?.status || err.message);
      return [];
    }
  },
};

export default assignmentService;