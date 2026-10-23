import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

const ResetPassword = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fill email if it came from the ForgotPassword page
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      showToast("Password reset successfully! Please log in.", "success");
      navigate("/login");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Reset failed. Check your code.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Reset Password</h1>
        <p>Enter the 6-digit code sent to your email.</p>

        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="admin-field">
          <span>6-Digit Code</span>
          <input
            type="text"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength={6}
            required
            placeholder="123456"
            style={{ letterSpacing: 4, fontSize: 18, textAlign: "center" }}
          />
        </label>

        <label className="admin-field">
          <span>New Password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            placeholder="At least 6 characters"
          />
        </label>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
