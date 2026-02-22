import type { AdminUsersResponse, User } from '@/types';
import { ApiError } from '@/types';
import { apiClient } from './client';

// ============ Admin/Support Users ============

/**
 * Fetch all admin users with online status
 */
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

// ============ User Profile ============

/**
 * Fetch current user's profile
 */
export const getUserProfile = async (): Promise<User> => {
  try {
    return await apiClient.get<User>('/users/profile');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch user profile', 500);
  }
};

// ============ User Status ============

/**
 * Set current user's status to offline
 */
export const setUserStatusOffline = async (): Promise<void> => {
  try {
    await apiClient.put('/users/status/offline');
  } catch {
    // Do not block logout flow when status endpoint is unavailable.
  }
};
