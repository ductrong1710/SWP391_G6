import React, { useState, useRef, useEffect } from "react";


function validateEmail(email) {
  const value = (email || "").trim();
  if (!value) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!/^[A-Za-z0-9._-]+$/.test(local)) return false;
  if (local.startsWith(".") || local.endsWith(".")) return false;
  if (local.includes("..")) return false;
  if (!domain.includes(".")) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  const labels = domain.split(".");
  if (labels.some((lbl) => lbl.length === 0)) return false;
  if (!labels.every((lbl) => /^[A-Za-z0-9-]+$/.test(lbl))) return false;
  const tld = labels[labels.length - 1].toLowerCase();
  const allowedTlds = ["com", "net", "org", "edu", "vn"];
  if (tld.length < 2) return false;
  if (!allowedTlds.includes(tld)) return false;
  return true;
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  function addToast(type, message, ttl = 4000) {
    const id = Date.now() + Math.random();
    const t = { id, type, message };
    setToasts((s) => [t, ...s]);
    if (ttl > 0) setTimeout(() => removeToast(id), ttl);
  }
  function removeToast(id) {
    setToasts((s) => s.filter((t) => t.id !== id));
  }
  return { toasts, addToast, removeToast };
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientErrors, setClientErrors] = useState({});
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [serverMessageType, setServerMessageType] = useState("error"); // 'error' | 'success'
  const [status, setStatus] = useState(null); // null | loading | success | error
  const liveRef = useRef(null);

  const { toasts, addToast, removeToast } = useToasts();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    const keys = Object.keys(serverFieldErrors);
    if (keys.length > 0) {
      const first = keys[0];
      if (first === "email" && emailRef.current) emailRef.current.focus();
      else if (first === "password" && passwordRef.current) passwordRef.current.focus();
      if (liveRef.current) liveRef.current.textContent = "Có lỗi trong biểu mẫu. Vui lòng kiểm tra.";
    }
  }, [serverFieldErrors]);

  function clearServerErrors() {
    setServerFieldErrors({});
    setServerMessage("");
  }

  function handleValidation() {
    const e = {};
    if (!email.trim()) {
      e.email = "Email không được để trống.";
    } else if (!validateEmail(email)) {
      e.email =
        "Email không hợp lệ."}

    if (!password) {
      e.password = "Mật khẩu không được để trống.";
    } else if (password.length < 6) {
      e.password = "Mật khẩu phải ít nhất 6 ký tự.";
    } else if (!/[a-z]/.test(password)) {
      e.password = "Sai mật khẩu.";
    } else if (!/[A-Z]/.test(password)) {
      e.password = "Sai mật khẩu.";
    } else if (!/\d/.test(password)) {
      e.password = "Sai mật khẩu.";
    }

    setClientErrors(e);
    return Object.keys(e).length === 0;
  }

  // Simulated API
  function fakeApiCall({ email, password }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email.includes("field")) {
          resolve({
            ok: false,
            status: 422,
            body: {
              message: "Validation failed on server",
              errors: {
                email: "Email đã được sử dụng hoặc không hợp lệ theo server.",
                password: "Mật khẩu không đạt tiêu chuẩn bảo mật.",
              },
            },
          });
        } else if (email.includes("invalid")) {
          resolve({
            ok: false,
            status: 401,
            body: { message: "Email hoặc mật khẩu không đúng." },
          });
        } else {
          resolve({
            ok: true,
            status: 200,
            body: { message: "Đăng nhập thành công", user: { name: "User Example" } },
          });
        }
      }, 900);
    });
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    clearServerErrors();
    setServerMessage("");
    if (!handleValidation()) return;

    setStatus("loading");

    try {
      const res = await fakeApiCall({ email, password });
      if (!res.ok) {
        setStatus("error");
        if (res.status === 422 && res.body && res.body.errors) {
          // field-level server errors (keep these detailed)
          setServerFieldErrors(res.body.errors);
          setServerMessage(res.body.message || "Có lỗi trong biểu mẫu.");
          setServerMessageType("error");
          addToast("error", res.body.message || "Có lỗi trong biểu mẫu.");
        } else if (res.status === 401) {
          // Invalid credentials: show generic "Sai mật khẩu" only
          const msg = "Sai mật khẩu";
          setServerMessage(msg);
          setServerMessageType("error");
          addToast("error", msg);
          if (liveRef.current) liveRef.current.textContent = msg;
        } else {
          // other server errors: show server message
          setServerMessage(res.body?.message || "Đăng nhập thất bại.");
          setServerMessageType("error");
          addToast("error", res.body?.message || "Đăng nhập thất bại.");
          if (liveRef.current) liveRef.current.textContent = res.body?.message || "Đăng nhập thất bại.";
        }
      } else {
        setStatus("success");
        setServerMessage(res.body?.message || "Đăng nhập thành công.");
        setServerMessageType("success");
        addToast("success", res.body?.message || "Đăng nhập thành công.");
        if (liveRef.current) liveRef.current.textContent = "Đăng nhập thành công.";
        setEmail("");
        setPassword("");
        setClientErrors({});
        setServerFieldErrors({});
      }
    } catch (err) {
      setStatus("error");
      setServerMessage("Lỗi mạng. Vui lòng thử lại.");
      setServerMessageType("error");
      addToast("error", "Lỗi mạng. Vui lòng thử lại.");
      if (liveRef.current) liveRef.current.textContent = "Lỗi mạng. Vui lòng thử lại.";
    } finally {
      setStatus((s) => (s === "loading" ? null : s));
    }
  }

  return (
    <div className="page-root">
      <aside className="promo-side" aria-hidden="true">
        <div className="promo-card">
          <div className="icons-row">
            <div className="icon-box" aria-hidden>🍃</div>
            <div className="icon-box" aria-hidden>♻️</div>
            <div className="icon-box" aria-hidden>🌲</div>
          </div>

          <h2 className="promo-title">Together for a Greener Future</h2>

          <p className="promo-desc">
            Join our community in making waste recycling simple, rewarding, and impactful. Every action counts towards a sustainable planet.
          </p>

          <div className="stats-row">
            <div className="stat">
              <div className="stat-big">50K+</div>
              <div className="stat-sub">Active Users</div>
            </div>
            <div className="stat">
              <div className="stat-big">120T</div>
              <div className="stat-sub">Waste Recycled</div>
            </div>
            <div className="stat">
              <div className="stat-big">98%</div>
              <div className="stat-sub">Satisfaction</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="form-side">
        <div className="form-container" role="main">
          <header className="brand">
            <div className="logo" aria-hidden>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="6" fill="#0FA76B"></rect>
                <path d="M8 12c1-4 8-7 11-6-2 3-6 9-11 11-1-2-1-4 0-5z" fill="#fff"></path>
              </svg>
            </div>
            <div className="brand-name">EcoCollect</div>
          </header>

          <h1 className="welcome">Welcome back</h1>
          <p className="sub">Sign in to your account to continue your eco journey</p>

          <div ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />

          {serverMessage && (
            <div className={`server-banner ${serverMessageType === "success" ? "success" : "error"}`} role={serverMessageType === "success" ? "status" : "alert"}>
              <div className="server-banner-inner">
                <div>{serverMessage}</div>
                <button className="banner-close" aria-label="Close message" onClick={() => { setServerMessage(""); setServerFieldErrors({}); }}>
                  ×
                </button>
              </div>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="field-label">
              Email
              <input
                ref={emailRef}
                type="email"
                name="email"
                placeholder="lqt@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!(clientErrors.email || serverFieldErrors.email)}
                aria-describedby={
                  clientErrors.email ? "email-client-error" : serverFieldErrors.email ? "email-server-error" : undefined
                }
              />
            </label>
            {clientErrors.email && (
              <div className="field-error" role="alert" id="email-client-error">
                {clientErrors.email}
              </div>
            )}
            {!clientErrors.email && serverFieldErrors.email && (
              <div className="field-error" role="alert" id="email-server-error">
                {serverFieldErrors.email}
              </div>
            )}

            <label className="field-label password-row">
              <span>Password</span>
              <a href="#" className="forgot">Forgot password?</a>
              <input
                ref={passwordRef}
                type="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!(clientErrors.password || serverFieldErrors.password)}
                aria-describedby={
                  clientErrors.password ? "password-client-error" : serverFieldErrors.password ? "password-server-error" : "password-hint"
                }
              />
            </label>
            {clientErrors.password && (
              <div className="field-error" role="alert" id="password-client-error">
                {clientErrors.password}
              </div>
            )}
            {!clientErrors.password && serverFieldErrors.password && (
              <div className="field-error" role="alert" id="password-server-error">
                {serverFieldErrors.password}
              </div>
            )}

            {!clientErrors.password && !serverFieldErrors.password && (
              <div className="field-hint" id="password-hint">
              </div>
            )}

            <button className="submit-btn" type="submit" disabled={status === "loading"} aria-busy={status === "loading"}>
              {status === "loading" ? (
                <span className="btn-content"><span className="spinner" aria-hidden /> Loading...</span>
              ) : (
                "Log In"
              )}
            </button>

            <div className="signup-line">Don't have an account? <a href="#">Sign Up</a></div>
          </form>
        </div>

        <div className="toast-wrap" aria-live="polite" aria-atomic="false">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.type === "success" ? "toast-success" : "toast-error"}`} role="status">
              <div className="toast-message">{t.message}</div>
              <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Close notification">×</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}