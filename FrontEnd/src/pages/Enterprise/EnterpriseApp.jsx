import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Dispatch from './Dispatch';
import Rules from './Rules';
import Analytics from './Analytics';
import './EnterpriseApp.css';

const EnterpriseApp = () => {
  const location = useLocation();
  const userName = localStorage.getItem('userName') || 'GreenWaste Inc.';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const navItems = [
    { path: '/enterprise/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/enterprise/dispatch', icon: '📋', label: 'Dispatch' },
    { path: '/enterprise/rules', icon: '⚙️', label: 'Rules' },
    { path: '/enterprise/analytics', icon: '📈', label: 'Analytics' }
  ];

  return (
    <div className="enterprise-app">
      {/* TOP NAVIGATION BAR */}
      <header className="top-navbar">
        <div className="navbar-left">
          <div className="logo">
            <div className="logo-icon">♻️</div>
            <span className="logo-text">EcoCollect</span>
          </div>
        </div>

        <nav className="navbar-center">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="navbar-right">
          <div className="user-profile">
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-role">Enterprise</div>
            </div>
            <div className="user-avatar">{userName.charAt(0)}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
          <button className="mobile-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/enterprise/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  );
};

export default EnterpriseApp;