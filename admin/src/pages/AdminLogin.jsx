import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  adminLogin,
  clearAdminError,
} from "../features/adminAuth/adminAuthSlice";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.adminAuth);

  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (user) navigate("/admin", { replace: true });
  }, [user, navigate]);

  useEffect(() => () => dispatch(clearAdminError()), [dispatch]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(adminLogin(form));
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-login-logo">
          <span>⚙️</span>
        </div>
        <h1>Admin Panel</h1>
        <p>Sign in to manage orders and users</p>

        {error && <div className="admin-login-error">{error}</div>}

        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="admin@foodie.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>

        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>

        <button className="admin-btn-primary" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="admin-login-hint">
          Demo: <strong>admin@foodie.com</strong> / password123
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
