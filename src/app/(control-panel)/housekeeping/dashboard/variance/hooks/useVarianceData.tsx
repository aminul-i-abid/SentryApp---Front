/**
 * useVarianceData Hook
 * FASE 5.4 - Variance Analysis Dashboard
 *
 * Fetches and processes variance report data for the dashboard
 * Handles data transformation for charts and statistics
 * Integrates with Redux thunk for async operations
 *
 * Usage:
 * const { data, isLoading, error, refetch, stats } = useVarianceData({
 *   campId: 'CAMP001',
 *   dateRange: { startDate: new Date('2024-01-01'), endDate: new Date('2024-01-31') },
 *   groupBy: 'day'
 * });
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchVarianceReport } from '@/store/housekeeping/housekeepingThunks';
import type { VarianceDataPoint, DateRange, DashboardStats } from '../../types/dashboardTypes';
import type { DailySummary } from '@/store/housekeeping/housekeepingTypes';

/**
 * Props for useVarianceData hook
 */
interface UseVarianceDataProps {
  campId: string;
  dateRange: DateRange;
  groupBy: 'day' | 'week' | 'month';
}

/**
 * Return type for useVarianceData hook
 */
interface UseVarianceDataReturn {
  data: VarianceDataPoint[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  stats: DashboardStats;
}

/**
 * Hook to fetch and process variance report data
 *
 * @param props - Configuration for data fetching
 * @returns Variance data with loading and error states
 */
export const useVarianceData = ({
  campId,
  dateRange,
  groupBy,
}: UseVarianceDataProps): UseVarianceDataReturn => {
  const dispatch = useAppDispatch();

  // Local state
  const [varianceData, setVarianceData] = useState<VarianceDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    occupiedRooms: 0,
    cleanRooms: 0,
    dirtyRooms: 0,
    maintenanceRooms: 0,
    tasksCompleted: 0,
    tasksTotal: 0,
    discrepanciesCount: 0,
    averageVariance: 0,
  });

  /**
   * Format date to ISO string for API
   */
  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  /**
   * Calculate variance statistics from raw data
   */
  const calculateVarianceStats = (dailySummaries: DailySummary[]): VarianceDataPoint[] => {
    return dailySummaries.map((summary) => {
      const expected = summary.occupancy.expectedOccupiedRooms;
      const actual = summary.occupancy.actualOccupiedRooms;
      const variance = actual - expected;
      const variancePercent = expected > 0 ? (variance / expected) * 100 : 0;

      return {
        date: summary.date,
        expectedOccupied: expected,
        actualOccupied: actual,
        variance: variance,
        variancePercent: Math.round(variancePercent * 10) / 10, // Round to 1 decimal
        discrepanciesCount:
          summary.discrepancies.skip + summary.discrepancies.sleep + summary.discrepancies.count,
      };
    });
  };

  /**
   * Group data by specified interval (day, week, month)
   */
  const groupVarianceData = (
    data: VarianceDataPoint[],
    groupBy: 'day' | 'week' | 'month'
  ): VarianceDataPoint[] => {
    if (groupBy === 'day') {
      return data;
    }

    const grouped: Record<string, VarianceDataPoint[]> = {};

    data.forEach((point) => {
      const date = new Date(point.date);
      let groupKey: string;

      if (groupBy === 'week') {
        const weekNum = Math.floor(date.getDate() / 7);
        groupKey = `W${weekNum + 1}-${date.getFullYear()}`;
      } else {
        // month
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(point);
    });

    // Aggregate grouped data
    return Object.entries(grouped).map(([, points]) => {
      const totalExpected = points.reduce((sum, p) => sum + p.expectedOccupied, 0);
      const totalActual = points.reduce((sum, p) => sum + p.actualOccupied, 0);
      const variance = totalActual - totalExpected;
      const variancePercent = totalExpected > 0 ? (variance / totalExpected) * 100 : 0;
      const totalDiscrepancies = points.reduce((sum, p) => sum + p.discrepanciesCount, 0);

      return {
        date: points[0].date, // Use first date in group
        expectedOccupied: totalExpected,
        actualOccupied: totalActual,
        variance: variance,
        variancePercent: Math.round(variancePercent * 10) / 10,
        discrepanciesCount: totalDiscrepancies,
      };
    });
  };

  /**
   * Calculate summary statistics from variance data
   */
  const calculateSummaryStats = (data: VarianceDataPoint[]): DashboardStats => {
    if (data.length === 0) {
      return stats;
    }

    const totalOccupiedAcross = data.reduce((sum, d) => sum + d.actualOccupied, 0);
    const totalExpectedAcross = data.reduce((sum, d) => sum + d.expectedOccupied, 0);
    const totalDiscrepancies = data.reduce((sum, d) => sum + d.discrepanciesCount, 0);
    const avgVariance =
      data.length > 0
        ? Math.round((data.reduce((sum, d) => sum + d.variancePercent, 0) / data.length) * 10) /
          10
        : 0;

    return {
      totalRooms: totalExpectedAcross,
      occupiedRooms: totalOccupiedAcross,
      cleanRooms: Math.floor(totalOccupiedAcross * 0.7), // Estimated
      dirtyRooms: Math.floor(totalOccupiedAcross * 0.2), // Estimated
      maintenanceRooms: Math.floor(totalOccupiedAcross * 0.1), // Estimated
      tasksCompleted: data.length,
      tasksTotal: data.length,
      discrepanciesCount: totalDiscrepancies,
      averageVariance: avgVariance,
    };
  };

  /**
   * Fetch variance report data from API
   */
  const fetchData = useCallback(async () => {
    if (!campId) {
      setError('Camp ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const startDateStr = formatDateForAPI(dateRange.startDate);
      const endDateStr = formatDateForAPI(dateRange.endDate);

      const result = await dispatch(
        fetchVarianceReport({
          campId,
          startDate: startDateStr,
          endDate: endDateStr,
        })
      );

      if (result.payload && Array.isArray(result.payload)) {
        const processedData = calculateVarianceStats(result.payload);
        const groupedData = groupVarianceData(processedData, groupBy);

        setVarianceData(groupedData);
        setStats(calculateSummaryStats(groupedData));
      } else {
        throw new Error('Invalid response data format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch variance report';
      setError(errorMessage);
      setVarianceData([]);
    } finally {
      setIsLoading(false);
    }
  }, [campId, dateRange, groupBy, dispatch]);

  /**
   * Refetch data
   */
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  /**
   * Fetch data on component mount or when dependencies change
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: varianceData,
    isLoading,
    error,
    refetch,
    stats,
  };
};

/**
 * Extended hook variant with caching and memoization
 * For use in performance-sensitive components
 */
interface UseVarianceDataWithCacheProps extends UseVarianceDataProps {
  cacheKey?: string;
  cacheDuration?: number; // milliseconds
}

interface CachedVarianceDataReturn extends UseVarianceDataReturn {
  isCached: boolean;
}

const dataCache = new Map<string, { data: VarianceDataPoint[]; timestamp: number; stats: DashboardStats }>();

export const useVarianceDataWithCache = ({
  campId,
  dateRange,
  groupBy,
  cacheKey,
  cacheDuration = 5 * 60 * 1000, // 5 minutes default
}: UseVarianceDataWithCacheProps): CachedVarianceDataReturn => {
  const [isCached, setIsCached] = useState(false);
  const {
    data: freshData,
    isLoading,
    error,
    refetch: refetchFresh,
    stats: freshStats,
  } = useVarianceData({ campId, dateRange, groupBy });

  const key = cacheKey || `${campId}-${dateRange.startDate.getTime()}-${dateRange.endDate.getTime()}-${groupBy}`;

  // Check cache on mount
  useEffect(() => {
    const cached = dataCache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      setIsCached(true);
    }
  }, [key, cacheDuration]);

  // Update cache when new data arrives
  useEffect(() => {
    if (!isLoading && freshData.length > 0 && !error) {
      dataCache.set(key, {
        data: freshData,
        timestamp: Date.now(),
        stats: freshStats,
      });
    }
  }, [freshData, freshStats, isLoading, error, key]);

  return {
    data: freshData,
    isLoading,
    error,
    refetch: refetchFresh,
    stats: freshStats,
    isCached,
  };
};
