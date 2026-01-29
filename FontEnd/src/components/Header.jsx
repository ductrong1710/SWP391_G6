// src/components/Header.jsx
import React, { useState } from 'react';

const Header = ({ activeTab, setActiveTab }) => {
  // State để bật/tắt menu con
  const [showDropdown, setShowDropdown] = useState(false);

  // Hàm chuyển tab và đóng menu
  const handleNavigation = (tabName) => {
    setActiveTab(tabName);
    setShowDropdown(false);
  };

  return (
    <header className="header">
      {/* 1. Logo Brand */}
      <div className="brand" onClick={() => handleNavigation('home')} style={{cursor: 'pointer'}}>
        <span className="logo-icon">🍃</span> EcoCollect
      </div>

      {/* 2. Navigation Menu */}
      <nav className="nav-links">
        <button 
          className={activeTab === 'home' ? 'active' : ''} 
          onClick={() => handleNavigation('home')}
        >
          🏠 Home
        </button>
        <button 
          className={activeTab === 'report' ? 'active' : ''} 
          onClick={() => handleNavigation('report')}
        >
          📄 Create Report
        </button>
        <button 
        className={activeTab === 'rewards' ? 'active' : ''} 
        onClick={() => handleNavigation('rewards')}  >
        🎁 Rewards
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''} 
        onClick={() => handleNavigation('history')}  >
          ⏱ History</button>
      </nav>

      {/* 3. User Info & Dropdown */}
      <div className="user-info">
        <span className="points-badge">🍃 2,450 pts</span>
        
        {/* Khu vực Avatar có Dropdown */}
        <div className="user-dropdown-wrapper" style={{position: 'relative'}}>
          <div 
            className="user-avatar" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Jane Doe ▾
          </div>

          {/* Menu thả xuống */}
          {showDropdown && (
            <div className="custom-dropdown">
              <div className="dropdown-header-info">
                <div className="dd-name">Jane Doe</div>
                <div className="dd-role">Citizen</div>
              </div>
              
              <ul className="dropdown-list">
                {/* Mục Profile đang được highlight màu xanh giống ảnh mẫu */}
                <li 
                  className="dropdown-item active" 
                  onClick={() => handleNavigation('settings')}
                >
                  👤 Profile
                </li>
                <li 
                  className="dropdown-item" 
                  onClick={() => handleNavigation('settings')}
                >
                  ⚙️ Settings
                </li>
                
                <div className="dropdown-divider"></div>
                
                <li className="dropdown-item text-red">
                  ↪️ Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;