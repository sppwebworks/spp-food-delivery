import { useMemo } from "react";

const DonutChart = ({ data = [], size = 200, thickness = 20 }) => {
  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data],
  );

  const { segments, radius, center } = useMemo(() => {
    if (total === 0) return { segments: [], radius: 0, center: size / 2 };

    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    let currentOffset = 0;

    const segs = data.map((d) => {
      const percentage = d.value / total;
      const strokeDasharray = `${percentage * c} ${c}`;
      const strokeDashoffset = -currentOffset * c;
      currentOffset += percentage;
      return { ...d, strokeDasharray, strokeDashoffset };
    });

    return { segments: segs, radius: r, center: size / 2 };
  }, [data, total, size, thickness]);

  if (total === 0) {
    return <div className="chart-empty">No orders yet</div>;
  }

  return (
    <div className="donut-wrap">
      <div
        className="donut-chart"
        style={{ width: size, height: size, position: "relative" }}
      >
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--adm-bg-3)"
            strokeWidth={thickness}
          />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={s.strokeDasharray}
              strokeDashoffset={s.strokeDashoffset}
              className="donut-segment"
            />
          ))}
        </svg>

        {/* Center Text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{ fontSize: 24, fontWeight: 800, color: "var(--adm-text)" }}
          >
            {total}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--adm-text-3)",
              textTransform: "uppercase",
            }}
          >
            Total
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="donut-legend">
        {segments.map((s) => (
          <div key={s.label} className="donut-legend-item">
            <span
              className="donut-legend-dot"
              style={{ background: s.color }}
            />
            <span className="donut-legend-label">{s.label}</span>
            <span className="donut-legend-value">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
