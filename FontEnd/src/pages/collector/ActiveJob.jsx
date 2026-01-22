import React, { useState } from 'react';

const ActiveJob = () => {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="col-active-job fade-in">
      {/* Page Header with Toggle */}
      <div className="col-page-header">
        <div>
          <h2>Active Job</h2>
          <p className="text-gray">Current collection assignment</p>
        </div>
        <div className="status-toggle">
          <span className={`status-label ${isOnline ? 'text-green' : 'text-gray'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <label className="switch">
            <input type="checkbox" checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      {/* Job Card */}
      <div className="job-card">
        <div className="job-header">
          <h3>Job #JOB-2026-0108</h3>
          <span className="badge-assigned">Assigned</span>
        </div>

        <div className="customer-info">
          <div className="info-row">
            <span className="icon-marker">📍</span>
            <div>
              <strong>John Doe</strong>
              <div className="text-gray text-sm">123 Green Street, Eco City, EC 12345</div>
            </div>
          </div>
          <div className="info-row mt-2">
            <span className="icon-phone">📞</span>
            <div className="text-green font-bold">+1 (555) 123-4567</div>
          </div>
        </div>

        <div className="job-stats-grid">
          <div className="stat-box">
            <div className="label">Waste Type</div>
            <div className="val">Plastic</div>
          </div>
          <div className="stat-box">
            <div className="label">Est. Weight</div>
            <div className="val">5.2 kg</div>
          </div>
          <div className="stat-box">
            <div className="label">Distance</div>
            <div className="val">2.3 km</div>
          </div>
          <div className="stat-box">
            <div className="label">ETA</div>
            <div className="val">8 mins</div>
          </div>
        </div>

        <div className="note-box">
          <div className="note-title">📄 Customer Note</div>
          <div className="note-content">Please use the back entrance. The waste is in blue bags near the garage.</div>
        </div>

        <button className="btn-outline-map">🚀 Open in Maps</button>
      </div>

      {/* Bottom Action Button */}
      <div className="bottom-action-bar">
        <button className="btn-start-trip">Start Trip</button>
      </div>
    </div>
  );
};

export default ActiveJob;