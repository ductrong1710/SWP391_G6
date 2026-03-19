import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/Admin/AdminHeader';
import './Admin.css';
import Overview from './Overview';
import Users from './Users'; 
import Disputes from './Disputes';
import System from './System';
import Settings from './Settings';

const TAB_COMPONENTS = {
  overview: Overview,
  users: Users,
  disputes: Disputes,
  system: System,
  settings: Settings,
};

const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split('/')[2] || 'overview';

  return (
    <div className="admin-app-container">
      <AdminHeader
        activeTab={activeTab}
        setActiveTab={(tab) => navigate(`/admin/${tab}`)}
      />
      
      <div className="admin-main-content">
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          {Object.entries(TAB_COMPONENTS).map(([path, Component]) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
