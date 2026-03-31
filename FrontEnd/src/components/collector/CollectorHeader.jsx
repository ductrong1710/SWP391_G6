import React, { useState } from "react";
import { authService } from "../../services/authService";
import NotificationBell from "../NotificationBell";
import ProfileDropdown from "../ProfileDropdown";

const CollectorHeader = ({ activeTab, setActiveTab }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="col-header-bar">
      <div className="col-brand">
        <div className="col-logo-icon">🍃</div>
        <span className="col-brand-name">EcoCollect</span>
      </div>

      <div className="col-nav">
        <button
          className={`col-nav-item ${activeTab === "activeJob" ? "active" : ""}`}
          onClick={() => setActiveTab("activeJob")}
        >
          <span className="icon">⊞</span> Active Job
        </button>
        <button
          className={`col-nav-item ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <span className="icon">🕒</span> Task History
        </button>
      </div>

      <div className="col-header-actions">
        <NotificationBell buttonClassName="header-bell-btn" />

        <ProfileDropdown
          user={user}
          roleLabel="Collector"
          open={showDropdown}
          onToggle={() => setShowDropdown((prev) => !prev)}
          onProfile={() => {
            setActiveTab("settings");
            setShowDropdown(false);
          }}
          onLogout={handleLogout}
          wrapperClassName="col-profile-wrapper"
          triggerClassName="col-profile"
          avatarClassName="col-avatar-placeholder"
          nameClassName="col-username"
          chevronClassName="col-chevron"
          menuClassName="col-dropdown-menu"
          avatarContent={(user?.fullName || "C").charAt(0).toUpperCase()}
        />
      </div>
    </div>
  );
};

export default CollectorHeader;
