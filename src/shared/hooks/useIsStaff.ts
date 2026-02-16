import { useMemo } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to determine if the current user is staff (admin or support1).
 * Centralizes staff role checking logic across the application.
 *
 * @returns Object containing:
 * - isStaff: boolean indicating if user is admin or support1
 * - isAdmin: boolean indicating if user is specifically admin
 * - isSupport: boolean indicating if user is specifically support1
 * - isRoleReady: boolean indicating if role has been loaded
 */
export function useIsStaff() {
  const { role } = useAuth();

  return useMemo(
    () => ({
      isStaff: role === 'admin' || role === 'support1',
      isAdmin: role === 'admin',
      isSupport: role === 'support1',
      isRoleReady: role !== undefined && role !== null,
      role,
    }),
    [role],
  );
}
