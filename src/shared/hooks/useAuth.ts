import { useAuthContext } from '@/shared/context/AuthContext';
import type { UserRole } from '@/types';

interface AuthState {
  userId: string | null;
  role: UserRole | null;
  email: string | null;
  userName: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hooks to access authentication state.
 * @returns AuthState object containing user info and auth status
 */
export const useAuth = (): AuthState => {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  return {
    userId: user?.id || null,
    role: user?.role || null,
    email: user?.email || null,
    userName: user?.name || null,
    isLoading,
    isAuthenticated,
  };
};
