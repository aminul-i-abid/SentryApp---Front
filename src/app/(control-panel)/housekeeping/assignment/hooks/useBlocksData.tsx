import { useState, useEffect } from 'react';
import apiService from '@/utils/apiService';
import type { Block } from '../types/assignmentTypes';

export const useBlocksData = (campId: string) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchBlocks = async () => {
    if (!campId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.get(`/Blocks?campId=${campId}`);
      setBlocks(response.data.data || []);
    } catch (err) {
      setError(err);
      setBlocks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, [campId]);

  return {
    blocks,
    isLoading,
    error,
    refetch: fetchBlocks,
  };
};
