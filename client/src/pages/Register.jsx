/**
 * ============================================================
 * REGISTER PAGE  (/register)
 * ============================================================
 */

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { register, clearError } from "../features/auth/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const submit = (e) => {
    e.preventDefault();
    if (form.password.length < 6) return;
    dispatch(register(form));
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div style={{ textAlign: "center", fontSize: 48 }}>🍽️</div>
        <h1>Create account</h1>
        <p>Order your favorite food in minutes</p>

        {error && <div className="auth-error">{error}</div>}

        <input
          type="text"
          placeholder="Full name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email address"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="tel"
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
          }
          maxLength={10}
        />

        <input
          type="password"
          placeholder="Password (min 6 chars)"
          required
          minLength={6}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="btn-primary btn-large" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="auth-alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
