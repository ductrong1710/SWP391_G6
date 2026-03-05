import React, { useState } from "react";

const SwitchToggle = ({ checked, onChange, ariaLabel }) => {
  const width = 56;
  const height = 28;
  const knobSize = 22;
  const trackStyle = {
    width,
    height,
    borderRadius: height / 2,
    display: "inline-block",
    position: "relative",
    cursor: "pointer",
    transition: "background 200ms ease",
    background: checked
      ? "linear-gradient(90deg,#2dd4bf,#059669)" // mint -> green
      : "#eef2f3",
    boxShadow: checked ? "0 4px 10px rgba(37,150,100,0.12)" : "none",
  };
  const knobStyle = {
    width: knobSize,
    height: knobSize,
    borderRadius: "50%",
    background: "#fff",
    position: "absolute",
    top: (height - knobSize) / 2,
    left: checked ? width - knobSize - 3 : 3,
    transition: "left 180ms ease, box-shadow 180ms",
    boxShadow: "0 2px 6px rgba(16,24,40,0.12)",
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || "toggle"}
      onClick={() => onChange(!checked)}
      style={{
        border: "none",
        padding: 0,
        background: "transparent",
        display: "inline-block",
      }}
    >
      <span style={trackStyle}>
        <span style={knobStyle} />
      </span>
    </button>
  );
};

const System = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [allowReg, setAllowReg] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);

  // Extended sample data for scroll testing
  const logs = [
    {
      time: "2026-01-08 14:32:05",
      level: "INFO",
      msg: "User #4582 registered successfully",
    },
    {
      time: "2026-01-08 14:28:17",
      level: "INFO",
      msg: "Collector #89 completed job #J-2026-1245",
    },
    {
      time: "2026-01-08 14:15:42",
      level: "WARN",
      msg: "High database load detected (85% CPU)",
    },
    {
      time: "2026-01-08 14:00:00",
      level: "INFO",
      msg: "Backup completed successfully",
    },
    {
      time: "2026-01-08 13:45:33",
      level: "ERROR",
      msg: "Failed to send SMS notification to +1-555-0123",
    },
    {
      time: "2026-01-08 13:30:12",
      level: "INFO",
      msg: "Enterprise #12 updated capacity rules",
    },
    {
      time: "2026-01-08 13:22:08",
      level: "WARN",
      msg: "API rate limit reached for IP 192.168.1.45",
    },
    { time: "2026-01-08 13:00:00", level: "INFO", msg: "System cache cleared" },
    {
      time: "2026-01-08 12:45:55",
      level: "INFO",
      msg: "Dispute #D-2026-0041 resolved by Admin",
    },
    {
      time: "2026-01-08 12:30:20",
      level: "INFO",
      msg: "Payment processed for transaction #TXN-2026-0452",
    },
    {
      time: "2026-01-08 12:15:00",
      level: "INFO",
      msg: "Cron job 'DailyReport' started",
    },
    {
      time: "2026-01-08 12:15:05",
      level: "INFO",
      msg: "Cron job 'DailyReport' finished in 5.2s",
    },
    {
      time: "2026-01-08 12:10:44",
      level: "WARN",
      msg: "Email service response time > 2000ms",
    },
    {
      time: "2026-01-08 12:05:30",
      level: "INFO",
      msg: "User #4581 updated profile picture",
    },
    {
      time: "2026-01-08 12:00:00",
      level: "INFO",
      msg: "Hourly database snapshot taken",
    },
    {
      time: "2026-01-08 11:55:12",
      level: "ERROR",
      msg: "Connection timeout to redis-cache-01",
    },
    {
      time: "2026-01-08 11:55:15",
      level: "INFO",
      msg: "Retrying connection to redis-cache-01...",
    },
    { time: "2026-01-08 11:55:16", level: "INFO", msg: "Connection restored" },
    {
      time: "2026-01-08 11:42:09",
      level: "INFO",
      msg: "New feedback received from User #3321",
    },
    {
      time: "2026-01-08 11:30:00",
      level: "INFO",
      msg: "Garbage collection cycle completed",
    },
    {
      time: "2026-01-08 11:15:22",
      level: "WARN",
      msg: "Disk space usage on /var/log is at 80%",
    },
    {
      time: "2026-01-08 11:00:05",
      level: "INFO",
      msg: "System integrity check passed",
    },
    {
      time: "2026-01-08 10:45:11",
      level: "INFO",
      msg: "Collector #92 checked in",
    },
    {
      time: "2026-01-08 10:30:00",
      level: "INFO",
      msg: "Weather data updated for zone 'Eco City'",
    },
    {
      time: "2026-01-08 10:15:55",
      level: "ERROR",
      msg: "Invalid token signature detected from IP 10.0.0.5",
    },
    {
      time: "2026-01-08 10:00:00",
      level: "INFO",
      msg: "Server started. Uptime: 0s",
    },
  ];

  return (
    <div className="admin-system-page fade-in" style={{ paddingBottom: 40 }}>
      <div className="admin-page-header">
        <h2>System Control Panel</h2>
        <p className="text-gray">
          Monitor system health and manage global configurations
        </p>
      </div>

      {/* 1. System Status Cards */}
      <div
        className="system-stats-grid"
        style={{ display: "flex", gap: 16, marginBottom: 20 }}
      >
        <div
          className="admin-card sys-card"
          style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}
        >
          <div className="sys-icon-box" style={{ fontSize: 22 }}>
            🖥️
          </div>
          <div style={{ flex: 1 }}>
            <div
              className="sys-label"
              style={{ fontSize: 13, color: "#475569" }}
            >
              Server Status
            </div>
            <div
              className="sys-val"
              style={{
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 8,
                  background: "#10b981",
                  display: "inline-block",
                }}
              ></span>
              Online
            </div>
          </div>
          <span
            className="sys-badge healthy"
            style={{
              background: "#e6f6ef",
              color: "#059669",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            Healthy
          </span>
        </div>

        <div
          className="admin-card sys-card"
          style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}
        >
          <div className="sys-icon-box" style={{ fontSize: 22 }}>
            🗄️
          </div>
          <div style={{ flex: 1 }}>
            <div
              className="sys-label"
              style={{ fontSize: 13, color: "#475569" }}
            >
              Database Latency
            </div>
            <div className="sys-val" style={{ fontWeight: 700 }}>
              24 ms
            </div>
          </div>
          <span
            className="sys-badge fast"
            style={{
              background: "#ecfeff",
              color: "#0891b2",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            Fast
          </span>
        </div>

        <div
          className="admin-card sys-card"
          style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}
        >
          <div className="sys-icon-box" style={{ fontSize: 22 }}>
            ⚡
          </div>
          <div style={{ flex: 1 }}>
            <div
              className="sys-label"
              style={{ fontSize: 13, color: "#475569" }}
            >
              API Uptime
            </div>
            <div className="sys-val" style={{ fontWeight: 700 }}>
              99.98%
            </div>
          </div>
          <span
            className="sys-badge excellent"
            style={{
              background: "#ecfdf5",
              color: "#16a34a",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            Excellent
          </span>
        </div>
      </div>

      {/* 2. Global Configuration */}
      <div className="admin-card mb-4" style={{ padding: 20 }}>
        <div className="card-header-border" style={{ marginBottom: 16 }}>
          <h3
            className="card-title-flex"
            style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}
          >
            🛡️ Global Configuration
          </h3>
          <span
            className="text-gray text-sm"
            style={{ display: "block", marginTop: 6 }}
          >
            System-wide settings and feature toggles
          </span>
        </div>

        <div className="config-list" style={{ borderTop: "1px solid #eef2f7" }}>
          <div
            className="config-item"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 0",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div>
              <div className="conf-label" style={{ fontWeight: 600 }}>
                Maintenance Mode
              </div>
              <div className="conf-desc text-gray" style={{ marginTop: 6 }}>
                Temporarily disable access for all users except admins
              </div>
            </div>
            <div>
              <SwitchToggle
                checked={maintenance}
                onChange={setMaintenance}
                ariaLabel="Maintenance mode toggle"
              />
            </div>
          </div>

          <div
            className="config-item"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 0",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div>
              <div className="conf-label" style={{ fontWeight: 600 }}>
                Allow New Registrations
              </div>
              <div className="conf-desc text-gray" style={{ marginTop: 6 }}>
                Enable or disable new user registrations on the platform
              </div>
            </div>
            <div>
              <SwitchToggle
                checked={allowReg}
                onChange={setAllowReg}
                ariaLabel="Allow new registrations toggle"
              />
            </div>
          </div>

          <div
            className="config-item no-border"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 0",
            }}
          >
            <div>
              <div className="conf-label" style={{ fontWeight: 600 }}>
                Auto-Assign Collectors
              </div>
              <div className="conf-desc text-gray" style={{ marginTop: 6 }}>
                Automatically assign the nearest available collector to new
                requests
              </div>
            </div>
            <div>
              <SwitchToggle
                checked={autoAssign}
                onChange={setAutoAssign}
                ariaLabel="Auto assign collectors toggle"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. System Logs (Terminal Style) */}
      <div className="admin-card no-padding" style={{ padding: 20 }}>
        <div
          className="logs-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3 className="card-title-flex" style={{ margin: 0 }}>
            📈 System Logs
          </h3>
          <button
            type="button"
            onClick={() => window.location.reload()}
            title="Refresh logs"
            style={{
              background: "linear-gradient(90deg,#3b82f6,#2563eb)",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 6px 18px rgba(37,99,235,0.12)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🔄 Refresh
          </button>
        </div>

        <div
          className="terminal-window"
          style={{
            background: "#0f172a",
            borderRadius: 8,
            color: "#e6eef2",
            padding: 12,
            minHeight: 160,
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          {/* Content inside will auto-scroll when too long */}
          <div
            className="terminal-content"
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Segoe UI Mono", monospace',
              fontSize: 13,
            }}
          >
            {logs.map((log, index) => (
              <div
                key={index}
                className="log-line"
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.02)",
                }}
              >
                <span
                  className="log-time"
                  style={{ color: "#94a3b8", minWidth: 170, fontSize: 12 }}
                >
                  🕐 {log.time}
                </span>
                <span
                  className={`log-level ${log.level.toLowerCase()}`}
                  style={{
                    fontWeight: 700,
                    color:
                      log.level === "ERROR"
                        ? "#ff7b7b"
                        : log.level === "WARN"
                        ? "#f59e0b"
                        : "#34d399",
                    minWidth: 80,
                  }}
                >
                  [{log.level}]
                </span>
                <span className="log-msg" style={{ color: "#e6eef2" }}>
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default System;
