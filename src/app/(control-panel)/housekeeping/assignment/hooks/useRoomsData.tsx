import { useState, useEffect } from 'react';
import apiService from '@/utils/apiService';
import type { Room } from '../types/assignmentTypes';

interface UseRoomsDataParams {
  campId: string;
  blockId?: string;
}

export const useRoomsData = ({ campId, blockId }: UseRoomsDataParams) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const pageSize = 20;

  const fetchRooms = async () => {
    if (!campId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        campId,
        page: String(page),
        pageSize: String(pageSize),
      });

      if (blockId) params.append('blockId', blockId);
      if (searchTerm) params.append('search', searchTerm);

      const response = await apiService.get(`/Rooms?${params.toString()}`);
      const data = response.data.data;

      setRooms((data?.items || data || []) as Room[]);
      setTotalCount(data?.totalCount || 0);
    } catch (err) {
      setError(err);
      setRooms([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [campId, blockId, searchTerm, page]);

  return {
    rooms,
    totalCount,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    refetch: fetchRooms,
  };
};
