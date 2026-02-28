import React from "react";

export interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

/**
 * Generic white rounded card wrapper. Used as a section container throughout the dashboard.
 */
const CardContainer: React.FC<CardContainerProps> = ({
  children,
  className = "",
  title,
}) => (
  <div
    className={`rounded-2xl bg-white border border-gray-100 shadow-sm ${className}`}
  >
    {title && (
      <h3 className="text-2xl font-semibold text-slate-800 px-6 pt-5 pb-0">
        {title}
      </h3>
    )}
    <div className="px-6 py-5">{children}</div>
  </div>
);

export default CardContainer;
