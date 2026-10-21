/**
 * ============================================================
 * STAT CARD — KPI tile with trend indicator
 * ============================================================
 */

const StatCard = ({ label, value, icon, accent = "orange", trend = null, subtitle = "" }) => {
  const trendUp = trend && trend > 0;
  const trendDown = trend && trend < 0;

  return (
    <div className={`admin-stat-card admin-stat-${accent}`}>
      <div className="admin-stat-top">
        <div className="admin-stat-icon">{icon}</div>
        {trend !== null && (
          <span className={`admin-stat-trend ${trendUp ? "up" : trendDown ? "down" : "flat"}`}>
            {trendUp ? "↑" : trendDown ? "↓" : "→"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="admin-stat-body">
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
        {subtitle && <div className="admin-stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatCard;