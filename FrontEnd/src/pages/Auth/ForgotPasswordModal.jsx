import React, { useState } from "react";
import { authService } from "../../services/authService";
import "./ForgotPasswordModal.css";

const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await authService.forgotPassword(email);
      setMessage("OTP has been sent to your email.");
      setStep(2);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await authService.resetPassword(email, otp, password, confirmPassword);
      setMessage("Password reset successfully! You can now log in.");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err.response?.data?.message ||
          "Password reset failed. Please check OTP or try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-modal-overlay" onMouseDown={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div
        className="forgot-modal-card"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="forgot-modal-header">
          <h2>Reset Password</h2>
          <button
            type="button"
            className="forgot-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <p className="forgot-modal-subtitle">
          {step === 1
            ? "Enter your registered email to receive an OTP."
            : "Enter the OTP and your new password."}
        </p>

        {error && <div className="forgot-alert forgot-alert-error">{error}</div>}
        {message && <div className="forgot-alert forgot-alert-success">{message}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="forgot-form">
            <div className="forgot-form-group">
              <label>Email Address</label>
              <input
type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
                autoComplete="email"
              />
            </div>

            <div className="forgot-modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="forgot-btn forgot-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="forgot-btn forgot-btn-primary"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="forgot-form">
            <div className="forgot-form-group">
              <label>OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter the 6-digit OTP"
                autoComplete="one-time-code"
              />
            </div>

            <div className="forgot-form-group">
              <label>New Password</label>
              <div className="forgot-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="forgot-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="forgot-form-group">
              <label>Confirm Password</label>
              <div className="forgot-password-wrap">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="forgot-password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="forgot-modal-actions">
              <button
                type="button"
onClick={onClose}
                className="forgot-btn forgot-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="forgot-btn forgot-btn-primary"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;