import { useMemo } from "react";

const BarChart = ({ data = [], accent = "#fc8019" }) => {
  const { bars, maxVal } = useMemo(() => {
    if (!data || data.length === 0) return { bars: [], maxVal: 0 };
    const max = Math.max(...data.map((d) => d.value), 5);
    return { bars: data, maxVal: max };
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 500 200" className="chart-svg">
        {/* Grid */}
        {[0, 0.5, 1].map((ratio) => {
          const y = 170 - ratio * 140;
          return (
            <line
              key={ratio}
              x1="30"
              y1={y}
              x2="470"
              y2={y}
              stroke="var(--adm-border)"
              strokeDasharray="4"
            />
          );
        })}

        {/* Bars */}
        {bars.map((d, i) => {
          const barWidth = 30;
          const spacing =
            (440 - bars.length * barWidth) / (bars.length - 1 || 1);
          const x = 40 + i * (barWidth + spacing);
          const barHeight = (d.value / maxVal) * 140;
          const y = 170 - barHeight;

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={accent}
                rx="4"
                className="chart-bar"
              />
              {/* Value */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="var(--adm-text)"
              >
                {d.value}
              </text>
              {/* Label */}
              <text
                x={x + barWidth / 2}
                y="195"
                textAnchor="middle"
                fontSize="10"
                fill="var(--adm-text-3)"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default BarChart;
