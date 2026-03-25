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
  status: String(report.status ?? report.Status ?? "").trim(),
  createdAt: report.createdAt ?? report.CreatedAt ?? null,
});

const buildWasteReportFormData = (payload) => {
  const formData = new FormData();

  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Latitude/Longitude is invalid");
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }

  if (payload.image) {
    formData.append("Image", payload.image);
  }

  // luôn gửi numeric string chuẩn với dấu "."
  formData.append("Latitude", latitude.toString());
  formData.append("Longitude", longitude.toString());
  formData.append("Description", payload.description ?? "");

  (payload.wasteTypeIds ?? []).forEach((id) => {
    formData.append("WasteTypeIds", String(id));
  });

  console.log("Submitting waste report payload:", {
    latitude,
    longitude,
    description: payload.description ?? "",
    wasteTypeIds: payload.wasteTypeIds ?? [],
    image: payload.image ? payload.image.name : null,
  });

  for (const [key, value] of formData.entries()) {
    console.log(`FormData -> ${key}:`, value);
  }

  return formData;
};

const wasteReportService = {
  getAllReports: async () => {
    const response = await api.get("/waste-reports");
    return Array.isArray(response.data)
      ? response.data.map(normalizeWasteReport)
      : [];
  },

  getReportById: async (id) => {
    const response = await api.get(`/waste-reports/${id}`);
    return normalizeWasteReport(response.data);
  },

  createReport: async (payload) => {
    const formData =
      payload instanceof FormData ? payload : buildWasteReportFormData(payload);

    const response = await api.post("/waste-reports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  updateReport: async (id, payload) => {
    const response = await api.put(
      `/waste-reports/${id}`,
      buildWasteReportFormData(payload),
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
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