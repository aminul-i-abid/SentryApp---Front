/**
 * Types for Dashboard functionality
 * FASE 5.4 - Housekeeping Dashboard
 */

import type { HousekeepingRecord, DailySummary, MaintenanceAlert } from '@/store/housekeeping/housekeepingTypes';

/**
 * KPI Card data structure
 */
export interface KPIData {
  title: string;
  value: number | string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    isGood: boolean;
  };
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  unit?: string;
  decimals?: number;
  showTrendLabel?: boolean;
}

/**
 * Variance data point for charts
 */
export interface VarianceDataPoint {
  date: string;
  expectedOccupied: number;
  actualOccupied: number;
  variance: number;
  variancePercent: number;
  discrepanciesCount: number;
}

/**
 * Date range for filters
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Dashboard filters state
 */
export interface DashboardFilters {
  dateRange: DateRange;
  blockId?: string;
  groupBy: 'day' | 'week' | 'month';
  chartType: 'line' | 'bar' | 'area';
}

/**
 * Dashboard home state
 */
export interface DashboardHomeState {
  selectedDate: Date;
  autoRefresh: boolean;
  refreshInterval: number;
  isRealTime: boolean;
  lastUpdate?: Date;
}

/**
 * Variance analysis state
 */
export interface VarianceAnalysisState {
  filters: DashboardFilters;
  data: VarianceDataPoint[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Alert status for Kanban
 */
export type AlertStatus = 'Pending' | 'InProgress' | 'Resolved' | 'Cancelled';

/**
 * Alert filters for Kanban
 */
export interface AlertFilters {
  severity?: 'Critical' | 'High' | 'Medium' | 'Low';
  category?: string;
  roomNumber?: string;
  assignedTo?: string;
  searchTerm?: string;
}

/**
 * Kanban board state
 */
export interface KanbanBoardState {
  alerts: MaintenanceAlert[];
  filters: AlertFilters;
  selectedAlerts: string[];
  isLoading: boolean;
}

/**
 * Discrepancy type
 */
export type DiscrepancyType = 'skip' | 'sleep' | 'count';

/**
 * Discrepancy record
 */
export interface Discrepancy {
  id: string;
  date: string;
  roomId: string;
  roomNumber: string;
  blockId: string;
  blockName: string;
  discrepancyType: DiscrepancyType;
  expectedStatus: string;
  actualStatus: string;
  variance: number;
  varianceValue?: number;
  priority: 'high' | 'medium' | 'low';
  resolved: boolean;
  notes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

/**
 * Discrepancy filters
 */
export interface DiscrepancyFilters {
  startDate?: Date;
  endDate?: Date;
  discrepancyTypes?: DiscrepancyType[];
  blockIds?: string[];
  priorities?: ('high' | 'medium' | 'low')[];
  resolved?: boolean;
  searchTerm?: string;
}

/**
 * Corrective action for discrepancies
 */
export interface CorrectiveAction {
  type: 'verify_reservation' | 'check_room' | 'notify_guest' | 'maintenance_alert' | 'manual_review';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  autoExecutable: boolean;
}

/**
 * Export format options
 */
export type ExportFormat = 'excel' | 'pdf' | 'png' | 'csv';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeCharts?: boolean;
  dateRange?: DateRange;
}

/**
 * Chart export options
 */
export interface ChartExportOptions {
  format: 'png' | 'svg' | 'pdf';
  width?: number;
  height?: number;
  backgroundColor?: string;
}

/**
 * Real-time update configuration
 */
export interface RealTimeConfig {
  enabled: boolean;
  interval: number;
  lastUpdate: Date;
}

/**
 * Dashboard statistics summary
 */
export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  cleanRooms: number;
  dirtyRooms: number;
  maintenanceRooms: number;
  tasksCompleted: number;
  tasksTotal: number;
  discrepanciesCount: number;
  averageVariance: number;
}

/**
 * Quick action item
 */
export interface QuickActionItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  count?: number;
}

/**
 * Chart data point (generic)
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

/**
 * Trend indicator
 */
export interface TrendIndicator {
  value: number;
  direction: 'up' | 'down' | 'stable';
  isPositive: boolean;
  percentage: number;
}

/**
 * Dashboard widget configuration
 */
export interface WidgetConfig {
  id: string;
  title: string;
  type: 'kpi' | 'chart' | 'table' | 'list';
  size: 'small' | 'medium' | 'large';
  refreshInterval?: number;
  visible: boolean;
}
