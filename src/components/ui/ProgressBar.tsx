import React from "react";

export interface ProgressBarProps {
  /** Current value (e.g. occupied beds) */
  value: number;
  /** Maximum value (e.g. total beds) */
  max: number;
  /** Optional label shown to the right, e.g. "214 / 6011 camas" */
  label?: string;
  /** CSS class for the filled portion; defaults to blue */
  barColorClass?: string;
  /** Height class; defaults to h-3 */
  heightClass?: string;
}

/**
 * Custom Tailwind-based progress bar matching design mockup.
 * Blue filled portion + red remainder. Dot + label + large percentage.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  barColorClass = "bg-blue-500",
  heightClass = "h-2.5",
}) => {
  const pct = max > 0 ? Math.round((value / max) * 1000) / 10 : 0;

  return (
    <div className="w-full">
      {/* Label above bar, right-aligned */}
      {label && (
        <div className="flex justify-end mb-1 mr-24">
          <span className="text-[13px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-slate-800 dark:bg-slate-300" />
            {label}
          </span>
        </div>
      )}
      {/* Bar + separator + percentage in one row */}
      <div className="flex items-center gap-4">
        <div
          className={`flex-1 ${heightClass} rounded-full overflow-hidden bg-gray-200 dark:bg-white/10`}
        >
          <div
            className={`${heightClass} rounded-full transition-all duration-500`}
            style={{
              width: `${Math.min(pct, 100)}%`,
              background:
                "linear-gradient(91.77deg, #2661EB 54.66%, #F06225 113.08%)",
            }}
          />
        </div>
        {/* Separator + percentage */}
        <div className="w-px h-3 bg-gray-300 dark:bg-white/20 shrink-0" />
        <span className="text-4xl font-bold text-slate-800 dark:text-white shrink-0">
          {pct}%
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
