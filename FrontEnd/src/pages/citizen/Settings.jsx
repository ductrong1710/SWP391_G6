// src/pages/citizen/Settings.jsx
import React, { useState } from "react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="settings-container fade-in">
      {/* 1. Header */}
      <div className="settings-header">
        <h2>Settings</h2>
        <p className="text-gray">
          Manage your account preferences and security
        </p>
      </div>

      {/* 2. Tab navigation (General - Security - Preferences) */}
      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          📷 General
        </button>
        <button
          className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          🛡 Security
        </button>
        <button
          className={`tab-btn ${activeTab === "preferences" ? "active" : ""}`}
          onClick={() => setActiveTab("preferences")}
        >
          🔔 Preferences
        </button>
      </div>

      {/* 3. General Tab content */}
      {activeTab === "general" && (
        <div className="tab-pane">
          <h3 className="pane-title">Profile Information</h3>
          <p className="text-gray-sm">
            Update your personal details and profile picture
          </p>

          {/* Profile picture section */}
          <div className="profile-photo-section">
            <div className="avatar-wrapper">
              <div className="avatar-placeholder"></div>
              <button className="btn-camera">📷</button>
            </div>
            <div className="photo-info">
              <strong>Profile Photo</strong>
              <p>JPG, PNG or GIF. Max 2MB</p>
            </div>
          </div>

          {/* Input form */}
          <div className="form-grid">
            {/* Row 1 */}
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-input"
                defaultValue="Jane Doe"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="text"
                className="form-input"
                defaultValue="jane.doe@example.com"
              />
            </div>

            {/* Row 2 */}
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                className="form-input"
                defaultValue="+1 (555) 000-0000"
              />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <input
                type="text"
                className="form-input bg-gray"
                defaultValue="Citizen"
                disabled
              />
            </div>

            {/* Row 3 (Full width) */}
            <div className="form-group full-width">
              <label>Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your street address"
              />
            </div>

            {/* Row 4 (3 small columns) */}
            <div className="form-group">
              <label>City</label>
              <input type="text" className="form-input" placeholder="City" />
            </div>
            <div className="form-group">
              <label>State/Province</label>
              <input type="text" className="form-input" placeholder="State" />
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input type="text" className="form-input" placeholder="ZIP" />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-save">Save Changes</button>
          </div>
        </div>
      )}

      {/* Other tabs (Placeholder) */}
      {activeTab === "security" && (
        <div className="tab-pane">
          <h3 className="pane-title">Change Password</h3>
          <p className="text-gray-sm">
            Update your password to keep your account secure
          </p>

          {/* Change password form */}
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Confirm new password"
            />
          </div>

          <div
            className="form-actions"
            style={{ marginTop: "20px", marginBottom: "40px" }}
          >
            <button className="btn-save">Update Password</button>
          </div>

          <hr
            style={{
              border: "0",
              borderTop: "1px solid #e5e7eb",
              margin: "30px 0",
            }}
          />

          {/* Two-factor authentication section */}
          <h3 className="pane-title">Two-Factor Authentication</h3>
          <p className="text-gray-sm">
            Add an extra layer of security to your account
          </p>

          <div className="toggle-item">
            <div className="toggle-info">
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  margin: "0 0 4px 0",
                }}
              >
                Enable 2FA
              </h4>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Require a verification code when signing in
              </p>
            </div>

            {/* Toggle switch */}
            <label className="switch">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      )}
      {activeTab === "preferences" && (
        <div className="tab-pane">
          {/* 1. Notification Settings section */}
          <h3 className="pane-title">Notification Settings</h3>
          <p className="text-gray-sm">
            Choose how you want to receive notifications
          </p>

          <div className="toggle-item">
            <div className="toggle-info">
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  margin: "0 0 4px 0",
                }}
              >
                Email Notifications
              </h4>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Receive updates and alerts via email
              </p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked /> {/* Default On */}
              <span className="slider round"></span>
            </label>
          </div>

          <div
            className="toggle-item"
            style={{
              borderTop: "none",
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >
            <div className="toggle-info">
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  margin: "0 0 4px 0",
                }}
              >
                SMS Notifications
              </h4>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Receive urgent alerts via text message
              </p>
            </div>
            <label className="switch">
              <input type="checkbox" /> {/* Default Off */}
              <span className="slider round"></span>
            </label>
          </div>

          <hr
            style={{
              border: "0",
              borderTop: "1px solid #e5e7eb",
              margin: "30px 0",
            }}
          />

          {/* 2. Language & Region section */}
          <h3 className="pane-title">Language & Region</h3>
          <p className="text-gray-sm">
            Set your preferred language and regional settings
          </p>

          <div className="form-group" style={{ maxWidth: "400px" }}>
            <label>Display Language</label>
            <select
              className="form-input"
              style={{ appearance: "auto", cursor: "pointer" }}
            >
              <option>English (US)</option>
              <option>Vietnamese (VN)</option>
              <option>Japanese (JP)</option>
            </select>
          </div>

          <div className="form-actions" style={{ marginTop: "20px" }}>
            <button className="btn-save">Save Preferences</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
