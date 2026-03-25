import React, { useEffect, useState } from "react";
import SettingsTabs from "../../components/SettingsTabs";
import { authService } from "../../services/authService";

const Settings = () => {
  const [subTab, setSubTab] = useState("general");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    accountType: "Enterprise",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    enable2FA: false,
    emailNotifications: true,
    smsNotifications: false,
    language: "English (US)",
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      setProfileMessage("Khong tim thay thong tin tai khoan hien tai.");
      setLoadingProfile(false);
      return;
    }

    setForm((prev) => ({
      ...prev,
      fullName: currentUser.fullName || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      accountType: currentUser.roleName || "Enterprise",
    }));

    setLoadingProfile(false);
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePreferenceToggle = (field) => (event) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const handlePreferenceSelect = (field) => (event) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();
    setProfileMessage(
      "Backend hien chua ho tro Enterprise tu cap nhat ho so. Form dang hien thi thong tin tai khoan hien co."
    );
  };

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setPasswordError(
      "Backend hien chua ho tro doi mat khau trong moi truong dang chay."
    );
  };

  const handleSavePreferences = (event) => {
    event.preventDefault();
    setPasswordMessage("Preferences updated locally.");
    setPasswordError("");
  };

  return (
    <div className="ent-settings-container fade-in">
      <div className="ent-page-header">
        <h2>Settings</h2>
        <p className="text-gray">Manage your account preferences and security</p>
      </div>

      <SettingsTabs activeTab={subTab} onChange={setSubTab} />

      {subTab === "general" && (
        <div className="ent-card settings-card">
          <h3 className="card-title">Profile Information</h3>
          <p className="text-gray mb-6">
            Update your personal details and profile picture
          </p>

          {profileMessage && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              {profileMessage}
            </div>
          )}

          <div className="profile-photo-section">
            <div className="avatar-large">
              <span className="camera-icon">📷</span>
            </div>
            <div className="photo-info">
              <strong>Profile Photo</strong>
              <p>JPG, PNG or GIF. Max 2MB</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  disabled={loadingProfile}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={handleChange("email")}
                  disabled={loadingProfile}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  disabled={loadingProfile}
                />
              </div>

              <div className="form-group">
                <label>Account Type</label>
                <input
                  type="text"
                  className="form-input disabled"
                  value={form.accountType}
                  disabled
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your street address"
                  value={form.address}
                  onChange={handleChange("address")}
                />
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange("city")}
                  />
                </div>

                <div className="form-group">
                  <label>State/Province</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange("state")}
                  />
                </div>

                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ZIP"
                    value={form.zipCode}
                    onChange={handleChange("zipCode")}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-save" type="submit" disabled={loadingProfile}>
                {loadingProfile ? "Loading..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {subTab === "security" && (
        <div className="fade-in">
          <div className="ent-card settings-card mb-6">
            <h3 className="card-title">Change Password</h3>
            <p className="text-gray mb-6">
              Update your password to keep your account secure
            </p>

            {passwordMessage && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group mb-4">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange("currentPassword")}
                />
              </div>

              <div className="form-group mb-4">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange("newPassword")}
                />
              </div>

              <div className="form-group mb-4">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange("confirmPassword")}
                />
              </div>

              <div className="form-actions">
                <button className="btn-save" type="submit">
                  Update Password
                </button>
              </div>
            </form>
          </div>

          <div className="ent-card settings-card">
            <h3 className="card-title">Two-Factor Authentication</h3>
            <p className="text-gray mb-6">
              Add an extra layer of security to your account
            </p>

            <div className="toggle-row">
              <div>
                <div className="group-label" style={{ marginBottom: "4px" }}>
                  Enable 2FA
                </div>
                <div className="text-desc">
                  Require a verification code when signing in
                </div>
              </div>

              <label className="pref-toggle">
                <input
                  type="checkbox"
                  checked={preferences.enable2FA}
                  onChange={handlePreferenceToggle("enable2FA")}
                />
                <span className="pref-toggle-track">
                  <span className="pref-toggle-thumb"></span>
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {subTab === "preferences" && (
        <div className="fade-in">
          <div className="ent-card settings-card mb-6">
            <h3 className="card-title">Notification Settings</h3>
            <p className="text-gray mb-6">
              Choose how you want to receive notifications
            </p>

            <div
              className="toggle-row mb-6"
              style={{ paddingBottom: "16px", borderBottom: "1px solid #f3f4f6" }}
            >
              <div>
                <div className="group-label" style={{ marginBottom: "4px" }}>
                  Email Notifications
                </div>
                <div className="text-desc">
                  Receive updates and alerts via email
                </div>
              </div>

              <label className="pref-toggle">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={handlePreferenceToggle("emailNotifications")}
                />
                <span className="pref-toggle-track">
                  <span className="pref-toggle-thumb"></span>
                </span>
              </label>
            </div>

            <div className="toggle-row">
              <div>
                <div className="group-label" style={{ marginBottom: "4px" }}>
                  SMS Notifications
                </div>
                <div className="text-desc">
                  Receive urgent alerts via text message
                </div>
              </div>

              <label className="pref-toggle">
                <input
                  type="checkbox"
                  checked={preferences.smsNotifications}
                  onChange={handlePreferenceToggle("smsNotifications")}
                />
                <span className="pref-toggle-track">
                  <span className="pref-toggle-thumb"></span>
                </span>
              </label>
            </div>
          </div>

          <div className="ent-card settings-card">
            <h3 className="card-title">Language & Region</h3>
            <p className="text-gray mb-6">
              Set your preferred language and regional settings
            </p>

            <form onSubmit={handleSavePreferences}>
              <div className="form-group mb-4">
                <label>Display Language</label>
                <select
                  className="form-input"
                  value={preferences.language}
                  onChange={handlePreferenceSelect("language")}
                >
                  <option>English (US)</option>
                  <option>Vietnamese</option>
                  <option>French</option>
                </select>
              </div>

              <div className="form-actions">
                <button className="btn-save" type="submit">
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
