// src/pages/Admin/Overview.jsx
import React from 'react';

const Overview = () => {
  return (
    <div className="admin-overview fade-in">
      <div className="admin-page-header">
        <h2>Admin Dashboard</h2>
        <p className="text-gray">System overview and key metrics</p>
      </div>

      {/* 1. Stats Grid (6 thẻ) */}
      <div className="admin-stats-grid">
        <StatCard title="Total Citizens" value="12,485" trend="+245 this week" icon="👥" />
        <StatCard title="Enterprises" value="48" trend="+3 this month" icon="🏢" />
        <StatCard title="Collectors" value="156" trend="+12 this week" icon="🚚" />
        <StatCard title="Open Disputes" value="8" trend="-3 this week" icon="⚠️" isWarning />
        <StatCard title="Total Collected" value="1,245 tons" trend="+15% vs last month" icon="⚖️" />
        <StatCard title="Platform Growth" value="24.5%" trend="+5.2% vs last quarter" icon="📈" />
      </div>

      {/* 2. Bottom Section (2 cột) */}
      <div className="admin-bottom-grid">
        
        {/* Recent Activity */}
        <div className="admin-card">
          <h3 className="card-title">Recent Activity</h3>
          <div className="activity-list">
            <ActivityItem 
              title="New enterprise registered" 
              desc="EcoRecycle Pro" 
              time="2 hours ago" 
              color="green" 
            />
            <ActivityItem 
              title="Dispute resolved" 
              desc="Case #D-2026-0042" 
              time="4 hours ago" 
              color="blue" 
            />
            <ActivityItem 
              title="Collector verified" 
              desc="David Martinez" 
              time="6 hours ago" 
              color="orange" 
            />
            <ActivityItem 
              title="System update completed" 
              desc="v2.4.1 deployed" 
              time="1 day ago" 
              color="gray" 
            />
          </div>
        </div>

        {/* Pending Actions */}
        <div className="admin-card">
          <h3 className="card-title">Pending Actions</h3>
          <div className="action-list">
             <ActionItem label="Review enterprise application" count={2} color="red" />
             <ActionItem label="Resolve user disputes" count={5} color="orange" />
             <ActionItem label="Verify new collectors" count={8} color="green" />
             <ActionItem label="System maintenance" count={1} color="teal" />
          </div>
        </div>

      </div>
    </div>
  );
};

// Component con: Thẻ thống kê
const StatCard = ({ title, value, trend, icon, isWarning }) => (
  <div className="admin-card stat-card">
    <div className="stat-left">
      <div className="stat-title">{title}</div>
      <div className="stat-val">{value}</div>
      <div className={`stat-trend ${isWarning ? 'text-red' : 'text-green'}`}>{trend}</div>
    </div>
    <div className={`stat-icon ${isWarning ? 'icon-warn' : ''}`}>{icon}</div>
  </div>
);

// Component con: Dòng hoạt động
const ActivityItem = ({ title, desc, time, color }) => (
  <div className="activity-item">
    <div className="act-content">
      <div className="act-title">{title}</div>
      <div className="act-desc">{desc}</div>
    </div>
    <div className="act-time">{time}</div>
  </div>
);

// Component con: Dòng hành động
const ActionItem = ({ label, count, color }) => (
  <div className="action-item">
     <div className="action-left">
        <span className={`dot bg-${color}`}></span>
        <span className="action-label">{label}</span>
     </div>
     <span className="action-count">{count}</span>
  </div>
);

export default Overview;