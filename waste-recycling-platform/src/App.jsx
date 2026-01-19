// src/App.jsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'

import CitizenApp from './pages/citizen/CitizenApp'
import EnterpriseApp from './pages/Enterprise/EnterpriseApp'
import CollectorApp from './pages/collector/CollectorApp'
import Admin from './pages/Admin/Admin'

function App() {
  const [userRole, setUserRole] = useState('admin')
  const navigate = useNavigate()

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

  // khi reload, đảm bảo URL khớp role
  useEffect(() => {
    navigate(`/${userRole}`)
  }, [])

  return (
    <div className="App">
      <button
        onClick={switchRole}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 9999,
          padding: '12px 24px',
          background: '#333',
          color: '#123',
          border: 'none',
          borderRadius: '30px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        }}
      >
        🔄 Role: {userRole.toUpperCase()}
      </button>

      <Routes>
        <Route path="/citizen" element={<CitizenApp />} />
        <Route path="/enterprise" element={<EnterpriseApp />} />
        <Route path="/collector" element={<CollectorApp />} />
        <Route path="/admin" element={<Admin />} />

        {/* fallback */}
        <Route path="*" element={<CitizenApp />} />
      </Routes>
    </div>
  )
}

export default App
