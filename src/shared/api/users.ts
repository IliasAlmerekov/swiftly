import type { AdminUsersResponse, User } from '@/types';
import { apiClient } from './client';
import {
  adminUsersFlexibleSchema,
  normalizeApiModuleError,
  parseApiPayload,
  userSchema,
} from './contracts';

let inFlightUserProfileRequest: Promise<User> | null = null;

// ============ Admin/Support Users ============

/**
 * Fetch all admin users with online status
 */
export const getAdminUsers = async (): Promise<AdminUsersResponse> => {
  try {
    const response = await apiClient.get<unknown>('/auth/admins');
    return parseApiPayload(adminUsersFlexibleSchema, response, { endpoint: '/auth/admins' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch admin users');
  }
};

// ============ User Profile ============

/**
 * Fetch current user's profile
 */
export const getUserProfile = async (): Promise<User> => {
  if (!inFlightUserProfileRequest) {
    inFlightUserProfileRequest = (async () => {
      try {
        const response = await apiClient.get<unknown>('/users/profile');
        return parseApiPayload(userSchema, response, { endpoint: '/users/profile' });
      } catch (error) {
        throw normalizeApiModuleError(error, 'Failed to fetch user profile');
      }
    })().finally(() => {
      inFlightUserProfileRequest = null;
    });
  }

  return inFlightUserProfileRequest;
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
