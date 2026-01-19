// src/components/CollectorHeader.jsx
import React, { useState } from 'react';

const CollectorHeader = ({ activeTab, setActiveTab }) => {
  // State để bật tắt menu
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    // Giả lập logout: reload lại trang
    window.location.reload();
  };

  return (
    <div className="col-header-bar">
      <div className="col-brand">
        <div className="col-logo-icon">🍃</div>
        <span className="col-brand-name">EcoCollect</span>
      </div>

      <div className="col-nav">
        <button 
          className={`col-nav-item ${activeTab === 'activeJob' ? 'active' : ''}`}
          onClick={() => setActiveTab('activeJob')}
        >
          <span className="icon">⊞</span> Active Job
        </button>
        <button 
          className={`col-nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="icon">🕒</span> Task History
        </button>
      </div>

      {/* --- PHẦN PROFILE & DROPDOWN --- */}
      <div className="col-profile-wrapper" style={{ position: 'relative' }}>
        
        {/* Nút bấm vào Avatar/Tên */}
        <div 
          className="col-profile" 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="col-avatar-placeholder"></div>
          <span className="col-username">Mike Wilson</span>
          <span className="col-chevron">▼</span>
        </div>

        {/* Menu Dropdown (Chỉ hiện khi showDropdown = true) */}
        {showDropdown && (
          <div className="col-dropdown-menu fade-in">
             {/* Header của Menu */}
             <div className="dd-header">
                <div className="dd-name">Mike Wilson</div>
                <div className="dd-role">Collector</div>
             </div>
             
             <div className="dd-divider"></div>
             
             {/* Các mục chọn */}
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

export default CollectorHeader;