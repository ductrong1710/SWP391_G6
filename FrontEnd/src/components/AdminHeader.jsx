// src/components/AdminHeader.jsx
import React, { useState } from 'react';
import { authService } from '../services/authService';

const AdminHeader = ({ activeTab, setActiveTab }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = authService.getCurrentUser();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '⊞' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'disputes', label: 'Disputes', icon: '⚠️' },
    { id: 'system', label: 'System', icon: '⚙️' },
  ];

  const handleLogout = () => {
    authService.logout(); // Sử dụng authService
  };

  return (
    <div className="admin-header-bar">
      <div className="admin-brand">
        <div className="admin-logo-icon">🍃</div>
        <span className="admin-brand-name">EcoCollect</span>
      </div>

      <div className="admin-nav">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="icon">{item.icon}</span> {item.label}
          </button>
        ))}
      </div>

      <div className="admin-profile-wrapper" style={{ position: 'relative' }}>
        <div 
          className="admin-profile" 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="admin-avatar"></div>
          <span className="admin-username">{user?.fullName || 'Admin'}</span>
          <span className="admin-chevron">▼</span>
        </div>
        
        {showDropdown && (
          <div className="admin-dropdown fade-in">
             <div className="dd-header">
                <div className="dd-name">{user?.fullName || 'Admin'}</div>
                <div className="dd-role">Administrator</div>
             </div>
             
             <div className="dd-divider"></div>

             <button 
               className="dd-item"
               onClick={() => { setActiveTab('settings'); setShowDropdown(false); }}
             >
               👤 Profile
             </button>
             <button 
               className="dd-item"
               onClick={() => { setActiveTab('settings'); setShowDropdown(false); }}
             >
               ⚙️ Settings
             </button>

             <div className="dd-divider"></div>

             <button className="dd-item text-red" onClick={handleLogout}>
               ↪ Logout
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;