/**
 * useKanbanData Hook
 *
 * Custom React hook for managing maintenance alerts in Kanban view
 * - Fetches maintenance alerts using Redux thunk: fetchAlerts
 * - Groups alerts by status (Pending/InProgress/Resolved/Cancelled)
 * - Applies filters: severity, category, room
 * - Handles loading and error states
 * - Provides manual refetch capability
 *
 * @returns {UseKanbanDataReturn} Object with grouped alerts and state
 *
 * @example
 * const {
 *   alertsByStatus,
 *   allAlerts,
 *   isLoading,
 *   error,
 *   refetch
 * } = useKanbanData({ campId: 'camp-123' });
 */

import { useEffect, useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAlerts } from '@/store/maintenance';
import type {
  MaintenanceAlert,
  AlertStatus,
  AlertSeverity,
  MaintenanceFilters,
} from '@/store/maintenance/maintenanceTypes';

// ─── TYPES ────────────────────────────────────────────────────────────

export interface UseKanbanDataFilters {
  /** Camp ID for filtering alerts */
  campId: string;
  /** Optional severity filter (Low/Medium/Critical) */
  severity?: AlertSeverity;
  /** Optional category ID filter */
  categoryId?: string;
  /** Optional room ID filter */
  roomId?: string;
  /** Optional room number search */
  searchQuery?: string;
  /** Optional status filter - if not provided, fetches all statuses */
  status?: AlertStatus;
}

export interface AlertsByStatus {
  /** Alerts with Pending status */
  Pending: MaintenanceAlert[];
  /** Alerts with InProgress status */
  InProgress: MaintenanceAlert[];
  /** Alerts with Resolved status */
  Resolved: MaintenanceAlert[];
  /** Alerts with Cancelled status */
  Cancelled: MaintenanceAlert[];
}

export interface UseKanbanDataReturn {
  /** Alerts grouped by status for Kanban columns */
  alertsByStatus: AlertsByStatus;
  /** All alerts as flat array (after filtering) */
  allAlerts: MaintenanceAlert[];
  /** Loading state during fetch */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Function to manually trigger refetch */
  refetch: () => Promise<void>;
  /** Total count of alerts by status */
  counts: Record<AlertStatus, number>;
}

// ─── HOOK ─────────────────────────────────────────────────────────────

export function useKanbanData(filters: UseKanbanDataFilters): UseKanbanDataReturn {
  const dispatch = useAppDispatch();
  const [isRefetching, setIsRefetching] = useState(false);

  // Get maintenance state from Redux store
  const { alerts, loading: reduxLoading, error: reduxError } = useAppSelector(
    (state) => state.maintenance
  );

  // Combine loading states
  const isLoading = reduxLoading || isRefetching;

  // Build filter params for API call
  const filterParams: MaintenanceFilters = useMemo(
    () => ({
      campId: filters.campId,
      ...(filters.severity && { severity: filters.severity }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.roomId && { roomId: filters.roomId }),
      ...(filters.status && { status: filters.status }),
    }),
    [
      filters.campId,
      filters.severity,
      filters.categoryId,
      filters.roomId,
      filters.status,
    ]
  );

  // Fetch alerts on component mount or filter changes
  const fetchData = useCallback(async () => {
    try {
      setIsRefetching(true);
      await dispatch(fetchAlerts(filterParams)).unwrap();
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setIsRefetching(false);
    }
  }, [dispatch, filterParams]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply text search filter (room number/description)
  const filteredAlerts = useMemo(() => {
    if (!filters.searchQuery || !alerts) return alerts || [];

    const query = filters.searchQuery.toLowerCase().trim();
    return alerts.filter(
      (alert) =>
        alert.roomNumber.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query) ||
        alert.categoryName?.toLowerCase().includes(query)
    );
  }, [alerts, filters.searchQuery]);

  // Group alerts by status
  const alertsByStatus = useMemo((): AlertsByStatus => {
    const grouped: AlertsByStatus = {
      Pending: [],
      InProgress: [],
      Resolved: [],
      Cancelled: [],
    };

    if (!filteredAlerts) return grouped;

    filteredAlerts.forEach((alert) => {
      if (alert.currentStatus in grouped) {
        grouped[alert.currentStatus as AlertStatus].push(alert);
      }
    });

    // Sort alerts within each group by severity and date
    Object.keys(grouped).forEach((status) => {
      grouped[status as AlertStatus].sort((a, b) => {
        // Priority: Critical > Medium > Low
        const severityOrder = { Critical: 0, Medium: 1, Low: 2 };
        const aPriority = severityOrder[a.severity] ?? 999;
        const bPriority = severityOrder[b.severity] ?? 999;

        if (aPriority !== bPriority) return aPriority - bPriority;

        // Secondary sort: newer alerts first
        return (
          new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
        );
      });
    });

    return grouped;
  }, [filteredAlerts]);

  // Calculate counts per status
  const counts = useMemo(
    () => ({
      Pending: alertsByStatus.Pending.length,
      InProgress: alertsByStatus.InProgress.length,
      Resolved: alertsByStatus.Resolved.length,
      Cancelled: alertsByStatus.Cancelled.length,
    }),
    [alertsByStatus]
  );

  // Handle refetch with error state reset
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    alertsByStatus,
    allAlerts: filteredAlerts || [],
    isLoading,
    error: reduxError,
    refetch,
    counts,
  };
}

export default useKanbanData;
