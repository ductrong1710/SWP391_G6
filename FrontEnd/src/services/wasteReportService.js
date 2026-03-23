import api from "./api";

const normalizeWasteReport = (report) => ({
  reportId: report.reportId ?? report.ReportId ?? report.id ?? null,
  submittedBy: report.submittedBy ?? report.SubmittedBy ?? null,
  submittedByName: report.submittedByName ?? report.SubmittedByName ?? "",
  wasteTypeIds: report.wasteTypeIds ?? report.WasteTypeIds ?? [],
  wasteTypeNames: report.wasteTypeNames ?? report.WasteTypeNames ?? [],
  imageUrl: report.imageUrl ?? report.ImageUrl ?? "",
  latitude: Number(report.latitude ?? report.Latitude ?? 0),
  longitude: Number(report.longitude ?? report.Longitude ?? 0),
  description: report.description ?? report.Description ?? "",
  status: report.status ?? report.Status ?? "",
  createdAt: report.createdAt ?? report.CreatedAt ?? null,
});

const buildWasteReportFormData = (payload) => {
  const formData = new FormData();

  if (payload.image) {
    formData.append("Image", payload.image);
  }

  formData.append("Latitude", String(payload.latitude));
  formData.append("Longitude", String(payload.longitude));
  formData.append("Description", payload.description ?? "");

  (payload.wasteTypeIds ?? []).forEach((id) => {
    formData.append("WasteTypeIds", String(id));
  });

  return formData;
};

const wasteReportService = {
  getAllReports: async () => {
    const response = await api.get("/waste-reports");
    return Array.isArray(response.data) ? response.data.map(normalizeWasteReport) : [];
  },

  getReportById: async (id) => {
    const response = await api.get(`/waste-reports/${id}`);
    return normalizeWasteReport(response.data);
  },

  createReport: async (payload) => {
    const formData = payload instanceof FormData ? payload : buildWasteReportFormData(payload);
    const response = await api.post("/waste-reports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateReport: async (id, payload) => {
    const response = await api.put(`/waste-reports/${id}`, buildWasteReportFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizeWasteReport(response.data);
  },

  cancelReport: async (id) => {
    const response = await api.put(`/waste-reports/${id}/cancel`);
    return response.data;
  },

  acceptReport: async (id) => {
    const response = await api.put(`/waste-reports/${id}/accept`);
    return response.data;
  },

  rejectReport: async (id) => {
    const response = await api.put(`/waste-reports/${id}/reject`);
    return response.data;
  },

  getWasteTypes: async () => {
    const response = await api.get("/waste-types");
    return Array.isArray(response.data)
      ? response.data.map((item) => ({
          wasteTypeId: item.wasteTypeId ?? item.WasteTypeId ?? item.id,
          name: item.name ?? item.Name ?? "",
          description: item.description ?? item.Description ?? "",
          rewardPoints: Number(item.rewardPoints ?? item.RewardPoints ?? 0),
          isActive: item.isActive ?? item.IsActive ?? true,
        }))
      : [];
  },
};

export default wasteReportService;
