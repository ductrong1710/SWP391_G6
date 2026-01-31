import React from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '../services/authService'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = authService.getCurrentUser()

  // Nếu chưa đăng nhập
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // Nếu không có quyền truy cập
  if (allowedRoles && !allowedRoles.includes(user?.roleId)) {
    // Điều hướng về trang phù hợp với role hiện tại
    const roleNavigation = {
      4: '/admin',
      2: '/enterprise',
      3: '/collector',
      1: '/citizen'
    }
    return <Navigate to={roleNavigation[user?.roleId] || '/citizen'} replace />
  }

  return children
}

export default ProtectedRoute