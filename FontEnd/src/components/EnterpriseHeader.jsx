// src/components/EnterpriseHeader.jsx
import React, { useState } from 'react';

const EnterpriseHeader = ({ activeTab, setActiveTab }) => {
  // State quản lý việc hiện/ẩn menu dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'dispatch', label: 'Dispatch', icon: '🗺️' },
    { id: 'rules', label: 'Rules', icon: '⚙️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  const handleLogout = () => {
    alert("Logging out...");
    // Thêm logic logout thật ở đây (ví dụ: chuyển trang, xóa token)
    window.location.reload(); 
  };

  return (
    <div className="ent-header-bar">
      {/* 1. Logo Brand */}
      <div className="ent-brand">
        <div className="ent-logo-icon">🍃</div>
        <span className="ent-brand-name">EcoCollect</span>
      </div>

      {/* 2. Menu Navigation */}
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

      {/* 3. User Profile Dropdown */}
      <div className="ent-profile-wrapper" style={{ position: 'relative' }}>
        
        {/* Phần nút bấm để mở menu */}
        <div 
          className="ent-profile" 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="ent-avatar-placeholder"></div>
          <span className="ent-username">GreenWaste Inc.</span>
          <span className="ent-chevron">▼</span>
        </div>

        {/* MENU DROPDOWN (Chỉ hiện khi showDropdown = true) */}
        {showDropdown && (
          <div className="ent-dropdown-menu fade-in">
            {/* Header của menu */}
            <div className="dropdown-header-info">
              <div className="dd-name">GreenWaste Inc.</div>
              <div className="dd-role">Enterprise Account</div>
            </div>
            
            <div className="dropdown-divider"></div>

            {/* Các mục chọn */}
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