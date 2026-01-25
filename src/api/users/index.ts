import type { AdminUsersResponse, User } from '../../types';
import { ApiError } from '../../types';
import { apiClient } from '@/shared/api';

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

export const setUserStatusOnline = async () => {
  try {
    await apiClient.put('/users/status/online');
  } catch (error) {
    console.error('Failed to set user status to online:', error);
  }
};

export const setUserStatusOffline = async () => {
  try {
    await apiClient.put('/users/status/offline');
  } catch (error) {
    console.error('Failed to set user status to offline:', error);
  }
};

// activity heartbeat to keep user online

export const activityInterval = async () => {
  try {
    await apiClient.put('/users/status/activity');
  } catch (error) {
    console.error('Failed to update user activity status:', error);
  }
};

// =================
// USER API FUNCTIONS
// =================

// get all users
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

// Get user profile
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

// Get user profile by ID (admin only)
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

// Update user profile
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

// Update user profile by ID (admin only)
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

// Upload user avatar
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
