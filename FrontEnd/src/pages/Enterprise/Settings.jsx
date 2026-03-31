import React, { useState, useEffect } from "react";
import SettingsTabs from "../../components/SettingsTabs";
import authService from "../../services/authService";
import userService from "../../services/userService";

const ACCOUNT_TYPE = "Enterprise";

const EyeOpenIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m3 3 18 18" />
    <path d="M10.584 10.587a2 2 0 0 0 2.829 2.829" />
    <path d="M9.363 5.365A10.744 10.744 0 0 1 12 5c4.768 0 8.852 2.95 10.438 7a10.523 10.523 0 0 1-4.172 5.54" />
    <path d="M6.228 6.233A10.45 10.45 0 0 0 1.563 12a10.523 10.523 0 0 0 7.377 6.632" />
  </svg>
);

const SwitchToggle = ({ checked, onChange, ariaLabel }) => {
  const width = 56;
  const height = 28;
  const knobSize = 22;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || "toggle"}
      onClick={() => onChange(!checked)}
      style={{
        border: "none",
        padding: 0,
        background: "transparent",
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width,
          height,
          borderRadius: height / 2,
          display: "inline-block",
          position: "relative",
          cursor: "pointer",
          transition: "background 200ms ease, box-shadow 200ms ease",
          background: checked
            ? "linear-gradient(90deg,#2dd4bf,#059669)"
            : "#eef2f3",
          boxShadow: checked ? "0 4px 10px rgba(37,150,100,0.12)" : "none",
        }}
      >
        <span
          style={{
            width: knobSize,
            height: knobSize,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: (height - knobSize) / 2,
            left: checked ? width - knobSize - 3 : 3,
            transition: "left 180ms ease, box-shadow 180ms ease",
            boxShadow: "0 2px 6px rgba(16,24,40,0.12)",
          }}
        />
      </span>
    </button>
  );
};

const ProfileSettings = () => {
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userData = await userService.getProfile();
        setProfileData({
          fullName: userData.fullName || userData.FullName || "",
          email: userData.email || userData.Email || "",
          phone: userData.phone || userData.Phone || "",
          address: userData.address || userData.Address || "",
        });
      } catch (error) {
        console.error("Error calling getProfile:", error);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setIsLoading(true);

    try {
      const dataToSend = {
        fullName: profileData.fullName,
        phone: profileData.phone,
      };

      await userService.updateProfile(dataToSend);

      const currentUserString = localStorage.getItem("user");
      if (currentUserString) {
        const currentUser = JSON.parse(currentUserString);
        currentUser.fullName = profileData.fullName;
        currentUser.phone = profileData.phone;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }

      setStatus({
        type: "success",
        message: "Profile updated successfully! The interface will reload...",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "An error occurred while updating the profile.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tab-pane">
      <h3 className="pane-title">Profile Information</h3>
      <p className="text-gray-sm">Update your personal details</p>

      {status.message && (
        <div
          className={`alert ${
            status.type === "error" ? "alert-danger" : "alert-success"
          }`}
          style={{
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "4px",
            backgroundColor:
              status.type === "error" ? "#fee2e2" : "#dcfce7",
            color: status.type === "error" ? "#991b1b" : "#166534",
            border: `1px solid ${
              status.type === "error" ? "#f87171" : "#4ade80"
            }`,
          }}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={profileData.fullName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              className="form-input"
              required
              disabled
              title="Email cannot be changed"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <input
              type="text"
              className="form-input bg-gray"
              value={ACCOUNT_TYPE}
              disabled
            />
          </div>

          <div className="form-group full-width">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={profileData.address}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your street address"
            />
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: "20px" }}>
          <button type="submit" className="btn-save" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

const SecuritySettings = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: "error", message: "The new passwords do not match!" });
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setStatus({
        type: "success",
        message: response.message || "Password changed successfully!",
      });
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "An error occurred while changing the password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = [
    { label: "Current password", name: "oldPassword" },
    { label: "New password", name: "newPassword" },
    { label: "Confirm new password", name: "confirmPassword" },
  ];

  return (
    <div className="security-settings-section">
      <h3 className="pane-title">Change Password</h3>
      <p className="text-gray-sm">
        Update your password to keep your account secure
      </p>

      {status.message && (
        <div
          className={`alert ${
            status.type === "error" ? "alert-danger" : "alert-success"
          }`}
          style={{
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "4px",
            backgroundColor:
              status.type === "error" ? "#fee2e2" : "#dcfce7",
            color: status.type === "error" ? "#991b1b" : "#166534",
            border: `1px solid ${
              status.type === "error" ? "#f87171" : "#4ade80"
            }`,
          }}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {inputFields.map((field) => (
          <div className="form-group" key={field.name}>
            <label>{field.label}</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword[field.name] ? "text" : "password"}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required
                className="form-input"
                style={{ paddingRight: "48px", width: "100%" }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(field.name)}
                aria-label={
                  showPassword[field.name]
                    ? `Hide ${field.label.toLowerCase()}`
                    : `Show ${field.label.toLowerCase()}`
                }
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                {showPassword[field.name] ? <EyeOffIcon /> : <EyeOpenIcon />}
              </button>
            </div>
          </div>
        ))}

        <div
          className="form-actions"
          style={{ marginTop: "20px", marginBottom: "40px" }}
        >
          <button type="submit" className="btn-save" disabled={isLoading}>
            {isLoading ? "Processing..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="settings-container fade-in">
      <div className="settings-header">
        <h2>Settings</h2>
        <p className="text-gray">
          Manage your account preferences and security
        </p>
      </div>

      <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "general" && <ProfileSettings />}

      {activeTab === "security" && (
        <div className="tab-pane">
          <SecuritySettings />

          <hr
            style={{
              border: "0",
              borderTop: "1px solid #e5e7eb",
              margin: "30px 0",
            }}
          />

          <h3 className="pane-title">Two-Factor Authentication</h3>
          <p className="text-gray-sm">
            Add an extra layer of security to your account
          </p>

          <div
            className="toggle-item"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              padding: "8px 0",
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
                Enable 2FA
              </h4>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Require a verification code when signing in
              </p>
            </div>

            <SwitchToggle
              checked={twoFactorEnabled}
              onChange={setTwoFactorEnabled}
              ariaLabel="Enable 2FA"
            />
          </div>
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="tab-pane">
          <h3 className="pane-title">Notification Settings</h3>
          <p className="text-gray-sm">
            Choose how you want to receive notifications
          </p>

          <div
            className="toggle-item"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              padding: "8px 0",
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
                Email Notifications
              </h4>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Receive updates and alerts via email
              </p>
            </div>

            <SwitchToggle
              checked={emailNotifications}
              onChange={setEmailNotifications}
              ariaLabel="Email notifications"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
