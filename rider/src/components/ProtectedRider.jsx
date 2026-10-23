import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadRider } from "../features/auth/riderAuthSlice";

const ProtectedRider = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token, rider, loaded, error } = useSelector((s) => s.riderAuth);

  useEffect(() => {
    if (token && !rider && !loaded) dispatch(loadRider());
  }, [token, rider, loaded, dispatch]);

  if (!token)
    return <Navigate to="/login" state={{ from: location }} replace />;
  if (!loaded)
    return <div style={{ padding: 40, textAlign: "center" }}>Loading…</div>;
  if (error)
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
        {error}
      </div>
    );
  return children;
};

export default ProtectedRider;
