import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'

import CitizenApp from './pages/citizen/CitizenApp'
import EnterpriseApp from './pages/Enterprise/EnterpriseApp'
import CollectorApp from './pages/collector/CollectorApp'
import Admin from './pages/Admin/Admin'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ProtectedRoute from './components/ProtectedRoute'
import { authService } from './services/authService'

function App() {
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Kiểm tra authentication và cập nhật role khi load app
  useEffect(() => {
    const currentPath = window.location.pathname
    const isAuth = authService.isAuthenticated()

    if (!isAuth && currentPath !== '/login' && currentPath !== '/register') {
      navigate('/login')
    } else if (isAuth) {
      const user = authService.getCurrentUser()
      const roleMap = {
        4: 'admin',
        2: 'enterprise',
        3: 'collector',
        1: 'citizen'
      }
      setUserRole(roleMap[user?.roleId] || 'citizen')
    }
    setLoading(false)
  }, [navigate])

  if (loading) {
    return <div>Loading...</div>
  }

  // đổi role + chuyển URL tương ứng
  const switchRole = () => {
    if (userRole === 'citizen') {
      setUserRole('enterprise')
      navigate('/enterprise')
    } else if (userRole === 'enterprise') {
      setUserRole('collector')
      navigate('/collector')
    } else if (userRole === 'collector') {
      setUserRole('admin')
      navigate('/admin')
    } else {
      setUserRole('citizen')
      navigate('/citizen')
    }
  }

  return (
    <div className="App">
      {authService.isAuthenticated() && userRole && (
        <button
          onClick={switchRole}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 9999,
            padding: '12px 24px',
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          }}
        >
          🔄 Role: {userRole.toUpperCase()}
        </button>
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/citizen/*"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <CitizenApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enterprise/*"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <EnterpriseApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collector/*"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <CollectorApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={[4]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </div>
  )
}

export default App