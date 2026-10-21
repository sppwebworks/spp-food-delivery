/**
 * ============================================================
 * NOT FOUND PAGE  (404)
 * ============================================================
 */

import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="empty-state" style={{ minHeight: "60vh" }}>
    <div className="empty-emoji" style={{ fontSize: 80 }}>
      404
    </div>
    <h2>Page not found</h2>
    <p>The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn-primary">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
