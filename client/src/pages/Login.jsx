/**
 * ============================================================
 * LOGIN PAGE  (/login)
 * ============================================================
 *
 * Design:
 *   ┌──────────────────────────────┐
 *   │         🍽️                    │
 *   │     Welcome to SPP FoodieApp      │
 *   │  Sign in to continue ordering │
 *   │                               │
 *   │  [ Email                    ] │
 *   │  [ Password                 ] │
 *   │                               │
 *   │  [       Sign In           ] │
 *   │                               │
 *   │  No account? Register         │
 *   └──────────────────────────────┘
 * ============================================================
 */

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login, clearError } from "../features/auth/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  // Redirect to home (or return-to) when logged in
  useEffect(() => {
    if (user) {
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location]);

  // Clear any previous error when leaving the page
  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div style={{ textAlign: "center", fontSize: 48 }}>🍽️</div>
        <h1>Welcome back</h1>
        <p>Sign in to continue ordering food</p>

        {error && <div className="auth-error">{error}</div>}

        <input
          type="email"
          placeholder="Email address"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          required
          autoComplete="current-password"
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="btn-primary btn-large" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-alt">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "var(--bg-2)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--text-3)",
            textAlign: "center",
          }}
        >
          Demo: <strong>customer@foodie.com</strong> / password123
        </div>
      </form>
    </div>
  );
};

export default Login;
