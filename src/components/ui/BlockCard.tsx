import React from "react";

export interface BlockCardProps {
  name: string;
  percentage: number;
  occupied: number;
  total: number;
  onClick?: () => void;
}

/**
 * Small card for individual block/pabellon occupancy.
 * Shows colored header strip, percentage, and beds fraction.
 */
const BlockCard: React.FC<BlockCardProps> = ({
  name,
  percentage,
  occupied,
  total,
  onClick,
}) => {
  // Color coding based on occupancy level
  const headerColor =
    percentage >= 80
      ? "bg-red-500"
      : percentage >= 50
        ? "bg-amber-400"
        : percentage > 0
          ? "bg-blue-500"
          : "bg-slate-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.06] overflow-hidden w-full cursor-pointer"
    >
      <div className="flex flex-col py-3 gap-3">
        <span
          className={`text-[11px] font-semibold text-[#415EDE] uppercase tracking-wide w-full px-3 py-1 ${headerColor} rounded-tr-xl rounded-br-xl`}
        >
          {name}
        </span>
        <div className="flex flex-col gap-1">
          <span className="pl-2 text-lg font-bold text-slate-800 dark:text-white">
            {percentage.toFixed(2)}%
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {occupied}/{total}
          </span>
        </div>
      </div>
    </button>
  );
};

export default BlockCard;
