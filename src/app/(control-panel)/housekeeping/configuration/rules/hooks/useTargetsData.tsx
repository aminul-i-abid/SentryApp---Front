/**
 * useTargetsData Hook
 * FASE 5.3 - Housekeeping Configuration
 *
 * Hook for fetching blocks and rooms as targets for rule application
 * Handles loading/error states and provides refetch capability
 */

import { useState, useEffect, useCallback } from 'react';
import apiService from '@/utils/apiService';
import type { Block, Room } from '../../../assignment/types/assignmentTypes';

/**
 * Targets data state
 */
interface TargetsDataState {
  blocks: Block[];
  rooms: Room[];
  isLoading: boolean;
  isLoadingBlocks: boolean;
  isLoadingRooms: boolean;
  error: string | null;
  blockError: string | null;
  roomError: string | null;
}

/**
 * Pagination info for rooms
 */
interface RoomsPaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Initial state for targets data
 */
const getInitialTargetsState = (): TargetsDataState => ({
  blocks: [],
  rooms: [],
  isLoading: false,
  isLoadingBlocks: false,
  isLoadingRooms: false,
  error: null,
  blockError: null,
  roomError: null,
});

/**
 * useTargetsData Hook
 * Fetches and manages blocks and rooms as targets for rule configuration
 */
export const useTargetsData = (campId?: string) => {
  const [state, setState] = useState<TargetsDataState>(getInitialTargetsState());
  const [cachedBlocks, setCachedBlocks] = useState<Block[]>([]);
  const [cachedRooms, setCachedRooms] = useState<Room[]>([]);

  /**
   * Fetch blocks from API
   */
  const fetchBlocks = useCallback(async (campIdParam?: string) => {
    const campIdToUse = campIdParam || campId;

    if (!campIdToUse) {
      setState((prevState) => ({
        ...prevState,
        blockError: 'Camp ID is required to fetch blocks',
      }));
      return;
    }

    // Check cache first
    if (cachedBlocks.length > 0) {
      setState((prevState) => ({
        ...prevState,
        blocks: cachedBlocks,
      }));
      return;
    }

    try {
      setState((prevState) => ({
        ...prevState,
        isLoadingBlocks: true,
        blockError: null,
      }));

      const response = await apiService.get<Block[]>(
        `/api/Blocks?campId=${campIdToUse}`
      );

      if (response.data && Array.isArray(response.data)) {
        const blocksData = response.data;
        setCachedBlocks(blocksData);

        setState((prevState) => ({
          ...prevState,
          blocks: blocksData,
          isLoadingBlocks: false,
        }));

        return blocksData;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blocks';
      setState((prevState) => ({
        ...prevState,
        blockError: errorMessage,
        isLoadingBlocks: false,
      }));
      console.error('Error fetching blocks:', err);
    }
  }, [campId, cachedBlocks]);

  /**
   * Fetch rooms from API
   */
  const fetchRooms = useCallback(
    async (campIdParam?: string, paginationParams?: RoomsPaginationParams) => {
      const campIdToUse = campIdParam || campId;

      if (!campIdToUse) {
        setState((prevState) => ({
          ...prevState,
          roomError: 'Camp ID is required to fetch rooms',
        }));
        return;
      }

      try {
        setState((prevState) => ({
          ...prevState,
          isLoadingRooms: true,
          roomError: null,
        }));

        const page = paginationParams?.page || 0;
        const pageSize = paginationParams?.pageSize || 100;

        const response = await apiService.get<Room[]>(
          `/api/Rooms?campId=${campIdToUse}&page=${page}&pageSize=${pageSize}`
        );

        if (response.data && Array.isArray(response.data)) {
          const roomsData = response.data;
          setCachedRooms((prevRooms) => {
            // Merge paginated results
            if (page === 0) {
              return roomsData;
            }
            return [...prevRooms, ...roomsData];
          });

          setState((prevState) => ({
            ...prevState,
            rooms: page === 0 ? roomsData : [...prevState.rooms, ...roomsData],
            isLoadingRooms: false,
          }));

          return roomsData;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rooms';
        setState((prevState) => ({
          ...prevState,
          roomError: errorMessage,
          isLoadingRooms: false,
        }));
        console.error('Error fetching rooms:', err);
      }
    },
    [campId]
  );

  /**
   * Fetch both blocks and rooms
   */
  const fetchAllTargets = useCallback(
    async (campIdParam?: string) => {
      const campIdToUse = campIdParam || campId;

      if (!campIdToUse) {
        setState((prevState) => ({
          ...prevState,
          error: 'Camp ID is required to fetch targets',
        }));
        return;
      }

      try {
        setState((prevState) => ({
          ...prevState,
          isLoading: true,
          error: null,
        }));

        const [blocksResponse, roomsResponse] = await Promise.all([
          apiService.get<Block[]>(`/api/Blocks?campId=${campIdToUse}`),
          apiService.get<Room[]>(
            `/api/Rooms?campId=${campIdToUse}&page=0&pageSize=100`
          ),
        ]);

        let blocksData: Block[] = [];
        let roomsData: Room[] = [];

        if (blocksResponse.data && Array.isArray(blocksResponse.data)) {
          blocksData = blocksResponse.data;
          setCachedBlocks(blocksData);
        }

        if (roomsResponse.data && Array.isArray(roomsResponse.data)) {
          roomsData = roomsResponse.data;
          setCachedRooms(roomsData);
        }

        setState((prevState) => ({
          ...prevState,
          blocks: blocksData,
          rooms: roomsData,
          isLoading: false,
        }));

        return {
          blocks: blocksData,
          rooms: roomsData,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch targets';
        setState((prevState) => ({
          ...prevState,
          error: errorMessage,
          isLoading: false,
        }));
        console.error('Error fetching targets:', err);
      }
    },
    [campId]
  );

  /**
   * Refetch blocks
   */
  const refetchBlocks = useCallback(async (campIdParam?: string) => {
    setCachedBlocks([]);
    await fetchBlocks(campIdParam);
  }, [fetchBlocks]);

  /**
   * Refetch rooms
   */
  const refetchRooms = useCallback(
    async (campIdParam?: string, paginationParams?: RoomsPaginationParams) => {
      setCachedRooms([]);
      await fetchRooms(campIdParam, paginationParams);
    },
    [fetchRooms]
  );

  /**
   * Refetch all targets
   */
  const refetchAllTargets = useCallback(async (campIdParam?: string) => {
    setCachedBlocks([]);
    setCachedRooms([]);
    await fetchAllTargets(campIdParam);
  }, [fetchAllTargets]);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    setCachedBlocks([]);
    setCachedRooms([]);
  }, []);

  /**
   * Load targets on mount or when campId changes
   */
  useEffect(() => {
    if (campId) {
      fetchAllTargets(campId);
    }
  }, [campId, fetchAllTargets]);

  /**
   * Filter blocks by search term
   */
  const filterBlocks = useCallback((searchTerm: string) => {
    if (!searchTerm) {
      return state.blocks;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return state.blocks.filter((block) =>
      block.name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [state.blocks]);

  /**
   * Filter rooms by search term
   */
  const filterRooms = useCallback((searchTerm: string) => {
    if (!searchTerm) {
      return state.rooms;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return state.rooms.filter((room) =>
      room.number.toLowerCase().includes(lowerSearchTerm) ||
      room.blockName.toLowerCase().includes(lowerSearchTerm)
    );
  }, [state.rooms]);

  /**
   * Get block by ID
   */
  const getBlockById = useCallback(
    (blockId: string) => {
      return state.blocks.find((block) => block.id === blockId);
    },
    [state.blocks]
  );

  /**
   * Get room by ID
   */
  const getRoomById = useCallback(
    (roomId: string) => {
      return state.rooms.find((room) => room.id === roomId);
    },
    [state.rooms]
  );

  /**
   * Get rooms by block ID
   */
  const getRoomsByBlockId = useCallback(
    (blockId: string) => {
      return state.rooms.filter((room) => room.blockId === blockId);
    },
    [state.rooms]
  );

  return {
    // State
    blocks: state.blocks,
    rooms: state.rooms,
    isLoading: state.isLoading,
    isLoadingBlocks: state.isLoadingBlocks,
    isLoadingRooms: state.isLoadingRooms,
    error: state.error,
    blockError: state.blockError,
    roomError: state.roomError,

    // Fetch methods
    fetchBlocks,
    fetchRooms,
    fetchAllTargets,

    // Refetch methods
    refetchBlocks,
    refetchRooms,
    refetchAllTargets,

    // Cache management
    clearCache,

    // Filter methods
    filterBlocks,
    filterRooms,

    // Getter methods
    getBlockById,
    getRoomById,
    getRoomsByBlockId,
  };
};
