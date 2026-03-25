import api from "./api";

const normalizeUser = (user) => ({
  userId: user.userId ?? user.UserId ?? user.id ?? null,
  fullName: user.fullName ?? user.FullName ?? "",
  email: user.email ?? user.Email ?? "",
  phone: user.phone ?? user.Phone ?? "",
  roleId: user.roleId ?? user.RoleId ?? 0,
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

  updateUser: async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data);
    return normalizeUser(response.data);
  },

  deactivateUser: async (userId) => {
    const response = await api.put(`/users/${userId}/deactivate`);
    return normalizeUser(response.data);
  },

  activateUser: async (userId) => {
    const response = await api.put(`/users/${userId}/activate`);
    return normalizeUser(response.data);
  },

  createUser: async (data) => {
    const response = await api.post("/users", data);
    return normalizeUser(response.data);
  },
};

export default userService;