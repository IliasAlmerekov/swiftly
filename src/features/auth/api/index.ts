import type { AuthToken, AdminUsersResponse } from '@/types';
import { ApiError } from '@/types';
import { apiClient } from '@/shared/api';
import { clearStoredToken, getStoredToken, setStoredToken } from '@/shared/utils/token';

// ============ Authentication Functions ============

export const loginUser = async (email: string, password: string): Promise<AuthToken> => {
  try {
    return await apiClient.post<AuthToken>('/auth/login', { email, password }, { skipAuth: true });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to login', 500);
  }
};

export const registerUser = async (
  email: string,
  password: string,
  name: string,
): Promise<AuthToken> => {
  try {
    return await apiClient.post<AuthToken>(
      '/auth/register',
      { email, password, name },
      { skipAuth: true },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to register', 500);
  }
};

export const getAdminUsers = async (): Promise<AdminUsersResponse> => {
  try {
    const data = await apiClient.get<AdminUsersResponse | AdminUsersResponse['users']>(
      '/auth/admins',
    );
    if (Array.isArray(data)) {
      return { users: data, onlineCount: 0, totalCount: data.length };
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch admin users', 500);
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
