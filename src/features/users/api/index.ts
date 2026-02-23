import type { AdminUsersResponse, User } from '@/types';
import { apiClient } from '@/shared/api';
import {
  adminUsersFlexibleSchema,
  normalizeApiModuleError,
  parseApiPayload,
  uploadAvatarResponseSchema,
  userSchema,
} from '@/shared/api/contracts';
import { z } from 'zod';

// ============ Support Users ============

export const getSupportUsers = async (): Promise<AdminUsersResponse> => {
  try {
    const response = await apiClient.get<unknown>('/users/support');
    return parseApiPayload(adminUsersFlexibleSchema, response, { endpoint: '/users/support' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch support users');
  }
};

// ============ User Status ============

export const setUserStatusOnline = async () => {
  try {
    await apiClient.put('/users/status/online');
  } catch {
    // Status ping failures should not block the main UI flow.
  }
};

export const setUserStatusOffline = async () => {
  try {
    await apiClient.put('/users/status/offline');
  } catch {
    // Status ping failures should not block logout flow.
  }
};

export const activityInterval = async () => {
  try {
    await apiClient.put('/users/status/activity');
  } catch {
    // Ignore background heartbeat failures.
  }
};

// ============ User Profile ============

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<unknown>('/users');
    return parseApiPayload(z.array(userSchema), response, { endpoint: '/users' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch all users');
  }
};

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get<unknown>('/users/profile');
    return parseApiPayload(userSchema, response, { endpoint: '/users/profile' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch user profile');
  }
};

export const getUserProfileById = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get<unknown>(`/users/${userId}`);
    return parseApiPayload(userSchema, response, { endpoint: `/users/${userId}` });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to fetch user profile');
  }
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.put<unknown>('/users/profile', userData);
    return parseApiPayload(userSchema, response, { endpoint: '/users/profile' });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to update user profile');
  }
};

export const updateUserProfileById = async (
  userId: string,
  userData: Partial<User>,
): Promise<User> => {
  try {
    const response = await apiClient.put<unknown>(`/users/${userId}`, userData);
    return parseApiPayload(userSchema, response, { endpoint: `/users/${userId}` });
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to update user profile');
  }
};

// ============ Avatar ============

export const uploadUserAvatar = async (file: File): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file, file.name);

    const response = await apiClient.upload<unknown>('/upload/avatar', formData);
    const data = parseApiPayload(uploadAvatarResponseSchema, response, {
      endpoint: '/upload/avatar',
    });
    return data.user;
  } catch (error) {
    throw normalizeApiModuleError(error, 'Failed to upload avatar');
  }
};
