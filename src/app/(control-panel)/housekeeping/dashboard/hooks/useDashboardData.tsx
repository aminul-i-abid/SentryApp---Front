/**
 * useDashboardData Hook
 *
 * Fetches and processes dashboard data including daily summary, KPIs, and stats
 * API: GET /api/housekeeping/reports/daily-summary?campId={campId}&date={date}
 *
 * Data flow: API → axios → local useState → cards (no Redux in the display path)
 *
 * FASE 5.4 - Housekeeping Dashboard
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { DailySummary } from '@/store/housekeeping/housekeepingTypes';
import type { DashboardStats, KPIData } from '../types/dashboardTypes';
import { format } from 'date-fns';
import {
  housekeepingApi,
  transformDailySummaryDto,
  type BackendDailySummaryDto,
} from '@/store/housekeeping/housekeepingThunks';

/**
 * Hook state interface
 */
interface UseDashboardDataState {
  dailySummary: DailySummary | null;
  stats: DashboardStats | null;
  kpis: KPIData[];
  isLoading: boolean;
  isRefetching: boolean;
  error: string | null;
}

/**
 * Hook parameters
 */
interface UseDashboardDataParams {
  campId: string;
  date: Date;
  autoFetch?: boolean;
}

/**
 * Hook return type
 */
interface UseDashboardDataReturn extends UseDashboardDataState {
  refetch: () => Promise<void>;
  resetError: () => void;
}

// ─── Pure calculation functions (no hook dependencies) ────────────

export function calculateStats(summary: DailySummary): DashboardStats {
  const { occupancy, housekeeping, maintenance, discrepancies } = summary;

  return {
    totalRooms: occupancy.totalRooms,
    occupiedRooms: occupancy.actualOccupiedRooms,
    cleanRooms: occupancy.roomsCompleted,
    dirtyRooms: occupancy.roomsNotStarted + occupancy.roomsNotAssigned,
    maintenanceRooms: maintenance.criticalPending,
    tasksCompleted: housekeeping.tasksCompleted,
    tasksTotal: housekeeping.totalTasksAssigned,
    discrepanciesCount:
      discrepancies.skip +
      discrepancies.sleep +
      discrepancies.count,
    averageVariance: occupancy.variancePercent,
  };
}

export function calculateKPIs(summary: DailySummary): KPIData[] {
  const { occupancy, housekeeping, maintenance, discrepancies } = summary;
  const { vsYesterdayCompletionRate, vsYesterdayRoomsCompleted } = summary;

  const occupancyRate = occupancy.totalRooms > 0
    ? (occupancy.actualOccupiedRooms / occupancy.totalRooms) * 100
    : 0;
  const completionRate = housekeeping.completionRate;
  const variance = occupancy.variancePercent;

  const isOccupancyGood = occupancyRate >= 70;
  const isCompletionGood = completionRate >= 90;
  const isVarianceLow = Math.abs(variance) <= 5;

  const censusBeds = discrepancies.censusBeds ?? 0;
  const reservationBeds = discrepancies.reservationBeds ?? 0;
  const hasCensus = (occupancy.roomsCompleted + occupancy.roomsInProgress) > 0 || reservationBeds > 0;
  const censusDiff = censusBeds - reservationBeds;

  return [
    {
      title: 'Tasa de Ocupacion',
      value: occupancyRate,
      unit: '%',
      decimals: 1,
      showTrendLabel: false,
      trend: {
        value: variance,
        direction: variance > 0 ? 'up' : variance < 0 ? 'down' : 'stable',
        isGood: isOccupancyGood,
      },
      icon: 'heroicons-outline:home',
      color: isOccupancyGood ? 'success' : 'warning',
      subtitle: `${occupancy.actualOccupiedRooms}/${occupancy.totalRooms} habitaciones`,
    },
    {
      title: 'Cumplimiento de Tareas',
      value: completionRate.toFixed(1),
      unit: '%',
      trend: {
        value: vsYesterdayCompletionRate ?? 0,
        direction: vsYesterdayCompletionRate === null
          ? 'stable'
          : vsYesterdayCompletionRate > 0
            ? 'up'
            : vsYesterdayCompletionRate < 0
              ? 'down'
              : 'stable',
        isGood: isCompletionGood,
      },
      icon: 'heroicons-outline:check-circle',
      color: isCompletionGood ? 'success' : completionRate >= 70 ? 'warning' : 'error',
      subtitle: `${housekeeping.tasksCompleted}/${housekeeping.totalTasksAssigned} tareas`,
    },
    {
      title: 'Variacion de Ocupacion',
      value: Math.abs(variance).toFixed(1),
      unit: '%',
      showTrendLabel: false,
      trend: {
        value: variance,
        direction: variance > 0 ? 'up' : variance < 0 ? 'down' : 'stable',
        isGood: isVarianceLow,
      },
      icon: 'heroicons-outline:chart-bar',
      color: isVarianceLow ? 'success' : Math.abs(variance) <= 10 ? 'warning' : 'error',
      subtitle: variance > 0 ? 'Sobre lo esperado' : variance < 0 ? 'Bajo lo esperado' : 'Segun lo esperado',
    },
    {
      title: 'Personas en Campamento',
      value: censusBeds,
      icon: 'heroicons-outline:users',
      color: (!hasCensus
        ? 'info'
        : Math.abs(censusDiff) === 0
          ? 'success'
          : Math.abs(censusDiff) <= 5
            ? 'warning'
            : 'error') as 'success' | 'warning' | 'error' | 'info',
      subtitle: hasCensus
        ? `${censusBeds} censo · ${reservationBeds} reservas`
        : 'Sin censo registrado para esta fecha',
      trend: hasCensus ? {
        value: censusDiff,
        direction: (censusDiff > 0 ? 'up' : censusDiff < 0 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
        isGood: Math.abs(censusDiff) <= 2,
      } : undefined,
      showTrendLabel: false,
    },
    {
      title: 'Alertas de Mantenimiento',
      value: maintenance.criticalPending,
      trend: {
        value: maintenance.newAlerts,
        direction: maintenance.newAlerts > 0 ? 'up' : 'stable',
        isGood: maintenance.criticalPending === 0,
      },
      icon: 'heroicons-outline:wrench',
      color: maintenance.criticalPending === 0 ? 'success' : maintenance.criticalPending <= 3 ? 'warning' : 'error',
      subtitle: `${maintenance.newAlerts} nuevas, ${maintenance.resolvedAlerts} resueltas`,
    },
    {
      title: 'En Progreso',
      value: occupancy.roomsInProgress,
      trend: {
        value: vsYesterdayRoomsCompleted ?? 0,
        direction: vsYesterdayRoomsCompleted === null
          ? 'stable'
          : vsYesterdayRoomsCompleted > 0
            ? 'up'
            : vsYesterdayRoomsCompleted < 0
              ? 'down'
              : 'stable',
        isGood: occupancy.roomsInProgress > 0,
      },
      icon: 'heroicons-outline:clock',
      color: 'info',
      subtitle: `${occupancy.roomsInProgress} en progreso · ${occupancy.roomsNotAssigned} sin asignar`,
    },
  ];
}

// ─── Hook ─────────────────────────────────────────────────────────

/**
 * Custom hook for dashboard data management.
 *
 * Data flows directly: API response → local useState → cards.
 * No Redux store is involved in the display path, which guarantees
 * that every successful fetch immediately updates the rendered values.
 */
export const useDashboardData = ({
  campId,
  date,
  autoFetch = true,
}: UseDashboardDataParams): UseDashboardDataReturn => {
  // Local state — updated directly from the API response
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Track whether first load has succeeded (determines skeleton vs silent refresh)
  const hasLoadedOnce = useRef<boolean>(false);

  // Derive stats and kpis from local state
  const stats = useMemo(
    () => (dailySummary ? calculateStats(dailySummary) : null),
    [dailySummary],
  );

  const kpis = useMemo(
    () => (dailySummary ? calculateKPIs(dailySummary) : []),
    [dailySummary],
  );

  /**
   * Core fetch — calls the API directly and sets local state.
   * isLoading=true only on first load (shows skeletons).
   * isRefetching=true on subsequent fetches (cards stay visible).
   */
  const fetchData = useCallback(async (silent: boolean = false) => {
    if (!campId) {
      setError('El ID del campamento es requerido');
      return;
    }

    const isFirstLoad = !hasLoadedOnce.current;
    const useSkeletons = isFirstLoad && !silent;

    if (useSkeletons) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    setError(null);

    try {
      const dateString = format(date, 'yyyy-MM-dd');

      const timestamp = new Date().getTime();
      const response = await housekeepingApi.get<{
        succeeded: boolean;
        data: BackendDailySummaryDto;
      }>(`/reports/daily-summary?campId=${campId}&date=${dateString}&_t=${timestamp}`);

      if (!response.data.succeeded || !response.data.data) {
        throw new Error('No se pudo cargar el resumen diario');
      }

      const transformed = transformDailySummaryDto(response.data.data);
      transformed.campId = campId;
      // Direct state update — React will re-render immediately with new values
      setDailySummary(transformed);
      hasLoadedOnce.current = true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('[useDashboardData] Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [campId, date]);

  /**
   * Manual refetch — silent (no skeletons), keeps cards visible.
   */
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Auto-fetch on mount and when campId/date change
   */
  useEffect(() => {
    if (autoFetch && campId) {
      fetchData();
    }
  }, [autoFetch, campId, date, fetchData]);

  return {
    dailySummary,
    stats,
    kpis,
    isLoading,
    isRefetching,
    error,
    refetch,
    resetError,
  };
};

export default useDashboardData;
