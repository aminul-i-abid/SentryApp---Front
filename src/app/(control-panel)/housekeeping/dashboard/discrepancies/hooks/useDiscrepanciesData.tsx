/**
 * useDiscrepanciesData Hook - FASE 5.4
 *
 * Fetches discrepancy details from the API with pagination and filtering
 * Supports multiple filter types: date range, discrepancy type, block ID
 * Integrates with Redux thunk for state management
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type {
  HousekeepingRecord,
  DiscrepancyType,
} from '@/store/housekeeping/housekeepingTypes';
import type {
  DiscrepancyFilters,
  DateRange,
  Discrepancy,
} from '../../types/dashboardTypes';

/**
 * Response structure for discrepancy details API
 */
interface DiscrepancyDetailsResponse {
  data: HousekeepingRecord[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Return type for useDiscrepanciesData hook
 */
export interface UseDiscrepanciesDataResult {
  discrepancies: Discrepancy[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: Partial<DiscrepancyFilters>) => void;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage discrepancy data with pagination
 *
 * @param campId - The camp ID to fetch discrepancies for
 * @param initialFilters - Optional initial filter state
 * @param initialPageSize - Optional initial page size (default: 10)
 * @returns Discrepancies data, loading state, pagination, and control methods
 *
 * @example
 * const { discrepancies, isLoading, page, setPage, refetch } = useDiscrepanciesData(campId, {
 *   dateRange: { startDate: new Date(), endDate: new Date() },
 *   type: 'sleep'
 * });
 */
export const useDiscrepanciesData = (
  campId: string,
  initialFilters?: Partial<DiscrepancyFilters>,
  initialPageSize: number = 10
): UseDiscrepanciesDataResult => {
  // ─── State Management ──────────────────────────────────────
  const dispatch = useAppDispatch();

  /**
   * Maps HousekeepingRecord to Discrepancy
   */
  const mapToDiscrepancy = (record: HousekeepingRecord): Discrepancy => {
    return {
      id: record.id,
      date: record.date,
      roomId: record.roomId,
      roomNumber: record.roomNumber || '',
      blockId: record.blockId || '',
      blockName: record.blockName || '',
      discrepancyType: 'skip' as DiscrepancyType, // Would need actual field from API
      expectedStatus: record.status || '',
      actualStatus: record.status || '',
      variance: 0, // Would need actual calculation from API
      varianceValue: 0,
      priority: 'medium',
      resolved: false,
      notes: '',
      createdAt: record.createdAt || new Date().toISOString(),
    };
  };

  // Discrepancy data state
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter state
  const [filters, setFiltersState] = useState<DiscrepancyFilters>({
    startDate: initialFilters?.startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: initialFilters?.endDate || new Date(),
    discrepancyTypes: initialFilters?.discrepancyTypes || [],
    blockIds: initialFilters?.blockIds || [],
    resolved: initialFilters?.resolved,
    searchTerm: initialFilters?.searchTerm || '',
    priorities: initialFilters?.priorities || [],
  });

  // ─── API Call Function ─────────────────────────────────────

  /**
   * Fetches discrepancy details from the API
   * Uses axios directly instead of thunk for fine-grained control
   */
  const fetchDiscrepanciesFromApi = useCallback(async () => {
    if (!campId) {
      setDiscrepancies([]);
      setTotalCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Format dates for API
      const startDate = filters.startDate ? filters.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const endDate = filters.endDate ? filters.endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      // Build query parameters
      const queryParams = new URLSearchParams({
        campId,
        startDate,
        endDate,
        pageNumber: page.toString(),
        pageSize: pageSize.toString(),
      });

      // Add optional filters
      if (filters.discrepancyTypes && filters.discrepancyTypes.length > 0) {
        filters.discrepancyTypes.forEach(type => queryParams.append('types', type));
      }

      if (filters.blockIds && filters.blockIds.length > 0) {
        filters.blockIds.forEach(blockId => queryParams.append('blockIds', blockId));
      }

      if (filters.resolved !== undefined) {
        queryParams.append('resolved', filters.resolved.toString());
      }

      if (filters.searchTerm) {
        queryParams.append('searchTerm', filters.searchTerm);
      }

      if (filters.priorities && filters.priorities.length > 0) {
        filters.priorities.forEach(priority => queryParams.append('priorities', priority));
      }

      // Fetch from API
      const response = await axios.get<DiscrepancyDetailsResponse>(
        `/api/HousekeepingDashboard/DiscrepancyDetails?${queryParams.toString()}`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data) {
        const mappedDiscrepancies = (response.data.data || []).map(mapToDiscrepancy);
        setDiscrepancies(mappedDiscrepancies);
        setTotalCount(response.data.totalCount || 0);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch discrepancy details';
      setError(errorMessage);
      setDiscrepancies([]);
      setTotalCount(0);
      console.error('Error fetching discrepancies:', err);
    } finally {
      setIsLoading(false);
    }
  }, [campId, filters, page, pageSize]);

  // ─── Side Effects ──────────────────────────────────────────

  /**
   * Fetch data when dependencies change
   */
  useEffect(() => {
    // Reset to page 1 when filters change
    if (page !== 1) {
      setPage(1);
      return;
    }
    fetchDiscrepanciesFromApi();
  }, [campId, filters, pageSize]);

  /**
   * Fetch data when page changes
   */
  useEffect(() => {
    fetchDiscrepanciesFromApi();
  }, [page]);

  // ─── Control Methods ──────────────────────────────────────

  /**
   * Update pagination page
   */
  const handleSetPage = useCallback((newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages || 1));
    setPage(validPage);
  }, [totalPages]);

  /**
   * Update page size
   */
  const handleSetPageSize = useCallback((newPageSize: number) => {
    setPageSize(Math.max(1, newPageSize));
    setPage(1); // Reset to first page
  }, []);

  /**
   * Update filters
   */
  const handleSetFilters = useCallback((newFilters: Partial<DiscrepancyFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setPage(1); // Reset to first page when filters change
  }, []);

  /**
   * Manual refetch of current data
   */
  const handleRefetch = useCallback(async () => {
    await fetchDiscrepanciesFromApi();
  }, [fetchDiscrepanciesFromApi]);

  // ─── Return Value ──────────────────────────────────────────

  return {
    discrepancies,
    totalCount,
    isLoading,
    error,
    page,
    pageSize,
    totalPages,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    setFilters: handleSetFilters,
    refetch: handleRefetch,
  };
};

/**
 * Variant hook that integrates with Redux thunks
 * Useful if you want to store discrepancies in global state
 */
export const useDiscrepanciesDataWithRedux = (
  campId: string,
  initialFilters?: Partial<DiscrepancyFilters>,
  initialPageSize: number = 10
) => {
  const dispatch = useAppDispatch();

  // This can be extended to use Redux thunks when they're available
  // For now, delegates to the base hook
  return useDiscrepanciesData(campId, initialFilters, initialPageSize);
};

/**
 * Custom hook for calculating discrepancy statistics
 * Provides summary data from the fetched discrepancies
 */
export const useDiscrepancyStats = (discrepancies: HousekeepingRecord[]) => {
  const stats = {
    totalDiscrepancies: discrepancies.length,
    sleepDiscrepancies: discrepancies.filter(
      (d) => d.censusData?.discrepancyType === 'sleep'
    ).length,
    skipDiscrepancies: discrepancies.filter(
      (d) => d.censusData?.discrepancyType === 'skip'
    ).length,
    countDiscrepancies: discrepancies.filter(
      (d) => d.censusData?.discrepancyType === 'count'
    ).length,
    resolvedCount: discrepancies.filter(
      (d) => d.status === 'Completed'
    ).length,
    pendingCount: discrepancies.filter(
      (d) => d.status === 'NotStarted' || d.status === 'InProgress'
    ).length,
  };

  return stats;
};
