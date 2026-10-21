import { useMemo } from "react";

const AreaChart = ({ data = [], accent = "#10b981", formatter = (v) => v }) => {
  const { path, areaPath, maxVal, points } = useMemo(() => {
    if (!data || data.length === 0)
      return { path: "", areaPath: "", maxVal: 0, points: [] };

    const max = Math.max(...data.map((d) => d.value), 100);
    const width = 500;
    const height = 200;
    const padX = 30;
    const padY = 30;

    const w = width - padX * 2;
    const h = height - padY * 2;

    const pts = data.map((d, i) => {
      const x = padX + i * (w / (data.length - 1 || 1));
      const y = height - padY - (d.value / max) * h;
      return { x, y, label: d.label, value: d.value };
    });

    // Create SVG path for the line
    let pathString = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      // Curved line interpolation (Bezier)
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      pathString += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    // Create SVG path for the shaded area underneath
    const areaString = `${pathString} L ${pts[pts.length - 1].x} ${height - padY} L ${pts[0].x} ${height - padY} Z`;

    return { path: pathString, areaPath: areaString, maxVal: max, points: pts };
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 500 200" className="chart-svg">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = 170 - ratio * 140;
          return (
            <g key={ratio}>
              <line
                x1="30"
                y1={y}
                x2="470"
                y2={y}
                stroke="var(--adm-border)"
                strokeDasharray="4"
              />
              <text
                x="20"
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--adm-text-3)"
              >
                {formatter(Math.round(maxVal * ratio))}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        <path d={areaPath} fill={accent} opacity="0.1" />

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Points & X-Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#fff"
              stroke={accent}
              strokeWidth="2"
            />
            <text
              x={p.x}
              y="195"
              textAnchor="middle"
              fontSize="10"
              fill="var(--adm-text-3)"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default AreaChart;
