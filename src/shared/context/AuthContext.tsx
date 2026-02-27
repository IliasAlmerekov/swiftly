import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { AuthUserState, User } from '@/types';
import { createStrictContext } from '@/shared/lib/createStrictContext';
import { getCurrentSession, logoutCurrentSession } from '@/shared/api/auth';
import { reportError } from '@/shared/lib/observability';

// ============ Types ============

interface AuthContextState {
  user: AuthUserState | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUserState) => void;
  logout: () => Promise<void>;
}

// ============ Context ============

const [AuthContext, useStrictAuthContext] = createStrictContext<AuthContextState>({
  contextName: 'AuthContext',
  errorMessage: 'useAuthContext must be used within an AuthProvider',
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapProfileToAuthUser = useCallback(
    (profile: Pick<User, '_id' | 'email' | 'name' | 'role'>): AuthUserState => ({
      id: profile._id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    }),
    [],
  );

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const session = await getCurrentSession();
        if (!isMounted) {
          return;
        }
        setUser(mapProfileToAuthUser(session.user));
      } catch {
        if (!isMounted) {
          return;
        }
        setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [mapProfileToAuthUser]);

  const login = useCallback((nextUser: AuthUserState) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutCurrentSession();
    } catch (error) {
      reportError('app', error, 'auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextState>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access AuthContext.
 * Must be used within an AuthProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = (): AuthContextState => {
  return useStrictAuthContext();
};

export default AuthContext;
