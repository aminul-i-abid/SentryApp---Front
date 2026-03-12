/**
 * useRealTimeUpdates Hook
 *
 * Provides auto-refresh mechanism for dashboard data with configurable interval.
 * Delegates the actual data fetch to the `onRefetch` callback (from useDashboardData),
 * so data always flows: API → local state → cards (no Redux).
 *
 * FASE 5.4 - Housekeeping Dashboard
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';

/**
 * Real-time configuration
 */
interface RealTimeConfig {
  campId: string;
  date: Date;
  interval?: number; // in milliseconds
  enabled?: boolean;
  /** Called on each refresh cycle — should trigger a data fetch and update local state */
  onRefetch?: () => Promise<void>;
  onUpdate?: (timestamp: Date) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook return type
 */
interface UseRealTimeUpdatesReturn {
  isRealTime: boolean;
  setIsRealTime: (enabled: boolean) => void;
  lastUpdate: Date | null;
  forceRefresh: () => Promise<void>;
  isRefreshing: boolean;
  error: string | null;
}

/**
 * Default refresh interval (30 seconds)
 */
const DEFAULT_INTERVAL = 30000;

/**
 * Custom hook for real-time dashboard updates.
 *
 * Manages the refresh timer and delegates data fetching to `onRefetch`.
 * This keeps it decoupled from any specific data-fetching strategy.
 */
export const useRealTimeUpdates = ({
  campId,
  interval = DEFAULT_INTERVAL,
  enabled = false,
  onRefetch,
  onUpdate,
  onError,
}: RealTimeConfig): UseRealTimeUpdatesReturn => {
  const [isRealTime, setIsRealTime] = useState<boolean>(enabled);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Store callbacks in refs to avoid stale closures without re-creating fetchLatestData
  const onRefetchRef = useRef(onRefetch);
  const onUpdateRef = useRef(onUpdate);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onRefetchRef.current = onRefetch;
    onUpdateRef.current = onUpdate;
    onErrorRef.current = onError;
  });

  /**
   * Execute one refresh cycle: call onRefetch, then update timestamp.
   */
  const fetchLatestData = useCallback(async () => {
    if (!campId) {
      const err = new Error('Camp ID is required for real-time updates');
      setError(err.message);
      onErrorRef.current?.(err);
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      // Delegate to the data-fetching hook (updates local state directly)
      if (onRefetchRef.current) {
        await onRefetchRef.current();
      }

      if (isMountedRef.current) {
        const updateTime = new Date();
        setLastUpdate(updateTime);
        onUpdateRef.current?.(updateTime);
        console.log(`[useRealTimeUpdates] Refreshed at ${format(updateTime, 'HH:mm:ss')}`);
      }
    } catch (err) {
      const error = err instanceof Error
        ? err
        : new Error('An unexpected error occurred during refresh');

      if (isMountedRef.current) {
        setError(error.message);
        onErrorRef.current?.(error);
      }
      console.error('[useRealTimeUpdates] Refresh error:', error);
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [campId]);

  /**
   * Force immediate refresh
   */
  const forceRefresh = useCallback(async () => {
    await fetchLatestData();
  }, [fetchLatestData]);

  /**
   * Start interval-based polling
   */
  const startRealTime = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    console.log(`[useRealTimeUpdates] Starting (interval: ${interval}ms)`);
    fetchLatestData();
    intervalRef.current = setInterval(fetchLatestData, interval);
  }, [interval, fetchLatestData]);

  /**
   * Stop interval-based polling
   */
  const stopRealTime = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('[useRealTimeUpdates] Stopped');
    }
  }, []);

  /**
   * Start/stop based on isRealTime state
   */
  useEffect(() => {
    if (isRealTime && campId) {
      startRealTime();
    } else {
      stopRealTime();
    }
    return () => { stopRealTime(); };
  }, [isRealTime, campId, startRealTime, stopRealTime]);

  /**
   * Restart when interval changes while running
   */
  useEffect(() => {
    if (isRealTime && intervalRef.current) {
      stopRealTime();
      startRealTime();
    }
  }, [interval, isRealTime, startRealTime, stopRealTime]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopRealTime();
    };
  }, [stopRealTime]);

  return {
    isRealTime,
    setIsRealTime,
    lastUpdate,
    forceRefresh,
    isRefreshing,
    error,
  };
};

export default useRealTimeUpdates;
