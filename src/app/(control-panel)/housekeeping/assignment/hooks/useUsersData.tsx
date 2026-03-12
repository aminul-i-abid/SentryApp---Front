import { useState, useEffect } from 'react';
import apiService from '@/utils/apiService';
import type { CleaningStaff } from '../types/assignmentTypes';

interface UseUsersDataParams {
  campId: string;
  role: string;
}

export const useUsersData = ({ campId, role }: UseUsersDataParams) => {
  const [users, setUsers] = useState<CleaningStaff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchUsers = async () => {
    if (!campId || !role) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        campId,
        role,
        includeWorkload: 'true',
      });

      const response = await apiService.get(`/api/Users?${params.toString()}`);
      setUsers(response.data.data || []);
    } catch (err) {
      setError(err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [campId, role]);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
  };
};
