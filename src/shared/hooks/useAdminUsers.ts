import { useQuery } from '@tanstack/react-query';
import { getAdminUsers } from '@/shared/api';

export const adminUserKeys = {
  all: ['adminUsers'] as const,
};

export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: adminUserKeys.all,
    queryFn: getAdminUsers,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
