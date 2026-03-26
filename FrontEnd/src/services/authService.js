import api from "./api";

const ROLE_NAMES = {
  1: "Citizen",
  2: "Enterprise",
  3: "Collector",
  4: "Admin",
};

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  const roleId = Number(user.roleId ?? user.RoleId ?? 0);

  return {
    userId: user.userId ?? user.UserId ?? user.id ?? null,
    fullName: user.fullName ?? user.FullName ?? "",
    email: user.email ?? user.Email ?? "",
    roleId,
    roleName: user.roleName ?? user.RoleName ?? ROLE_NAMES[roleId] ?? "",
    isAvailable: Boolean(user.isAvailable ?? user.IsAvailable ?? false),
    availabilityUpdatedAt:
      user.availabilityUpdatedAt ?? user.AvailabilityUpdatedAt ?? null,
  };
};

const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", {
      email: userData.email,
      fullName: userData.fullName,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
    });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const normalizedUser = normalizeUser(response.data.user);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    }

    return {
      ...response.data,
      user: normalizedUser,
    };
  },

  // ===============================================
  // THÊM HÀM NÀY VÀO ĐỂ XỬ LÝ ĐỔI MẬT KHẨU
  // ===============================================
  
  // Thêm hàm changePassword gọi api backend
  changePassword: async (passwordData) => {
    // passwordData truyền vào sẽ có dạng: { oldPassword, newPassword, confirmPassword }
    // Khớp hoàn toàn với ChangePasswordDto trong backend
    const response = await api.put("/auth/change-password", passwordData);
    return response.data;
  },
  // ===============================================

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  updateCurrentUser: (partialUser) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...partialUser };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  },

  isAuthenticated: () => !!localStorage.getItem("token"),
  hasRole: (roleId) => authService.getCurrentUser()?.roleId === roleId,
  hasAnyRole: (roleIds) => roleIds.includes(authService.getCurrentUser()?.roleId),
  getRoleId: () => authService.getCurrentUser()?.roleId,
  getRoleName: () => authService.getCurrentUser()?.roleName || "Citizen",
};

export { authService };
export default authService;