import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { User } from '@/types';

import {
  getAllUsers,
  getSupportUsers,
  getUserProfile,
  getUserProfileById,
  updateUserProfile,
  updateUserProfileById,
  uploadUserAvatar,
} from '../api';

// ============ Query Keys ============

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  support: () => [...userKeys.all, 'support'] as const,
};

// ============ Query Hooks ============

export function useAllUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: getAllUsers,
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: getUserProfile,
  });
}

export function useUserById(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserProfileById(userId),
    enabled: !!userId,
  });
}

export function useSupportUsers() {
  return useQuery({
    queryKey: userKeys.support(),
    queryFn: getSupportUsers,
  });
}

// ============ Mutation Hooks ============

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => updateUserProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.profile(), updatedUser);
    },
  });
}

export function useUpdateUserById() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<User> }) =>
      updateUserProfileById(userId, data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.detail(updatedUser._id), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadUserAvatar(file),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.profile(), updatedUser);
    },
  });
}
