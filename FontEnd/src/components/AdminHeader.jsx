// src/components/AdminHeader.jsx
import React, { useState } from 'react';

const AdminHeader = ({ activeTab, setActiveTab }) => {
  // State để bật tắt menu
  const [showDropdown, setShowDropdown] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '⊞' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'disputes', label: 'Disputes', icon: '⚠️' },
    { id: 'system', label: 'System', icon: '⚙️' },
  ];

  const handleLogout = () => {
    // Giả lập logout
    window.location.reload(); 
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

      {/* --- PHẦN PROFILE & DROPDOWN --- */}
      <div className="admin-profile-wrapper" style={{ position: 'relative' }}>
        
        {/* Nút bấm vào Avatar */}
        <div 
          className="admin-profile" 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="admin-avatar"></div>
          <span className="admin-username">Admin</span>
          <span className="admin-chevron">▼</span>
        </div>
        
        {/* Menu Dropdown (Chỉ hiện khi showDropdown = true) */}
        {showDropdown && (
          <div className="admin-dropdown fade-in">
             {/* Header Info */}
             <div className="dd-header">
                <div className="dd-name">System Admin</div>
                <div className="dd-role">Super Administrator</div>
             </div>
             
             <div className="dd-divider"></div>

             {/* Các nút chọn */}
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