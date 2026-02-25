import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { createStrictContext } from '@/shared/lib/createStrictContext';
import { getUserProfile } from '@/shared/api/users';
import { decodeToken, isTokenExpired } from '@/shared/utils/token';

// ============ Types ============

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, persistent?: boolean) => void;
  logout: () => void;
  getToken: () => string | null;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapProfileToAuthUser = useCallback(
    (profile: Pick<User, '_id' | 'email' | 'name' | 'role'>): AuthUser => ({
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
        const profile = await getUserProfile();
        if (!isMounted) {
          return;
        }
        setUser(mapProfileToAuthUser(profile));
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

  const login = useCallback((token: string, persistent: boolean = false) => {
    void persistent;
    const decoded = decodeToken(token);

    if (!decoded || isTokenExpired(decoded)) {
      throw new Error('Invalid or expired token');
    }

    setUser({
      id: decoded.id || '',
      email: decoded.email || '',
      name: decoded.name || '',
      role: decoded.role || 'user',
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const getToken = useCallback(() => {
    return null;
  }, []);

  const value = useMemo<AuthContextState>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      getToken,
    }),
    [user, isLoading, login, logout, getToken],
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
