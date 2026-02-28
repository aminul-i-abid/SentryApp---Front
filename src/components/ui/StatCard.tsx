import React from "react";

export interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconBgColor?: string;
  iconColor?: string;
}

/**
 * Reusable stat card showing an icon, a large value, and a label.
 * Used for KPI summary rows (Campamentos, Contratistas, Habitaciones, etc.)
 */
const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  iconBgColor = "bg-blue-50",
  iconColor = "text-blue-600",
}) => (
  <div className="bg-[#F7F7F7] p-1.5 rounded-xl">
    <div className="flex flex-col items-center gap-2 rounded-xl bg-white border border-gray-100 px-4 py-5 shadow-sm hover:shadow-md transition-shadow w-full">
      <span
        className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBgColor} ${iconColor}`}
      >
        <img src={icon as string} />
      </span>
      <span className="text-3xl font-bold text-slate-800 leading-none">
        {value}
      </span>
      <span className="text-sm text-slate-500 font-medium">{label}</span>
    </div>
  </div>
);

export default StatCard;
