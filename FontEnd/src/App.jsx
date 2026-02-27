import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'

// Import các Layout/App chính
import CitizenApp from './pages/citizen/CitizenApp'
import EnterpriseApp from './pages/Enterprise/EnterpriseApp'
import CollectorApp from './pages/collector/CollectorApp'
import Admin from './pages/Admin/Admin'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ProtectedRoute from './components/ProtectedRoute'
import { authService } from './services/authService'

// Import các trang con của Citizen (Bạn cần import đủ nhé)
import CreateReport from './pages/citizen/CreateReport'
import Dashboard from './pages/citizen/Dashboard'
import History from './pages/citizen/History'
import Rewards from './pages/citizen/Rewards'
import Settings from './pages/citizen/Settings'



function App() {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Kiểm tra authentication khi load app
  useEffect(() => {
    const currentPath = window.location.pathname
    const isAuth = authService.isAuthenticated()

    if (!isAuth && currentPath !== '/login' && currentPath !== '/register') {
      navigate('/login')
    }
    setLoading(false)
  }, [navigate])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="App">
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