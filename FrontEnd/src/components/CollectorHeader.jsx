// src/components/CollectorHeader.jsx
import React, { useState } from 'react';
import { authService } from '../services/authService';

const CollectorHeader = ({ activeTab, setActiveTab }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout(); // Sử dụng authService
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

      <div className="col-profile-wrapper" style={{ position: 'relative' }}>
        <div 
          className="col-profile" 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="col-avatar-placeholder"></div>
          <span className="col-username">{user?.fullName || 'Collector'}</span>
          <span className="col-chevron">▼</span>
        </div>

        {showDropdown && (
          <div className="col-dropdown-menu fade-in">
             <div className="dd-header">
                <div className="dd-name">{user?.fullName || 'Collector'}</div>
                <div className="dd-role">Collector</div>
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

export default CollectorHeader;