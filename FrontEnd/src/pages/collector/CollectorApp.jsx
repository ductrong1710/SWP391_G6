import React, { useState } from 'react';
import CollectorHeader from '../../components/CollectorHeader';
import './CollectorApp.css';

import ActiveJob from './ActiveJob';
import TaskHistory from './TaskHistory';
import Settings from './Settings';

const CollectorApp = () => {
  const [activeTab, setActiveTab] = useState('activeJob');

  return (
    <div className="col-app-container">
      <CollectorHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="col-main-content">
        {activeTab === 'activeJob' && <ActiveJob />}
        {activeTab === 'history' && <TaskHistory />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
};

export default CollectorApp;