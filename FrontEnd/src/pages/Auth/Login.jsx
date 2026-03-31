import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import ForgotPasswordModal from "./ForgotPasswordModal";
import "./Auth.css";

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

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

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

      const user = response.user;

      if (user.roleId === 4) {
        navigate("/admin");
      } else if (user.roleId === 2) {
        navigate("/enterprise");
      } else if (user.roleId === 3) {
        navigate("/collector");
      } else {
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
      <div className="login-left">
        <div className="info-card">
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

          <h1 className="info-title">Together for a Greener Future</h1>
          <p className="info-description">
            Join our community in making waste recycling simple, rewarding, and
            impactful. Every action counts towards a sustainable planet.
          </p>

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

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-brand">
            <div className="brand-icon">🍃</div>
            <span className="brand-name">EcoCollect</span>
          </div>

          <div className="welcome-text">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue your eco journey</p>
          </div>

          {error && <div className="alert alert-error">❌ {error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
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

            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>
                <span
                  className="forgot-link"
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
                  {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="signup-link">
            Don't have an account?{" "}
            <span className="link-green" onClick={() => navigate("/register")}>
              Sign Up
            </span>
          </div>
        </div>
      </div>

      {isForgotModalOpen && (
        <ForgotPasswordModal onClose={() => setIsForgotModalOpen(false)} />
      )}
    </div>
  );
};

export default Login;
