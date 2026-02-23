import { apiClient } from '@/shared/api';
import {
  adminUsersFlexibleSchema,
  authTokenSchema,
  normalizeApiModuleError,
  parseApiPayload,
} from '@/shared/api/contracts';
import { clearStoredToken, getStoredToken, setStoredToken } from '@/shared/utils/token';
import type { AdminUsersResponse, AuthToken } from '@/types';

// ============ Authentication Functions ============

export const loginUser = async (email: string, password: string): Promise<AuthToken> => {
  try {
    const response = await apiClient.post<unknown>(
      '/auth/login',
      { email, password },
      { skipAuth: true },
    );
    return parseApiPayload(authTokenSchema, response, { endpoint: '/auth/login' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to login');
  }
};

export const registerUser = async (
  email: string,
  password: string,
  name: string,
): Promise<AuthToken> => {
  try {
    const response = await apiClient.post<unknown>(
      '/auth/register',
      { email, password, name },
      { skipAuth: true },
    );
    return parseApiPayload(authTokenSchema, response, { endpoint: '/auth/register' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to register');
  }
};

export const getAdminUsers = async (): Promise<AdminUsersResponse> => {
  try {
    const response = await apiClient.get<unknown>('/auth/admins');
    return parseApiPayload(adminUsersFlexibleSchema, response, { endpoint: '/auth/admins' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch admin users');
  }
};

// ============ Utility Functions ============

export const isAuthenticated = (): boolean => {
  return Boolean(getStoredToken());
};

export const clearAuthToken = (): void => {
  clearStoredToken();
};

export const setAuthToken = (token: string, persistent = false): void => {
  setStoredToken(token, persistent);
};
