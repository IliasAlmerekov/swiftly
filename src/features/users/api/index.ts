import type { AdminUsersResponse, User } from '@/types';
import { ApiError } from '@/types';
import { apiClient } from '@/shared/api';

// ============ Support Users ============

export const getSupportUsers = async (): Promise<AdminUsersResponse> => {
  try {
    return await apiClient.get<AdminUsersResponse>('/users/support');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch support users', 500);
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
    return await apiClient.get<User[]>('/users');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch all users', 500);
  }
};

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

export const getUserProfileById = async (userId: string): Promise<User> => {
  try {
    return await apiClient.get<User>(`/users/${userId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch user profile', 500);
  }
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    return await apiClient.put<User>('/users/profile', userData);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update user profile', 500);
  }
};

export const updateUserProfileById = async (
  userId: string,
  userData: Partial<User>,
): Promise<User> => {
  try {
    return await apiClient.put<User>(`/users/${userId}`, userData);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update user profile', 500);
  }
};

// ============ Avatar ============

export const uploadUserAvatar = async (file: File): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file, file.name);

    const data = await apiClient.upload<{
      success: boolean;
      message: string;
      user: User;
    }>('/upload/avatar', formData);

    if (!data?.user) {
      throw new ApiError('Invalid server response while uploading avatar', 500);
    }

    return data.user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to upload avatar', 500);
  }
};
