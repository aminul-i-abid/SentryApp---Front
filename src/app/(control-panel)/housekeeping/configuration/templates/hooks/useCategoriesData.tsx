/**
 * useCategoriesData Hook
 *
 * TASK-FR4: Migrated from apiService direct calls to Redux fetchTags thunk.
 * Fetches template tags (formerly "categories") from Redux store.
 * Maintains the same return interface for backward compatibility with consumers.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTags } from '@/store/housekeeping/housekeepingThunks';
import type { TemplateTag } from '@/store/housekeeping/housekeepingTypes';

interface UseCategoriesDataProps {
  campId: string;
  onlyActive?: boolean;
}

/**
 * Compatibility type alias — consumers that use TaskCategory shape
 * are handled because TemplateTag has the same key fields (id, name, description, isActive).
 */
export const useCategoriesData = ({
  campId,
  onlyActive = true,
}: UseCategoriesDataProps) => {
  const dispatch = useAppDispatch();

  // Read tags from Redux store
  const allTags = useAppSelector((state) => state.housekeeping.tags);
  const loading = useAppSelector((state) => state.housekeeping.loading);

  // Filter by active if needed
  const categories: TemplateTag[] = onlyActive
    ? allTags.filter((tag) => tag.isActive)
    : allTags;

  /**
   * Fetch tags when campId changes
   */
  useEffect(() => {
    if (campId) {
      dispatch(fetchTags({ campId }));
    }
  }, [campId, dispatch]);

  /**
   * Manual refetch
   */
  const refetch = useCallback(() => {
    if (campId) {
      dispatch(fetchTags({ campId }));
    }
  }, [campId, dispatch]);

  /**
   * Manual fetchCategories alias for backward compat
   */
  const fetchCategories = refetch;

  /**
   * Get category by ID
   */
  const getCategoryById = useCallback(
    (categoryId: string): TemplateTag | undefined => {
      return categories.find((cat) => cat.id === categoryId);
    },
    [categories]
  );

  /**
   * Get category name by ID
   */
  const getCategoryName = useCallback(
    (categoryId: string): string | undefined => {
      return categories.find((cat) => cat.id === categoryId)?.name;
    },
    [categories]
  );

  /**
   * Filter categories by name
   */
  const filterCategoriesByName = useCallback(
    (searchTerm: string): TemplateTag[] => {
      if (!searchTerm.trim()) {
        return categories;
      }
      const lowerSearchTerm = searchTerm.toLowerCase();
      return categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(lowerSearchTerm) ||
          cat.description?.toLowerCase().includes(lowerSearchTerm)
      );
    },
    [categories]
  );

  /**
   * Check if category exists
   */
  const isCategoryExists = useCallback(
    (categoryId: string): boolean => {
      return categories.some((cat) => cat.id === categoryId);
    },
    [categories]
  );

  /**
   * Get all active categories
   */
  const getActiveCategories = useCallback((): TemplateTag[] => {
    return allTags.filter((cat) => cat.isActive);
  }, [allTags]);

  /**
   * Get all inactive categories
   */
  const getInactiveCategories = useCallback((): TemplateTag[] => {
    return allTags.filter((cat) => !cat.isActive);
  }, [allTags]);

  /**
   * Get categories with pagination
   */
  const getPaginatedCategories = useCallback(
    (page: number, pageSize: number): TemplateTag[] => {
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      return categories.slice(startIndex, endIndex);
    },
    [categories]
  );

  /**
   * Get total count of categories
   */
  const getTotalCount = useCallback((): number => {
    return categories.length;
  }, [categories]);

  /**
   * Get active categories count
   */
  const getActiveCount = useCallback((): number => {
    return allTags.filter((cat) => cat.isActive).length;
  }, [allTags]);

  return {
    // State
    categories,
    isLoading: loading,
    isRefetching: false,
    error: null,

    // Operations
    refetch,
    fetchCategories,

    // Getters
    getCategoryById,
    getCategoryName,
    filterCategoriesByName,
    getActiveCategories,
    getInactiveCategories,
    getPaginatedCategories,

    // Checks
    isCategoryExists,

    // Counts
    getTotalCount,
    getActiveCount,
  };
};
