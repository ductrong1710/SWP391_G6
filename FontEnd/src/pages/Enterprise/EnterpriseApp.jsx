// src/pages/Enterprise/EnterpriseApp.jsx
import React, { useState } from 'react';
import EnterpriseHeader from '../../components/EnterpriseHeader';
import './EnterpriseApp.css';

import Dashboard from './Dashboard';
import Dispatch from './Dispatch';
import Rules from './Rules';
import Analytics from './Analytics';
import Settings from './Settings'; // <--- 1. Import Settings

const EnterpriseApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="enterprise-app-container">
      <EnterpriseHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="enterprise-main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'dispatch' && <Dispatch />}
        {activeTab === 'rules' && <Rules />}
        {activeTab === 'analytics' && <Analytics />}
        
        {/* 2. Thêm điều kiện hiển thị Settings */}
        {activeTab === 'settings' && <Settings />} 
      </div>
    </div>
  );
};

export default EnterpriseApp;