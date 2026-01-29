import React, { useState } from 'react';

const System = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [allowReg, setAllowReg] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);

  // Dữ liệu mẫu NHIỀU HƠN để test thanh cuộn
  const logs = [
    { time: "2026-01-08 14:32:05", level: "INFO", msg: "User #4582 registered successfully" },
    { time: "2026-01-08 14:28:17", level: "INFO", msg: "Collector #89 completed job #J-2026-1245" },
    { time: "2026-01-08 14:15:42", level: "WARN", msg: "High database load detected (85% CPU)" },
    { time: "2026-01-08 14:00:00", level: "INFO", msg: "Backup completed successfully" },
    { time: "2026-01-08 13:45:33", level: "ERROR", msg: "Failed to send SMS notification to +1-555-0123" },
    { time: "2026-01-08 13:30:12", level: "INFO", msg: "Enterprise #12 updated capacity rules" },
    { time: "2026-01-08 13:22:08", level: "WARN", msg: "API rate limit reached for IP 192.168.1.45" },
    { time: "2026-01-08 13:00:00", level: "INFO", msg: "System cache cleared" },
    { time: "2026-01-08 12:45:55", level: "INFO", msg: "Dispute #D-2026-0041 resolved by Admin" },
    { time: "2026-01-08 12:30:20", level: "INFO", msg: "Payment processed for transaction #TXN-2026-0452" },
    // --- Thêm dữ liệu để test scroll ---
    { time: "2026-01-08 12:15:00", level: "INFO", msg: "Cron job 'DailyReport' started" },
    { time: "2026-01-08 12:15:05", level: "INFO", msg: "Cron job 'DailyReport' finished in 5.2s" },
    { time: "2026-01-08 12:10:44", level: "WARN", msg: "Email service response time > 2000ms" },
    { time: "2026-01-08 12:05:30", level: "INFO", msg: "User #4581 updated profile picture" },
    { time: "2026-01-08 12:00:00", level: "INFO", msg: "Hourly database snapshot taken" },
    { time: "2026-01-08 11:55:12", level: "ERROR", msg: "Connection timeout to redis-cache-01" },
    { time: "2026-01-08 11:55:15", level: "INFO", msg: "Retrying connection to redis-cache-01..." },
    { time: "2026-01-08 11:55:16", level: "INFO", msg: "Connection restored" },
    { time: "2026-01-08 11:42:09", level: "INFO", msg: "New feedback received from User #3321" },
    { time: "2026-01-08 11:30:00", level: "INFO", msg: "Garbage collection cycle completed" },
    { time: "2026-01-08 11:15:22", level: "WARN", msg: "Disk space usage on /var/log is at 80%" },
    { time: "2026-01-08 11:00:05", level: "INFO", msg: "System integrity check passed" },
    { time: "2026-01-08 10:45:11", level: "INFO", msg: "Collector #92 checked in" },
    { time: "2026-01-08 10:30:00", level: "INFO", msg: "Weather data updated for zone 'Eco City'" },
    { time: "2026-01-08 10:15:55", level: "ERROR", msg: "Invalid token signature detected from IP 10.0.0.5" },
    { time: "2026-01-08 10:00:00", level: "INFO", msg: "Server started. Uptime: 0s" },
  ];

  return (
    <div className="admin-system-page fade-in">
      <div className="admin-page-header">
        <h2>System Control Panel</h2>
        <p className="text-gray">Monitor system health and manage global configurations</p>
      </div>

      {/* 1. System Status Cards */}
      <div className="system-stats-grid">
        <div className="admin-card sys-card">
          <div className="sys-icon-box">🖥️</div>
          <div>
             <div className="sys-label">Server Status</div>
             <div className="sys-val flex-center">
               <span className="status-dot green"></span> Online
             </div>
          </div>
          <span className="sys-badge healthy">Healthy</span>
        </div>

        <div className="admin-card sys-card">
          <div className="sys-icon-box">🗄️</div>
          <div>
             <div className="sys-label">Database Latency</div>
             <div className="sys-val">24 ms</div>
          </div>
          <span className="sys-badge fast">Fast</span>
        </div>

        <div className="admin-card sys-card">
          <div className="sys-icon-box">⚡</div>
          <div>
             <div className="sys-label">API Uptime</div>
             <div className="sys-val">99.98%</div>
          </div>
          <span className="sys-badge excellent">Excellent</span>
        </div>
      </div>

      {/* 2. Global Configuration */}
      <div className="admin-card mb-4">
        <div className="card-header-border">
          <h3 className="card-title-flex">🛡️ Global Configuration</h3>
          <span className="text-gray text-sm">System-wide settings and feature toggles</span>
        </div>

        <div className="config-list">
          <div className="config-item">
            <div>
              <div className="conf-label">Maintenance Mode</div>
              <div className="conf-desc">Temporarily disable access for all users except admins</div>
            </div>
            <label className="switch-toggle">
              <input type="checkbox" checked={maintenance} onChange={() => setMaintenance(!maintenance)} />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="config-item">
            <div>
              <div className="conf-label">Allow New Registrations</div>
              <div className="conf-desc">Enable or disable new user registrations on the platform</div>
            </div>
            <label className="switch-toggle">
              <input type="checkbox" checked={allowReg} onChange={() => setAllowReg(!allowReg)} />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="config-item no-border">
            <div>
              <div className="conf-label">Auto-Assign Collectors</div>
              <div className="conf-desc">Automatically assign the nearest available collector to new requests</div>
            </div>
            <label className="switch-toggle">
              <input type="checkbox" checked={autoAssign} onChange={() => setAutoAssign(!autoAssign)} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. System Logs (Terminal Style) */}
      <div className="admin-card no-padding">
        <div className="logs-header">
           <h3 className="card-title-flex">📈 System Logs</h3>
           <button className="btn-refresh">🔄 Refresh</button>
        </div>
        
        <div className="terminal-window">
           {/* Nội dung bên trong này sẽ tự cuộn khi quá dài */}
           <div className="terminal-content">
             {logs.map((log, index) => (
               <div key={index} className="log-line">
                 <span className="log-time">🕐 {log.time}</span>
                 <span className={`log-level ${log.level.toLowerCase()}`}>[{log.level}]</span>
                 <span className="log-msg">{log.msg}</span>
               </div>
             ))}
           </div>
        </div>
      </div>

    </div>
  );
};

export default System;