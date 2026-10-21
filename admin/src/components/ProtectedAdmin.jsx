/**
 * Route guard for admin pages.
 * Redirects to /admin/login if not authenticated.
 */
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedAdmin = ({ children }) => {
  const { token, bootstrapped } = useSelector((s) => s.adminAuth);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Still verifying token with backend
  if (!bootstrapped) {
    return (
      <div className="admin-boot">
        <div className="admin-boot-spinner" />
        <p>Verifying session...</p>
      </div>
    );
  }

  return children;
};

export default ProtectedAdmin;
