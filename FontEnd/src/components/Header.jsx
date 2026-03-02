// src/components/Header.jsx
import React, { useState } from 'react';
import { authService } from '../services/authService';

const Header = ({ activeTab, setActiveTab }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = authService.getCurrentUser(); // Lấy thông tin user

  const handleNavigation = (tabName) => {
    setActiveTab(tabName);
    setShowDropdown(false);
  };

  const handleLogout = () => {
    authService.logout(); // Sử dụng authService
  };

  return (
    <header className="header">
      <div className="brand" onClick={() => handleNavigation('home')} style={{cursor: 'pointer'}}>
        <span className="logo-icon">🍃</span> EcoCollect
      </div>

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
          onClick={() => handleNavigation('rewards')}
        >
          🎁 Rewards
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''} 
          onClick={() => handleNavigation('history')}
        >
          ⏱ History
        </button>
      </nav>

      <div className="user-info">
        <span className="points-badge">🍃 2,450 pts</span>
        
        <div className="user-dropdown-wrapper" style={{position: 'relative'}}>
          <div 
            className="user-avatar" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {user?.fullName || 'User'} ▾
          </div>

          {showDropdown && (
            <div className="custom-dropdown">
              <div className="dropdown-header-info">
                <div className="dd-name">{user?.fullName || 'User'}</div>
                <div className="dd-role">Citizen</div>
              </div>
              
              <ul className="dropdown-list">
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
                
                <li className="dropdown-item text-red" onClick={handleLogout}>
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