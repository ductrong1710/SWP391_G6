import React, { useState } from "react";
import SettingsTabs from "../../components/SettingsTabs";

const Settings = () => {
  const [subTab, setSubTab] = useState("general");

  return (
    <div className="admin-settings-page fade-in">
      <div className="admin-page-header">
        <h2>Account Settings</h2>
        <p className="text-gray">Manage your admin profile and system preferences</p>
      </div>

      <SettingsTabs activeTab={subTab} onChange={setSubTab} />

      {subTab === "general" && (
        <div className="admin-card">
          <div className="card-header-simple">
            <h3>Profile Information</h3>
            <p className="text-gray">Update your personal details</p>
          </div>

          <div className="profile-section">
            <div className="admin-avatar-large">A</div>
            <div className="photo-info">
              <strong>Admin Profile Photo</strong>
              <p>JPG, PNG or GIF. Max 2MB</p>
            </div>
            <button className="btn-upload">Upload New</button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-input" defaultValue="System Admin" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input" defaultValue="admin@ecocollect.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" className="form-input" defaultValue="+1 (555) 999-8888" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" className="form-input disabled" value="Super Administrator" disabled />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-save">Save Changes</button>
          </div>
        </div>
      )}

      {subTab === "security" && (
        <div className="fade-in">
          <div className="admin-card mb-4">
            <div className="card-header-simple">
              <h3>Change Password</h3>
              <p className="text-gray">Ensure your account is using a strong password</p>
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

          <div className="admin-card">
            <div className="card-header-simple">
              <h3>Two-Factor Authentication</h3>
              <p className="text-gray">Add an extra layer of security to your admin account</p>
            </div>

            <div className="config-item no-border">
              <div>
                <div className="conf-label">Enable 2FA</div>
                <div className="conf-desc">Require a verification code when signing in</div>
              </div>
              <label className="switch-toggle">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {subTab === "preferences" && (
        <div className="fade-in">
          <div className="admin-card mb-4">
            <div className="card-header-simple">
              <h3>Notification Settings</h3>
              <p className="text-gray">Manage system alerts and notifications</p>
            </div>

            <div className="config-item">
              <div>
                <div className="conf-label">🔔 Email Alerts</div>
                <div className="conf-desc">Receive critical system alerts via email</div>
              </div>
              <label className="switch-toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="config-item no-border">
              <div>
                <div className="conf-label">📱 SMS Alerts</div>
                <div className="conf-desc">Receive urgent security alerts via text message</div>
              </div>
              <label className="switch-toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div className="admin-card">
            <div className="card-header-simple">
              <h3>System Language</h3>
              <p className="text-gray">Select the language for the admin dashboard</p>
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
