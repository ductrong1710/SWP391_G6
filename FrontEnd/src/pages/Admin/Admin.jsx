import React, { useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import './Admin.css';
import Overview from './Overview';
import Users from './Users'; 
import Disputes from './Disputes';
import System from './System';
import Settings from './Settings';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="admin-app-container">
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="admin-main-content">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'users' && <Users />} 
        {activeTab === 'disputes' && <Disputes />} 
        {activeTab === 'system' && <System />} 
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
};

export default Admin;