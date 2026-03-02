import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";

/* Register Chart.js modules once */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

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
 * Smooth line chart using Chart.js + react-chartjs-2.
 * Matches the "Bed Occupancy – Coming Days" design: thick smooth curves,
 * no visible data-point dots, subtle dashed grid, toggle-style legend.
 */
const ChartLine: React.FC<ChartLineProps> = ({
  labels,
  series,
  height = 340,
  yLabel = "",
}) => {
  /* --- visibility toggles (one per series) --- */
  const [visible, setVisible] = useState<boolean[]>(() =>
    series.map(() => true),
  );
  const chartRef = useRef<ChartJS<"line"> | null>(null);

  const toggleSeries = useCallback((idx: number) => {
    setVisible((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
    const chart = chartRef.current;

    if (chart) {
      const meta = chart.getDatasetMeta(idx);
      meta.hidden = !meta.hidden;
      chart.update();
    }
  }, []);

  /* --- Chart.js data --- */
  const chartData: ChartData<"line"> = useMemo(
    () => ({
      labels,
      datasets: series.map((s, idx) => ({
        label: s.label,
        data: s.data,
        borderColor: s.color,
        backgroundColor: s.color + "14", // ~8 % opacity fill
        borderWidth: 2.5,
        tension: 0.15, // slight smoothing – keeps spiky peaks
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: s.color,
        pointHoverBorderWidth: 2.5,
        hidden: !visible[idx],
      })),
    }),
    [labels, series, visible],
  );

  /* --- Chart.js options --- */
  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      plugins: {
        legend: { display: false }, // we render our own legend
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#334155",
          bodyColor: "#64748b",
          borderColor: "#e2e8f0",
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          displayColors: true,
          boxPadding: 4,
          callbacks: {
            label: (ctx) =>
              ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: "#94A3B8",
            font: { size: 11 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 14,
          },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: {
            color: "#E2E8F0",
          },
          title: {
            display: !!yLabel,
            text: yLabel,
            color: "#94A3B8",
            font: { size: 11 },
          },
          ticks: {
            color: "#94A3B8",
            font: { size: 11 },
            callback: (value) =>
              typeof value === "number" ? value.toLocaleString() : value,
          },
        },
      },
    }),
    [yLabel],
  );

  const hasData = labels.length > 0 && series.some((s) => s.data.length > 0);

  return (
    <div className="w-full">
      {/* ---- Custom legend with toggle switches ---- */}
      <div className="flex items-center justify-end gap-5 mb-4 flex-wrap">
        {series.map((s, idx) => (
          <button
            key={s.label}
            type="button"
            onClick={() => toggleSeries(idx)}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            {/* Colored dot */}
            <span
              className="inline-block w-2.5 h-2.5 rounded-full transition-opacity"
              style={{
                backgroundColor: s.color,
                opacity: visible[idx] ? 1 : 0.35,
              }}
            />
            {/* Label */}
            <span
              className="text-xs font-medium transition-opacity"
              style={{
                color: visible[idx] ? "#64748b" : "#cbd5e1",
              }}
            >
              {s.label}
            </span>
            {/* Toggle pill */}
            <span
              className="relative inline-flex items-center w-7 h-4 rounded-full transition-colors"
              style={{
                backgroundColor: visible[idx] ? s.color + "30" : "#e2e8f0",
              }}
            >
              <span
                className="absolute w-3 h-3 rounded-full transition-all"
                style={{
                  backgroundColor: visible[idx] ? s.color : "#cbd5e1",
                  right: visible[idx] ? "2px" : undefined,
                  left: visible[idx] ? undefined : "2px",
                }}
              />
            </span>
          </button>
        ))}
      </div>

      {/* ---- Chart ---- */}
      {!hasData ? (
        <div
          className="flex items-center justify-center text-slate-400 text-sm"
          style={{ height: `${height}px` }}
        >
          No hay datos disponibles
        </div>
      ) : (
        <div style={{ height: `${height}px`, width: "100%" }}>
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      )}
    </div>
  );
};

export default ChartLine;
