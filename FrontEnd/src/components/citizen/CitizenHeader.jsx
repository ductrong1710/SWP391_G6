import React, { useEffect, useState } from "react";
import { authService } from "../../services/authService";
import rewardService from "../../services/rewardService";
import NotificationBell from "../NotificationBell";
import ProfileDropdown from "../ProfileDropdown";

const CitizenHeader = ({ activeTab, setActiveTab }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [points, setPoints] = useState(0);
  const user = authService.getCurrentUser();

  useEffect(() => {
    let mounted = true;

    const loadPoints = async () => {
      try {
        const balance = await rewardService.getMyBalance();
        if (mounted) {
          setPoints(balance.totalPoints);
        }
      } catch {
        if (mounted) {
          setPoints(0);
        }
      }
    };

    loadPoints();
    return () => {
      mounted = false;
    };
  }, []);

  const handleNavigation = (tabName) => {
    setActiveTab(tabName);
    setShowDropdown(false);
  };

  const handleLogout = () => {
    authService.logout();
  };

  const initials = (user?.fullName || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="header">
      <div
        className="brand"
        onClick={() => handleNavigation("home")}
        style={{ cursor: "pointer" }}
      >
        <span className="logo-icon">🍃</span> EcoCollect
      </div>

      <nav className="nav-links">
        <button
          className={activeTab === "home" ? "active" : ""}
          onClick={() => handleNavigation("home")}
        >
          Home
        </button>
        <button
          className={activeTab === "report" ? "active" : ""}
          onClick={() => handleNavigation("report")}
        >
          Create Report
        </button>
        <button
          className={activeTab === "rewards" ? "active" : ""}
          onClick={() => handleNavigation("rewards")}
        >
          Rewards
        </button>
        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => handleNavigation("history")}
        >
          History
        </button>
      </nav>

      <div className="user-info">
        <NotificationBell buttonClassName="header-bell-btn" />
        <span className="points-badge">🍃 {points} pts</span>

        <ProfileDropdown
          user={user}
          roleLabel={user?.roleName || "Citizen"}
          open={showDropdown}
          onToggle={() => setShowDropdown((prev) => !prev)}
          onProfile={() => handleNavigation("settings")}
          onSettings={() => handleNavigation("settings")}
          onLogout={handleLogout}
          wrapperClassName="user-dropdown-wrapper"
          triggerClassName="user-profile-trigger"
          avatarClassName="user-avatar-circle"
          nameClassName="user-profile-name"
          chevronClassName="user-profile-chevron"
          menuClassName="custom-dropdown"
          avatarContent={initials}
        />
      </div>
    </header>
  );
};

export default CitizenHeader;
