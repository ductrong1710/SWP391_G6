// src/pages/Admin/Admin.jsx
import React, { useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import './Admin.css';

import Overview from './Overview';
import Users from './Users'; 
import Disputes from './Disputes';
import System from './System'; // <--- Import System component
import Settings from './Settings'; // <--- Import Settings

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="admin-app-container">
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="admin-main-content">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'users' && <Users />} 
        {activeTab === 'disputes' && <Disputes />} 
        
        {/* Kết nối tab System */}
        {activeTab === 'system' && <System />} 
        {/* Kết nối tab Settings */}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
};

export default Admin;