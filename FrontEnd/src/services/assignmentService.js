import api from "./api";

const normalizeCollectionRequest = (item) => ({
  requestId: item.requestId ?? item.RequestId ?? null,
  reportId: item.reportId ?? item.ReportId ?? null,
  enterpriseId: item.enterpriseId ?? item.EnterpriseId ?? null,
  enterpriseName: item.enterpriseName ?? item.EnterpriseName ?? "",
  status: item.status ?? item.Status ?? "",
  createdAt: item.createdAt ?? item.CreatedAt ?? null,
  wasteTypeName: item.wasteTypeName ?? item.WasteTypeName ?? "",
  reportImageUrl: item.reportImageUrl ?? item.ReportImageUrl ?? "",
  latitude: Number(item.latitude ?? item.Latitude ?? 0),
  longitude: Number(item.longitude ?? item.Longitude ?? 0),
  reportDescription: item.reportDescription ?? item.ReportDescription ?? "",
  reportStatus: item.reportStatus ?? item.ReportStatus ?? "",
  reportCreatedAt: item.reportCreatedAt ?? item.ReportCreatedAt ?? null,
  currentAssignmentId: item.currentAssignmentId ?? item.CurrentAssignmentId ?? null,
  assignedCollectorId: item.assignedCollectorId ?? item.AssignedCollectorId ?? null,
  assignedCollectorName: item.assignedCollectorName ?? item.AssignedCollectorName ?? "",
  assignmentStatus: item.assignmentStatus ?? item.AssignmentStatus ?? "",
  assignedAt: item.assignedAt ?? item.AssignedAt ?? null,
});

const normalizeAssignment = (item) => ({
  assignmentId: item.assignmentId ?? item.AssignmentId ?? null,
  requestId: item.requestId ?? item.RequestId ?? null,
  status: item.status ?? item.Status ?? "",
  assignedAt: item.assignedAt ?? item.AssignedAt ?? null,
  startedAt: item.startedAt ?? item.StartedAt ?? null,
  arrivedAt: item.arrivedAt ?? item.ArrivedAt ?? null,
  completedAt: item.completedAt ?? item.CompletedAt ?? null,
  beforeImageUrl: item.beforeImageUrl ?? item.BeforeImageUrl ?? "",
  enterpriseId: item.enterpriseId ?? item.EnterpriseId ?? null,
  enterpriseName: item.enterpriseName ?? item.EnterpriseName ?? "",
  enterprisePhone: item.enterprisePhone ?? item.EnterprisePhone ?? "",
  reportId: item.reportId ?? item.ReportId ?? null,
  wasteTypeIds: item.wasteTypeIds ?? item.WasteTypeIds ?? [],
  wasteTypeName: item.wasteTypeName ?? item.WasteTypeName ?? "",
  imageUrl: item.imageUrl ?? item.ImageUrl ?? "",
  latitude: Number(item.latitude ?? item.Latitude ?? 0),
  longitude: Number(item.longitude ?? item.Longitude ?? 0),
  description: item.description ?? item.Description ?? "",
  reportStatus: item.reportStatus ?? item.ReportStatus ?? "",
  reportCreatedAt: item.reportCreatedAt ?? item.ReportCreatedAt ?? null,
  citizenName: item.citizenName ?? item.CitizenName ?? "",
  citizenPhone: item.citizenPhone ?? item.CitizenPhone ?? "",
  totalCollectedWeight: Number(item.totalCollectedWeight ?? item.TotalCollectedWeight ?? 0),
  collectedWasteSummary: item.collectedWasteSummary ?? item.CollectedWasteSummary ?? "",
});


const assignmentService = {
  assignCollector: async ({ requestId, collectorId }) => {
    const response = await api.post("/assignments", {
      requestId: Number(requestId),
      collectorId: Number(collectorId),
    });
    return response.data;
  },

  getCollectionRequests: async () => {
    const response = await api.get("/collection-requests");
    return Array.isArray(response.data)
      ? response.data.map(normalizeCollectionRequest)
      : [];
  },

  getAssignmentHistory: async (requestId) => {
    const response = await api.get(`/collection-requests/${requestId}/assignments`);
    return Array.isArray(response.data) ? response.data : [];
  },

  cancelAssignment: async (assignmentId) => {
    const response = await api.put(`/assignments/${assignmentId}/cancel`);
    return response.data;
  },

  getMyAssignments: async () => {
    const response = await api.get("/assignments/my-assignments");
    return Array.isArray(response.data)
      ? response.data.map(normalizeAssignment)
      : [];
  },
};

export default assignmentService;
