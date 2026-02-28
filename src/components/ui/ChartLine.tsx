import React, { useMemo } from "react";

export interface ChartLineSeries {
  label: string;
  data: number[];
  color: string;
}

export interface ChartLineProps {
  labels: string[];
  series: ChartLineSeries[];
  height?: number;
  yLabel?: string;
}

/**
 * Pure SVG line chart built with Tailwind + inline styles. No external chart lib.
 * Supports multiple series with a built-in legend and smooth Catmull-Rom curves.
 */
const ChartLine: React.FC<ChartLineProps> = ({
  labels,
  series,
  height = 280,
  yLabel = "",
}) => {
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = 800;
  const chartH = height;
  const innerW = chartW - padding.left - padding.right;
  const innerH = chartH - padding.top - padding.bottom;

  // Compute global min/max across all series
  const { minVal, maxVal, yTicks } = useMemo(() => {
    let mn = Infinity;
    let mx = -Infinity;
    series.forEach((s) =>
      s.data.forEach((v) => {
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }),
    );

    if (!isFinite(mn)) mn = 0;
    if (!isFinite(mx)) mx = 100;

    // Round max up
    const range = mx - mn || 1;
    const step = Math.pow(10, Math.floor(Math.log10(range))) || 1;
    const adjMax = Math.ceil(mx / step) * step;
    const adjMin = Math.floor(mn / step) * step;

    const ticks: number[] = [];
    const tickStep = (adjMax - adjMin) / 5 || 1;
    for (let v = adjMin; v <= adjMax; v += tickStep) {
      ticks.push(Math.round(v));
    }
    return { minVal: adjMin, maxVal: adjMax, yTicks: ticks };
  }, [series]);

  const xStep = labels.length > 1 ? innerW / (labels.length - 1) : innerW;

  const toX = (i: number) => padding.left + i * xStep;
  const toY = (v: number) => {
    const ratio = maxVal !== minVal ? (v - minVal) / (maxVal - minVal) : 0;
    return padding.top + innerH - ratio * innerH;
  };

  /** Catmull-Rom smooth path */
  const buildSmoothPath = (data: number[]) => {
    if (data.length === 0) return "";
    const pts = data.map((v, i) => ({ x: toX(i), y: toY(v) }));
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    if (pts.length === 2)
      return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const buildSmoothArea = (data: number[]) => {
    const linePath = buildSmoothPath(data);
    if (!linePath) return "";
    const lastX = toX(data.length - 1).toFixed(1);
    const firstX = toX(0).toFixed(1);
    const baseY = (padding.top + innerH).toFixed(1);
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const hasData = labels.length > 0 && series.some((s) => s.data.length > 0);

  return (
    <div className="w-full">
      {/* Legend with toggle-style indicators */}
      <div className="flex items-center justify-end gap-5 mb-4 flex-wrap">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-xs text-slate-500 font-medium">{s.label}</span>
            {/* Toggle indicator (decorative, always on) */}
            <span
              className="relative inline-flex items-center w-7 h-4 rounded-full"
              style={{ backgroundColor: s.color + "30" }}
            >
              <span
                className="absolute right-0.5 w-3 h-3 rounded-full"
                style={{ backgroundColor: s.color }}
              />
            </span>
          </div>
        ))}
      </div>

      {!hasData ? (
        <div
          className="flex items-center justify-center text-slate-400 text-sm"
          style={{ height: `${height}px` }}
        >
          No hay datos disponibles
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y grid + tick labels */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={chartW - padding.right}
                y1={toY(tick)}
                y2={toY(tick)}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={toY(tick) + 4}
                textAnchor="end"
                fontSize={11}
                fill="#94A3B8"
              >
                {tick.toLocaleString()}
              </text>
            </g>
          ))}

          {/* Y axis label */}
          {yLabel && (
            <text
              x={14}
              y={padding.top + innerH / 2}
              textAnchor="middle"
              transform={`rotate(-90 14 ${padding.top + innerH / 2})`}
              fontSize={11}
              fill="#94A3B8"
            >
              {yLabel}
            </text>
          )}

          {/* X tick labels */}
          {labels.map((lbl, i) => (
            <text
              key={`${lbl}-${i}`}
              x={toX(i)}
              y={chartH - 8}
              textAnchor="middle"
              fontSize={11}
              fill="#94A3B8"
            >
              {lbl}
            </text>
          ))}

          {/* Series areas + smooth lines */}
          {series.map((s) =>
            s.data.length > 0 ? (
              <g key={s.label}>
                <path d={buildSmoothArea(s.data)} fill={s.color} opacity={0.08} />
                <path
                  d={buildSmoothPath(s.data)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Data points */}
                {s.data.map((v, i) => (
                  <circle
                    key={i}
                    cx={toX(i)}
                    cy={toY(v)}
                    r={3.5}
                    fill="white"
                    stroke={s.color}
                    strokeWidth={2}
                  />
                ))}
              </g>
            ) : null,
          )}
        </svg>
      )}
    </div>
  );
};

export default ChartLine;
