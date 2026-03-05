// src/components/EnterpriseHeader.jsx
import React, { useState } from 'react';
import { authService } from '../services/authService';

const EnterpriseHeader = ({ activeTab, setActiveTab }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = authService.getCurrentUser();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'dispatch', label: 'Dispatch', icon: '🗺️' },
    { id: 'rules', label: 'Rules', icon: '⚙️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  const handleLogout = () => {
    authService.logout(); // Sử dụng authService
  };

  return (
    <div className="ent-header-bar">
      <div className="ent-brand">
        <div className="ent-logo-icon">🍃</div>
        <span className="ent-brand-name">EcoCollect</span>
      </div>

      <div className="ent-nav">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            className={`ent-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="ent-profile-wrapper" style={{ position: 'relative' }}>
        <div 
          className="ent-profile" 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="ent-avatar-placeholder"></div>
          <span className="ent-username">{user?.fullName || 'Enterprise'}</span>
          <span className="ent-chevron">▼</span>
        </div>

        {showDropdown && (
          <div className="ent-dropdown-menu fade-in">
            <div className="dropdown-header-info">
              <div className="dd-name">{user?.fullName || 'Enterprise'}</div>
              <div className="dd-role">Enterprise Account</div>
            </div>
            
            <div className="dropdown-divider"></div>

            <button 
              className="dropdown-item" 
              onClick={() => { setActiveTab('settings'); setShowDropdown(false); }}
            >
              👤 Profile
            </button>
            <button 
              className="dropdown-item" 
              onClick={() => { setActiveTab('settings'); setShowDropdown(false); }}
            >
              ⚙️ Settings
            </button>

            <div className="dropdown-divider"></div>

            <button className="dropdown-item text-red" onClick={handleLogout}>
              ↪ Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseHeader;