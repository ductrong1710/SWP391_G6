import api from './api';

const authService = {
  // Đăng ký - Bước 1: Gửi OTP
  register: async (userData) => {
    const response = await api.post('/Auth/register', {
      email: userData.email,
      fullName: userData.fullName,
      password: userData.password,
      confirmPassword: userData.confirmPassword
    });
    return response.data;
  },

  // Xác thực OTP - Bước 2: Hoàn tất đăng ký
  verifyOtp: async (email, otp) => {
    const response = await api.post('/Auth/verify-otp', {
      email: email,
      otp: otp
    });
    return response.data;
  },

  // Đăng nhập
  login: async (email, password) => {
    const response = await api.post('/Auth/login', {
      email: email,
      password: password
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Lấy user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Kiểm tra quyền truy cập
  hasRole: (roleId) => {
    const user = authService.getCurrentUser();
    return user?.roleId === roleId;
  },

  hasAnyRole: (roleIds) => {
    const user = authService.getCurrentUser();
    return roleIds.includes(user?.roleId);
  },

  getRoleId: () => {
    const user = authService.getCurrentUser();
    return user?.roleId;
  },

  getRoleName: () => {
    const user = authService.getCurrentUser();
    return user?.roleName || 'citizen';
  },

  // ===== USER MANAGEMENT =====

  getAllUsers: async () => {
    const response = await api.get('/Users');
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/Users/${userId}`);
    return response.data;
  },

  // Lấy danh sách collectors từ DB
  getCollectors: async () => {
    try {
      const response = await api.get('/Users/collectors');
      const data = Array.isArray(response.data)
        ? response.data
        : (response.data?.$values || response.data?.data || []);

      console.log('✅ Collectors from DB:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching collectors:', error.response?.status, error.response?.data);
      return [];
    }
  },

  // Lấy danh sách enterprises
  getEnterprises: async () => {
    try {
      const response = await api.get('/Users');
      const allUsers = Array.isArray(response.data) ? response.data : [];
      return allUsers.filter(u => {
        const role = u.roleName ?? u.RoleName ?? '';
        return role.toLowerCase() === 'enterprise';
      });
    } catch (error) {
      console.error('❌ Error fetching enterprises:', error);
      return [];
    }
  },

  getUsersByRole: async (roleName) => {
    try {
      const response = await api.get('/Users');
      const allUsers = Array.isArray(response.data) ? response.data : [];
      return allUsers.filter(u => {
        const role = u.roleName ?? u.RoleName ?? '';
        return role.toLowerCase() === roleName.toLowerCase();
      });
    } catch (error) {
      console.error('❌ Error fetching users by role:', error);
      return [];
    }
  },
};

export { authService };
export default authService;