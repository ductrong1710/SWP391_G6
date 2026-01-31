import api from './api';

const API_BASE_URL = 'http://localhost:5021/api';

export const authService = {
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

// Kiểm tra nếu có một trong các role được cho phép
hasAnyRole: (roleIds) => {
  const user = authService.getCurrentUser();
  return roleIds.includes(user?.roleId);
},

// Lấy role ID
getRoleId: () => {
  const user = authService.getCurrentUser();
  return user?.roleId;
},

// Lấy role Name (nếu có trong response)
getRoleName: () => {
  const user = authService.getCurrentUser();
  return user?.roleName || 'citizen';
},
};