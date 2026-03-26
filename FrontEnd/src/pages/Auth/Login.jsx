import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
<<<<<<< Updated upstream
import ForgotPasswordModal from "./ForgotPasswordModal"; // Đã thêm import Modal
=======
import ForgotPasswordModal from "./ForgotPasswordModal";
>>>>>>> Stashed changes
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
<<<<<<< Updated upstream
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false); // Đã thêm state
=======
  const [showPassword, setShowPassword] = useState(false); // Dòng cũ của bạn
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false); // Thêm dòng này
>>>>>>> Stashed changes

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login(
        formData.email,
        formData.password
      );

      // Navigate by role
      const user = response.user;
      if (user.roleId === 4) {
        // Admin
        navigate("/admin");
      } else if (user.roleId === 2) {
        // Enterprise
        navigate("/enterprise");
      } else if (user.roleId === 3) {
        // Collector
        navigate("/collector");
      } else {
        // Citizen (roleId = 1)
        navigate("/citizen");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Incorrect email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Info Card */}
      <div className="login-left">
        <div className="info-card">
          {/* Icons */}
          <div className="eco-icons">
            <div className="eco-icon">
              <div className="icon-box">🍃</div>
            </div>
            <div className="eco-icon">
              <div className="icon-box">♻️</div>
            </div>
            <div className="eco-icon">
              <div className="icon-box">🌲</div>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="info-title">Together for a Greener Future</h1>
          <p className="info-description">
            Join our community in making waste recycling simple, rewarding, and
            impactful. Every action counts towards a sustainable planet.
          </p>

          {/* Stats */}
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-value">50K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">120T</div>
              <div className="stat-label">Waste Recycled</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">98%</div>
              <div className="stat-label">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        <div className="login-form-container">
          {/* Logo & Brand */}
          <div className="login-brand">
            <div className="brand-icon">🍃</div>
            <span className="brand-name">EcoCollect</span>
          </div>

          {/* Welcome Text */}
          <div className="welcome-text">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue your eco journey</p>
          </div>

          {/* Error Alert */}
          {error && <div className="alert alert-error">❌ {error}</div>}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>
<<<<<<< Updated upstream
                {/* Đã sửa dòng span dưới đây để có thể click được */}
                <span 
                  className="forgot-link" 
=======
                

                {/* Thay bằng đoạn này: */}
                <span
                  className="forgot-link"
>>>>>>> Stashed changes
                  onClick={() => setIsForgotModalOpen(true)}
                  style={{ cursor: "pointer" }}
                >
                  Forgot password?
                </span>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="signup-link">
            Don't have an account?{" "}
            <span className="link-green" onClick={() => navigate("/register")}>
              Sign Up
            </span>
          </div>
        </div>
      </div>
<<<<<<< Updated upstream

      {/* Đã thêm Component Modal nằm gọn gàng bên trong thẻ div container ngoài cùng */}
=======
>>>>>>> Stashed changes
      {isForgotModalOpen && (
        <ForgotPasswordModal onClose={() => setIsForgotModalOpen(false)} />
      )}
    </div>
  );
};

export default Login;