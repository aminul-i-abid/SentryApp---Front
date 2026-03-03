import React from "react";

export interface OccupancyBadgeProps {
  label: string;
  percentage: number;
  occupied: number;
  total: number;
  /** Tailwind text-color class for the percentage, e.g. "text-green-600" */
  colorClass?: string;
  /** Tailwind bg-color class for the card background */
  bgClass?: string;
}

/**
 * A small badge card showing occupancy for a category (e.g. trabajador, supervisora, gerente).
 * Left-aligned layout matching design mockup: large blue percentage, bold label, fraction.
 */
const OccupancyBadge: React.FC<OccupancyBadgeProps> = ({
  label,
  percentage,
  occupied,
  total,
  colorClass = "text-[#415EDE]",
  bgClass = "bg-white",
}) => (
  <div
    className={`flex flex-col gap-3 items-start rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm py-4 px-5 ${bgClass} dark:bg-white/[0.06]`}
  >
    <span className={`text-3xl font-bold leading-tight ${colorClass}`}>
      {percentage}%
    </span>
    <div className="flex flex-col gap-1">
      <span className="text-lg font-bold text-slate-800 dark:text-white mt-1.5 capitalize">
        {label}
      </span>
      <span className="text-md text-gray-500 dark:text-slate-500 mt-0.5">
        {occupied}/{total}
      </span>
    </div>
  </div>
);

export default OccupancyBadge;
