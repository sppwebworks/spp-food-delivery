import { useMemo } from "react";

const AdminLineChart = ({ data = [] }) => {
  // Data format expected: [{ _id: "2026-10-15", revenue: 5000 }, ...]
  const { points, maxVal, labels } = useMemo(() => {
    if (!data || data.length === 0)
      return { points: "", maxVal: 0, labels: [] };

    const max = Math.max(...data.map((d) => d.revenue), 100); // minimum scale
    const width = 600;
    const height = 200;
    const padding = 40;

    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    const pts = data.map((d, i) => {
      const x = padding + i * (innerWidth / (data.length - 1 || 1));
      const y = height - padding - (d.revenue / max) * innerHeight;
      return `${x},${y}`;
    });

    return {
      points: pts.join(" "),
      maxVal: max,
      labels: data.map((d) => {
        const parts = d._id.split("-");
        return `${parts[2]}/${parts[1]}`; // DD/MM format
      }),
    };
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="admin-chart-empty">No revenue data yet</div>;
  }

  return (
    <div className="admin-chart-wrap">
      <svg viewBox="0 0 600 200" className="admin-chart-svg">
        {/* Y Axis Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = 160 - ratio * 120;
          return (
            <g key={ratio}>
              <line
                x1="40"
                y1={y}
                x2="560"
                y2={y}
                stroke="var(--adm-border)"
                strokeDasharray="4 4"
              />
              <text
                x="35"
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--adm-text-3)"
              >
                ₹{Math.round(maxVal * ratio)}
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {labels.map((label, i) => {
          const x = 40 + i * (520 / (labels.length - 1 || 1));
          return (
            <text
              key={i}
              x={x}
              y="185"
              textAnchor="middle"
              fontSize="10"
              fill="var(--adm-text-3)"
            >
              {label}
            </text>
          );
        })}

        {/* The Line */}
        <polyline
          fill="none"
          stroke="var(--adm-primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Points (Dots) */}
        {points.split(" ").map((pt, i) => {
          const [x, y] = pt.split(",");
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#fff"
              stroke="var(--adm-primary)"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default AdminLineChart;
