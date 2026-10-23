import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, loadRider } from "../features/auth/riderAuthSlice";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { token, loading, error } = useSelector((s) => s.riderAuth);

  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (token) navigate("/", { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login(form));
    if (login.fulfilled.match(res)) {
      const load = await dispatch(loadRider());
      if (loadRider.rejected.match(load)) {
        showToast(load.payload || "Rider access denied", "error");
        localStorage.removeItem("riderToken");
        return;
      }
      showToast("Welcome!", "success");
      navigate("/", { replace: true });
    } else {
      showToast(res.payload || "Login failed", "error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f7f7",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48 }}>🛵</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "8px 0 4px" }}>
            Rider Login
          </h1>
          <p style={{ color: "#6b7280", fontSize: 13 }}>
            Sign in to start accepting deliveries
          </p>
        </div>

        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            marginBottom: 14,
            fontSize: 14,
          }}
        />

        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          Password
        </label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 14,
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#fc8019",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        {error && (
          <p
            style={{
              color: "#ef4444",
              fontSize: 13,
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
