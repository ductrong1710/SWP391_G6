import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import CollectorHeader from '../../components/collector/CollectorHeader';
import './CollectorApp.css';

import ActiveJob from './ActiveJob';
import TaskHistory from './TaskHistory';
import Settings from './Settings';

const TAB_COMPONENTS = {
  activeJob: ActiveJob,
  history: TaskHistory,
  settings: Settings,
};

const CollectorApp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split('/')[2] || 'activeJob';

  return (
    <div className="col-app-container">
      <CollectorHeader
        activeTab={activeTab}
        setActiveTab={(tab) => navigate(`/collector/${tab}`)}
      />
      
      <div className="col-main-content">
        <Routes>
          <Route path="/" element={<Navigate to="activeJob" replace />} />
          {Object.entries(TAB_COMPONENTS).map(([path, Component]) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<Navigate to="activeJob" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default CollectorApp;
