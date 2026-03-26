<<<<<<< Updated upstream
import React, { useState } from "react";
import authService from "../../services/authService";
=======
import React, { useState, useEffect } from "react";
>>>>>>> Stashed changes
import SettingsTabs from "../../components/SettingsTabs";
import authService from "../../services/authService";
import userService from "../../services/userService";

<<<<<<< Updated upstream
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
=======
// ==========================================
// 1. COMPONENT CẬP NHẬT THÔNG TIN (GENERAL)
// ==========================================
const ProfileSettings = () => {
  // Đã xóa city, stateProvince, zipCode khỏi state cho gọn code
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "", 
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Load dữ liệu từ Backend
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userData = await userService.getProfile();
        setProfileData({
          fullName: userData.fullName || userData.FullName || "",
          email: userData.email || userData.Email || "",
          phone: userData.phone || userData.Phone || "",
          address: "", // Nếu sau này có DB lưu địa chỉ thì map vào đây
        });
      } catch (error) {
        console.error("Lỗi khi gọi API getProfile:", error);
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
      
      const currentUserString = localStorage.getItem('user');
      if (currentUserString) {
        const currentUser = JSON.parse(currentUserString);
        currentUser.fullName = profileData.fullName;
        currentUser.phone = profileData.phone;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      
      setStatus({ type: "success", message: "Profile updated successfully! The interface will reload..." });

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      setStatus({ 
        type: "error", 
        message: error.response?.data?.message || "An error occurred while updating the profile." 
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
          className={`alert ${status.type === "error" ? "alert-danger" : "alert-success"}`}
          style={{ padding: '10px', marginBottom: '20px', borderRadius: '4px', backgroundColor: status.type === 'error' ? '#fee2e2' : '#dcfce7', color: status.type === 'error' ? '#991b1b' : '#166534', border: `1px solid ${status.type === 'error' ? '#f87171' : '#4ade80'}` }}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" value={profileData.fullName} onChange={handleChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={profileData.email} onChange={handleChange} className="form-input" required disabled title="Email không được phép đổi" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone" value={profileData.phone} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <input type="text" className="form-input bg-gray" value="Citizen" disabled />
          </div>
          
          {/* Ô Address vẫn được giữ lại theo hình ảnh của bạn */}
          <div className="form-group full-width">
            <label>Address</label>
            <input type="text" name="address" value={profileData.address} onChange={handleChange} className="form-input" placeholder="Enter your street address" />
          </div>
          
          {/* ĐÃ XÓA: City, State/Province, ZIP Code ở đây */}
          
        </div>

        <div className="form-actions" style={{ marginTop: "20px" }}>
          <button type="submit" className="btn-save" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ==========================================
// 2. COMPONENT ĐỔI MẬT KHẨU (SECURITY)
// ==========================================
const SecuritySettings = () => {
  const [formData, setFormData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState({ oldPassword: false, newPassword: false, confirmPassword: false });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPassword((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
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

      setStatus({ type: "success", message: response.message || "Password changed successfully!" });
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.message || "An error occurred while changing the password." });
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
      <p className="text-gray-sm">Update your password to keep your account secure</p>
      
      {status.message && (
        <div className={`alert ${status.type === "error" ? "alert-danger" : "alert-success"}`} style={{ padding: '10px', marginBottom: '20px', borderRadius: '4px', backgroundColor: status.type === 'error' ? '#fee2e2' : '#dcfce7', color: status.type === 'error' ? '#991b1b' : '#166534', border: `1px solid ${status.type === 'error' ? '#f87171' : '#4ade80'}` }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {inputFields.map((field, index) => (
          <div className="form-group" key={index}>
            <label>{field.label}</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword[field.name] ? "text" : "password"}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required
                className="form-input"
                style={{ paddingRight: "40px", width: "100%" }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(field.name)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                {showPassword[field.name] ? "👁️‍🗨️" : "👁️"} 
              </button>
            </div>
          </div>
        ))}
        <div className="form-actions" style={{ marginTop: "20px", marginBottom: "40px" }}>
          <button type="submit" className="btn-save" disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ==========================================
// 3. COMPONENT CHÍNH QUẢN LÝ CÁC TABS
// ==========================================
const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="settings-container fade-in">
      <div className="settings-header">
        <h2>Settings</h2>
        <p className="text-gray">Manage your account preferences and security</p>
      </div>

      <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* TABS: GENERAL */}
      {activeTab === "general" && <ProfileSettings />}

      {/* TABS: SECURITY */}
      {activeTab === "security" && (
        <div className="tab-pane">
          <SecuritySettings />

          <hr style={{ border: "0", borderTop: "1px solid #e5e7eb", margin: "30px 0" }} />

          <h3 className="pane-title">Two-Factor Authentication</h3>
          <p className="text-gray-sm">Add an extra layer of security to your account</p>
          <div className="toggle-item">
            <div className="toggle-info">
              <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 4px 0" }}>Enable 2FA</h4>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Require a verification code when signing in</p>
            </div>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
>>>>>>> Stashed changes
          </div>
        </div>
      )}

<<<<<<< Updated upstream
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
=======
      {/* TABS: PREFERENCES */}
      {activeTab === "preferences" && (
        <div className="tab-pane">
          <h3 className="pane-title">Notification Settings</h3>
          <p className="text-gray-sm">Choose how you want to receive notifications</p>
          {/* ... (Các toggle switch của preferences) ... */}
          <div className="toggle-item">
            <div className="toggle-info">
              <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 4px 0" }}>Email Notifications</h4>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Receive updates and alerts via email</p>
>>>>>>> Stashed changes
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;