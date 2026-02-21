import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { UserRole } from '@/types';
import { createStrictContext } from '@/shared/lib/createStrictContext';
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  decodeToken,
  isTokenExpired,
} from '@/shared/utils/token';

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

  // Initialize auth state on mount
  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    const decoded = decodeToken(token);

    if (!decoded || isTokenExpired(decoded)) {
      clearStoredToken();
      setIsLoading(false);
      return;
    }

    setUser({
      id: decoded.id || '',
      email: decoded.email || '',
      name: decoded.name || '',
      role: decoded.role || 'user',
    });
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string, persistent: boolean = false) => {
    const decoded = decodeToken(token);

    if (!decoded || isTokenExpired(decoded)) {
      throw new Error('Invalid or expired token');
    }

    setStoredToken(token, persistent);
    setUser({
      id: decoded.id || '',
      email: decoded.email || '',
      name: decoded.name || '',
      role: decoded.role || 'user',
    });
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const getToken = useCallback(() => {
    return getStoredToken();
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
