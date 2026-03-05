import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      await authService.register(formData);
      setSuccess('OTP đã được gửi đến email của bạn!');
      setStep(2);
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 số');
      setLoading(false);
      return;
    }

    try {
      await authService.verifyOtp(formData.email, otp);
      setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="login-form-container register-form-centered">
        {/* Logo & Brand */}
        <div className="login-brand">
          <div className="brand-icon">🍃</div>
          <span className="brand-name">EcoCollect</span>
        </div>

        {/* Welcome Text */}
        <div className="welcome-text">
          <h2>{step === 1 ? 'Create Account' : 'Verify Email'}</h2>
          <p>{step === 1 ? 'Join our eco-friendly community' : 'Enter the OTP sent to your email'}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success">
            ✅ {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRegister} className="login-form">
            {/* Full Name Input */}
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading ? 'Processing...' : '📧 Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            {/* OTP Info */}
            <div className="otp-info">
              <p>Verification code sent to:</p>
              <strong className="otp-email">{formData.email}</strong>
            </div>

            {/* OTP Input */}
            <div className="form-group">
              <label htmlFor="otp">Enter OTP Code</label>
              <input
                type="text"
                id="otp"
                name="otp"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setError('');
                }}
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="otp-input"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading ? 'Verifying...' : '✓ Verify OTP'}
            </button>

            {/* Back Button */}
            <button
              type="button"
              className="btn-back"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              ← Go Back
            </button>
          </form>
        )}

        {/* Sign In Link */}
        <div className="signup-link">
          Already have an account? {' '}
          <span className="link-green" onClick={() => navigate('/login')}>
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;