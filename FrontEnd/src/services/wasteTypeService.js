import api from "./api";

const normalizeWasteType = (item) => ({
  wasteTypeId: item.wasteTypeId ?? item.WasteTypeId ?? 0,
  name: item.name ?? item.Name ?? "",
  description: item.description ?? item.Description ?? "",
  rewardPoints: item.rewardPoints ?? item.RewardPoints ?? 0,
  isActive: item.isActive ?? item.IsActive ?? false,
});

const wasteTypeService = {
  getAll: async () => {
    const response = await api.get("/waste-types");
    return Array.isArray(response.data)
      ? response.data.map(normalizeWasteType)
      : [];
  },

  getById: async (id) => {
    const response = await api.get(`/waste-types/${id}`);
    return normalizeWasteType(response.data);
  },

  create: async (data) => {
    const response = await api.post("/waste-types", data);
    return normalizeWasteType(response.data);
  },

  update: async (id, data) => {
    const response = await api.put(`/waste-types/${id}`, data);
    return normalizeWasteType(response.data);
  },

  remove: async (id) => {
    await api.delete(`/waste-types/${id}`);
  },
};

export default wasteTypeService;
