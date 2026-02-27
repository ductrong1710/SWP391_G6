import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { authService } from '../services/authService'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = authService.getCurrentUser()

  // 1. Kiểm tra đăng nhập
  // Thêm điều kiện !user để chắc chắn
  if (!authService.isAuthenticated() || !user) {
    return <Navigate to="/login" replace />
  }

  // 2. Kiểm tra quyền (Authorization)
  if (allowedRoles && !allowedRoles.includes(user.roleId)) {
    // Map điều hướng dựa trên role
    const roleNavigation = {
      4: '/admin',
      2: '/enterprise',
      3: '/collector',
      1: '/citizen'
    }
    
    // Tìm đường dẫn tương ứng với role của user
    const targetPath = roleNavigation[user.roleId] || '/login';
    
    // Chặn vòng lặp vô hạn: Nếu user đang ở đúng trang role của họ rồi thì không redirect nữa
    // (Logic này tùy chọn, nhưng Redirect là đủ)
    return <Navigate to={targetPath} replace />
  }

  // 3. QUAN TRỌNG:
  // Nếu có children (cách dùng cũ) thì render children
  // Nếu không (cách dùng trong Router v6), render Outlet để hiện trang con
  return children ? children : <Outlet />;
}

export default ProtectedRoute