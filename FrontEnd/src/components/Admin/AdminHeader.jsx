import React, { useState } from "react";
import { authService } from "../../services/authService";
import NotificationBell from "../NotificationBell";
import ProfileDropdown from "../ProfileDropdown";

const MENU_ITEMS = [
  { id: "overview", label: "Overview", icon: "⊞" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "disputes", label: "Disputes", icon: "⚠️" },
  { id: "system", label: "System", icon: "⚙️" },
];

const AdminHeader = ({ activeTab, setActiveTab }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="admin-header-bar">
      <div className="admin-brand">
        <div className="admin-logo-icon">🍃</div>
        <span className="admin-brand-name">EcoCollect</span>
      </div>

      <div className="admin-nav">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="icon">{item.icon}</span> {item.label}
          </button>
        ))}
      </div>

      <div className="admin-header-actions">
        <NotificationBell buttonClassName="header-bell-btn" />

        <ProfileDropdown
          user={user}
          roleLabel="Administrator"
          open={showDropdown}
          onToggle={() => setShowDropdown((prev) => !prev)}
          onProfile={() => {
            setActiveTab("settings");
            setShowDropdown(false);
          }}
          onSettings={() => {
            setActiveTab("settings");
            setShowDropdown(false);
          }}
          onLogout={handleLogout}
          wrapperClassName="admin-profile-wrapper"
          triggerClassName="admin-profile"
          avatarClassName="admin-avatar"
          nameClassName="admin-username"
          chevronClassName="admin-chevron"
          menuClassName="admin-dropdown"
          avatarContent={(user?.fullName || "A").charAt(0).toUpperCase()}
        />
      </div>
    </div>
  );
};

export default AdminHeader;
