// src/pages/collector/Settings.jsx
import React, { useState } from 'react';

const Settings = () => {
  const [subTab, setSubTab] = useState('general');

  return (
    <div className="col-page-container fade-in">
      {/* Header */}
      <div className="col-page-header">
        <div>
          <h2>Settings</h2>
          <p className="text-gray">Manage your account preferences and security</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="settings-tabs">
        <button 
          className={`tab-btn ${subTab === 'general' ? 'active' : ''}`}
          onClick={() => setSubTab('general')}
        >
          📷 General
        </button>
        <button 
          className={`tab-btn ${subTab === 'security' ? 'active' : ''}`}
          onClick={() => setSubTab('security')}
        >
          🛡️ Security
        </button>
        <button 
          className={`tab-btn ${subTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setSubTab('preferences')}
        >
          🔔 Preferences
        </button>
      </div>

      {/* --- TAB 1: GENERAL --- */}
      {subTab === 'general' && (
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
              <input type="text" className="form-input" defaultValue="Mike Wilson" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input" defaultValue="mike.wilson@example.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" className="form-input" defaultValue="+1 (555) 000-0000" />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <input type="text" className="form-input disabled" value="Collector" disabled />
            </div>
            <div className="form-group full-width">
              <label>Address</label>
              <input type="text" className="form-input" placeholder="Enter your street address" />
            </div>
            <div className="form-row-3">
              <div className="form-group"><label>City</label><input type="text" className="form-input" placeholder="City" /></div>
              <div className="form-group"><label>State/Province</label><input type="text" className="form-input" placeholder="State" /></div>
              <div className="form-group"><label>ZIP Code</label><input type="text" className="form-input" placeholder="ZIP" /></div>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-save">Save Changes</button>
          </div>
        </div>
      )}

      {/* --- TAB 2: SECURITY (Mới thêm) --- */}
      {subTab === 'security' && (
        <div className="fade-in">
          {/* Change Password Section */}
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

          {/* 2FA Section */}
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

      {/* --- TAB 3: PREFERENCES (Mới thêm) --- */}
      {subTab === 'preferences' && (
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