import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { loading } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      showToast("Welcome back!", "success");
      navigate("/");
    } else {
      showToast(result.payload || "Login failed", "error");
    }
  };

  const fillDemoCredentials = () => {
    setEmail("customer@foodie.com");
    setPassword("password123");
    showToast("Test credentials filled! Click Sign In.", "info");
  };

  return (
    <div className="auth-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🍽️</div>
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to continue ordering food</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label className="login-label">Email Address</label>
            <div className="login-input-wrapper">
              <span className="login-icon">✉️</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="login-input"
              />
            </div>
          </div>

          <div className="login-input-group">
            <div className="login-label-row">
              <label className="login-label">Password</label>
              <Link to="/forgot-password" className="login-forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="login-input-wrapper">
              <span className="login-icon">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="login-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary login-submit"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            Don't have an account?{" "}
            <Link to="/register" className="login-register-link">
              Create one
            </Link>
          </p>

          <div className="login-demo-box" onClick={fillDemoCredentials}>
            <div className="login-demo-info">
              <span className="login-demo-icon">⚡</span>
              <div>
                <div className="login-demo-title">Test Account</div>
                <div className="login-demo-email">customer@foodie.com</div>
              </div>
            </div>
            <div className="login-demo-tag">AUTO FILL</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
