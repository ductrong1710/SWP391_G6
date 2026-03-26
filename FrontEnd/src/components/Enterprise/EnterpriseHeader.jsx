import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import NotificationBell from "../NotificationBell";
import ProfileDropdown from "../ProfileDropdown";

const NAV_ITEMS = [
  { path: "/enterprise/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/enterprise/dispatch", label: "Dispatch", icon: "📋" },
  { path: "/enterprise/rules", label: "Rules", icon: "⚙️" },
];

const EnterpriseHeader = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
  };

  const displayName = user?.fullName || "Enterprise";

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <div className="logo">
          <div className="logo-icon">♻️</div>
          <span className="logo-text">EcoCollect</span>
        </div>
      </div>

      <nav className="navbar-center">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="navbar-right">
        <NotificationBell buttonClassName="header-bell-btn enterprise-bell-btn" />

        <ProfileDropdown
          user={user}
          roleLabel={user?.roleName || "Enterprise"}
          open={showDropdown}
          onToggle={() => setShowDropdown((prev) => !prev)}
          onProfile={() => setShowDropdown(false)}
          onSettings={() => setShowDropdown(false)}
          onLogout={handleLogout}
          wrapperClassName="ent-profile-wrapper"
          triggerClassName="ent-profile"
          avatarClassName="ent-avatar-placeholder"
          nameClassName="ent-username"
          chevronClassName="ent-chevron"
          menuClassName="ent-dropdown-menu"
          avatarContent={displayName.charAt(0).toUpperCase()}
        />
      </div>
    </header>
  );
};

export default EnterpriseHeader;
