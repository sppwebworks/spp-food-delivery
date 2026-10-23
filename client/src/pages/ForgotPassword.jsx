import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

const ForgotPassword = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      showToast("Reset code sent to your email!", "success");
      // Navigate to reset page, passing the email in the URL
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send code", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>
        <p>Enter your email and we'll send you a 6-digit reset code.</p>
        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Code"}
        </button>
        <div className="auth-alt">
          <Link to="/login">← Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
