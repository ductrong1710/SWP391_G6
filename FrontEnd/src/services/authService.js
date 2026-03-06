import api from "./api";

const authService = {
  // ===== AUTHENTICATION =====

  register: async (userData) => {
    const response = await api.post("/Auth/register", {
      email: userData.email,
      fullName: userData.fullName,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
    });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post("/Auth/verify-otp", { email, otp });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("/Auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  // ===== CURRENT USER =====

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => !!localStorage.getItem("token"),

  hasRole: (roleId) => authService.getCurrentUser()?.roleId === roleId,

  hasAnyRole: (roleIds) =>
    roleIds.includes(authService.getCurrentUser()?.roleId),

  getRoleId: () => authService.getCurrentUser()?.roleId,

  getRoleName: () => authService.getCurrentUser()?.roleName || "citizen",
};

export { authService };
export default authService;
