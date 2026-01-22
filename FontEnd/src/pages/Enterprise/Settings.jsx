import React, { useState } from 'react';

const Settings = () => {
  // Tab hiện tại: 'general' | 'security' | 'preferences'
  const [subTab, setSubTab] = useState('general');

  return (
    <div className="ent-settings-container fade-in">
      {/* 1. Header */}
      <div className="ent-page-header">
        <h2>Settings</h2>
        <p className="text-gray">Manage your account preferences and security</p>
      </div>

      {/* 2. Tabs chuyển đổi */}
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

      {/* 3. Nội dung chính - Dựa vào subTab để hiển thị */}
      
      {/* --- TAB GENERAL (Giữ nguyên như cũ) --- */}
      {subTab === 'general' && (
        <div className="ent-card settings-card">
          <h3 className="card-title">Profile Information</h3>
          <p className="text-gray mb-6">Update your personal details and profile picture</p>

          <div className="profile-photo-section">
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
              <input type="text" className="form-input" defaultValue="GreenWaste Inc." />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input" defaultValue="admin@greenwaste.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" className="form-input" defaultValue="+1 (555) 000-0000" />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <input type="text" className="form-input disabled" value="Enterprise" disabled />
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

      {/* --- TAB SECURITY (Mới thêm) --- */}
      {subTab === 'security' && (
        <div className="fade-in">
          {/* Card 1: Change Password */}
          <div className="ent-card settings-card mb-6">
            <h3 className="card-title">Change Password</h3>
            <p className="text-gray mb-6">Update your password to keep your account secure</p>
            
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

          {/* Card 2: 2FA */}
          <div className="ent-card settings-card">
            <h3 className="card-title">Two-Factor Authentication</h3>
            <p className="text-gray mb-6">Add an extra layer of security to your account</p>
            
            <div className="toggle-row">
              <div>
                 <div className="group-label" style={{marginBottom: '4px'}}>Enable 2FA</div>
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

      {/* --- TAB PREFERENCES (Mới thêm) --- */}
      {subTab === 'preferences' && (
        <div className="fade-in">
          {/* Card 1: Notification Settings */}
          <div className="ent-card settings-card mb-6">
            <h3 className="card-title">Notification Settings</h3>
            <p className="text-gray mb-6">Choose how you want to receive notifications</p>
            
            <div className="toggle-row mb-6" style={{paddingBottom: '16px', borderBottom: '1px solid #f3f4f6'}}>
              <div>
                 <div className="group-label" style={{marginBottom: '4px'}}>🔔 Email Notifications</div>
                 <div className="text-desc">Receive updates and alerts via email</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider round"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div>
                 <div className="group-label" style={{marginBottom: '4px'}}>🔔 SMS Notifications</div>
                 <div className="text-desc">Receive urgent alerts via text message</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider round"></span>
              </label>
            </div>
          </div>

          {/* Card 2: Language & Region */}
          <div className="ent-card settings-card">
            <h3 className="card-title">Language & Region</h3>
            <p className="text-gray mb-6">Set your preferred language and regional settings</p>
            
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