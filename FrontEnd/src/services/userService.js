import api from "./api";

const normalizeUser = (user) => ({
  userId: user.userId ?? user.UserId ?? user.id ?? null,
  fullName: user.fullName ?? user.FullName ?? "",
  email: user.email ?? user.Email ?? "",
  phone: user.phone ?? user.Phone ?? "",
  roleName: user.roleName ?? user.RoleName ?? "",
  status: user.status ?? user.Status ?? "",
  createdAt: user.createdAt ?? user.CreatedAt ?? null,
  isAvailable: Boolean(user.isAvailable ?? user.IsAvailable ?? false),
  availabilityUpdatedAt:
    user.availabilityUpdatedAt ?? user.AvailabilityUpdatedAt ?? null,
});


const userService = {
  getAllUsers: async () => {
    const response = await api.get("/users");
    return Array.isArray(response.data) ? response.data.map(normalizeUser) : [];
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return normalizeUser(response.data);
  },

  getCollectors: async () => {
    try {
      const response = await api.get("/users/collectors");
      return Array.isArray(response.data) ? response.data.map(normalizeUser) : [];
    } catch {
      return [];
    }
  },
  
  updateMyAvailability: async (isAvailable) => {
  const response = await api.put("/users/me/availability", { isAvailable });
  return normalizeUser(response.data);
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/Users/me/profile', profileData);
    return response.data;
  },

  // Thêm hàm này vào dưới hàm updateProfile lúc nãy
  getProfile: async () => {
    const response = await api.get('/Users/me/profile');
    return response.data;
  },


  // --- THÊM 2 HÀM NÀY VÀO DÀNH CHO PROFILE CÁ NHÂN ---
  getProfile: async () => {
    const response = await api.get('/Users/me/profile');
    return normalizeUser(response.data);
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/Users/me/profile', profileData);
    return normalizeUser(response.data);
  },
  // ---------------------------------------------------
};

export default userService;