/**
 * Dashboard Components Barrel Export
 *
 * Central export point for all dashboard components
 * FASE 5.4 - Housekeeping Dashboard
 */

export { default as KPICard } from './KPICard';
export type { KPICardProps } from './KPICard';

export { default as VarianceChart } from './VarianceChart';
export type { VarianceChartProps } from './VarianceChart';

export { default as DiscrepanciesWidget } from './DiscrepanciesWidget';
export type { DiscrepanciesWidgetProps } from './DiscrepanciesWidget';

export { default as MaintenanceStatusWidget } from './MaintenanceStatusWidget';
export type { MaintenanceStatusWidgetProps } from './MaintenanceStatusWidget';

export { default as QuickActions } from './QuickActions';
export type { QuickActionsProps, QuickActionItem } from './QuickActions';

export { default as DashboardFilters } from './DashboardFilters';
export type { DashboardFiltersProps } from './DashboardFilters';

export { default as RoomStatusBreakdownCard } from './RoomStatusBreakdownCard';
export type { RoomStatusBreakdownCardProps } from './RoomStatusBreakdownCard';
