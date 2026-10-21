const ProgressBar = ({ label, icon, value, max, color }) => {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div className="progress-row">
      <div className="progress-top">
        <span className="progress-label">
          {icon && <span className="progress-icon">{icon}</span>}
          {label}
        </span>
        <span className="progress-value">{value}</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
