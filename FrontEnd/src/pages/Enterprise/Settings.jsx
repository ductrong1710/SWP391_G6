import React, { useState } from "react";
import authService from "../../services/authService";
import SettingsTabs from "../../components/SettingsTabs";

const Settings = () => {
  const [subTab, setSubTab] = useState("general");
  const user = authService.getCurrentUser();

  return (
    <div className="col-page-container fade-in">
      <div className="col-page-header">
        <div>
          <h2>Settings</h2>
          <p className="text-gray">Manage your account preferences and security</p>
        </div>
      </div>

      {/* ĐÃ FIX: Ép z-index nổi lên trên cùng để không bị che khuất */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <SettingsTabs activeTab={subTab} onChange={setSubTab} />
      </div>

      {subTab === "general" && (
        <div className="settings-card">
          <div className="card-header-simple">
            <h3>Profile Information</h3>
            <p className="text-gray">Update your personal details and profile picture</p>
          </div>

          <div className="profile-section">
            <div className="avatar-large">
              <span className="camera-icon">📷</span>
            </div>
            <div className="photo-info">
              <strong>Profile Photo</strong>
              <p>JPG, PNG or GIF. Max 2MB</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-input" defaultValue={user?.fullName || ""} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                defaultValue={user?.email || ""}
                disabled
                style={{ backgroundColor: "#f3f4f6" }}
              />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <input type="text" className="form-input disabled" value={user?.roleName || "Collector"} disabled />
            </div>
            <div className="form-actions">
              <button className="btn-save">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {subTab === "security" && (
        <div className="fade-in">
          <div className="settings-card mb-4">
            <div className="card-header-simple">
              <h3>Change Password</h3>
              <p className="text-gray">Update your password to keep your account secure</p>
            </div>

            <div className="form-group mb-4">
              <label>Current Password</label>
              <input type="password" className="form-input" placeholder="Enter current password" />
            </div>
            <div className="form-group mb-4">
              <label>New Password</label>
              <input type="password" className="form-input" placeholder="Enter new password" />
            </div>
            <div className="form-group mb-4">
              <label>Confirm New Password</label>
              <input type="password" className="form-input" placeholder="Confirm new password" />
            </div>

            <div className="form-actions">
              <button className="btn-save">Update Password</button>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header-simple">
              <h3>Two-Factor Authentication</h3>
              <p className="text-gray">Add an extra layer of security to your account</p>
            </div>

            <div className="toggle-row">
              <div>
                <div className="group-label">Enable 2FA</div>
                <div className="text-desc">Require a verification code when signing in</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider round"></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {subTab === "preferences" && (
        <div className="fade-in">
          <div className="settings-card mb-4">
            <div className="card-header-simple">
              <h3>Notification Settings</h3>
              <p className="text-gray">Choose how you want to receive notifications</p>
            </div>

            <div className="toggle-row mb-4 border-bottom">
              <div>
                <div className="group-label">🔔 Email Notifications</div>
                <div className="text-desc">Receive updates and alerts via email</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider round"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div>
                <div className="group-label">📱 SMS Notifications</div>
                <div className="text-desc">Receive urgent alerts via text message</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider round"></span>
              </label>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header-simple">
              <h3>Language & Region</h3>
              <p className="text-gray">Set your preferred language and regional settings</p>
            </div>

            <div className="form-group mb-4">
              <label>Display Language</label>
              <select className="form-input">
                <option>English (US)</option>
                <option>Vietnamese</option>
                <option>French</option>
              </select>
            </div>

            <div className="form-actions">
              <button className="btn-save">Save Preferences</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;