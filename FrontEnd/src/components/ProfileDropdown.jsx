import React from "react";

const ProfileDropdown = ({
  user,
  roleLabel = "User",
  open,
  onToggle,
  onProfile,
  onLogout,
  wrapperClassName = "",
  triggerClassName = "",
  avatarClassName = "",
  nameClassName = "",
  chevronClassName = "",
  menuClassName = "",
  avatarContent = null,
}) => {
  return (
    <div className={wrapperClassName} style={{ position: "relative" }}>
      <button type="button" className={triggerClassName} onClick={onToggle}>
        <div className={avatarClassName}>{avatarContent}</div>
        <span className={nameClassName}>{user?.fullName || "User"}</span>
        <span className={chevronClassName}>▼</span>
      </button>

      {open && (
        <div className={`${menuClassName} fade-in`}>
          <div className="dd-header">
            <div className="dd-name">{user?.fullName || "User"}</div>
            <div className="dd-role">{roleLabel}</div>
          </div>

          <div className="dd-divider"></div>

          <button className="dd-item" onClick={onProfile}>
            👤 Profile
          </button>

          <div className="dd-divider"></div>

          <button className="dd-item text-red" onClick={onLogout}>
            ↪ Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
