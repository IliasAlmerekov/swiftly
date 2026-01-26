import type { AuthToken, AdminUsersResponse, UserRole } from '@/types';
import { ApiError } from '@/types';
import { apiClient } from '@/shared/api';

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
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

export const setAuthToken = (token: string, persistent = false): void => {
  if (persistent) {
    localStorage.setItem('token', token);
    sessionStorage.removeItem('token');
  } else {
    sessionStorage.setItem('token', token);
    localStorage.removeItem('token');
  }
};
