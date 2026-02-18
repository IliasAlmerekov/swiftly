import { useCallback } from 'react';
import { updateUserProfile, updateUserProfileById } from '@/features/users/api';
import type { User } from '@/types';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';

interface ProfileFormData {
  name: string;
  company?: string;
  department?: string;
  position?: string;
  manager?: string;
  country?: string;
  city?: string;
  address?: string;
  postalCode?: string;
}

interface UseProfileEditorOptions {
  user: User | null;
  currentUser: User | null;
  isViewingOtherUser: boolean;
  userId: string | undefined;
  onUserUpdate: (updatedUser: User) => void;
  onError: (error: string) => void;
}

/**
 * Hook for saving profile changes.
 * Form state is managed by the PersonalInformationSection component.
 */
export const useProfileEditor = ({
  user,
  currentUser,
  isViewingOtherUser,
  userId,
  onUserUpdate,
  onError,
}: UseProfileEditorOptions) => {
  const handleSaveProfile = useCallback(
    async (formData: ProfileFormData) => {
      // Only admins can edit profiles
      if (currentUser?.role !== 'admin') {
        onError('Only administrators can edit profiles');
        return;
      }

      try {
        // List of fields that can be updated
        const allowedUpdates = [
          'name',
          'company',
          'department',
          'position',
          'manager',
          'country',
          'city',
          'address',
          'postalCode',
        ];

        // Clean formData to include only allowed fields and valid values
        const cleanedData: Record<string, string | number> = {};

        allowedUpdates.forEach((field) => {
          const value = formData[field as keyof ProfileFormData];

          if (field === 'postalCode') {
            // For postalCode: include only if it's a positive number
            const numValue = typeof value === 'string' ? parseInt(value, 10) : undefined;
            if (numValue && numValue > 0) {
              cleanedData[field] = numValue;
            }
          } else if (field === 'name') {
            // Name is a required field, always include if present
            if (value && typeof value === 'string') {
              cleanedData[field] = value.trim();
            }
          } else if (field === 'manager') {
            // For manager: use selectedManagerId
            if (
              value &&
              typeof value === 'string' &&
              value.trim() !== '' &&
              user &&
              value !== user._id
            ) {
              cleanedData[field] = value.trim();
            }
          } else {
            // For other fields: include if there's a non-empty value
            if (value && typeof value === 'string' && value.trim() !== '') {
              cleanedData[field] = value.trim();
            }
          }
        });

        const updatedUser =
          isViewingOtherUser && userId
            ? await updateUserProfileById(userId, cleanedData)
            : await updateUserProfile(cleanedData);

        onUserUpdate(updatedUser);
      } catch (err) {
        console.error('Profile update error:', err);
        onError(getApiErrorMessage(err, 'Error saving profile'));
      }
    },
    [currentUser?.role, onError, isViewingOtherUser, userId, onUserUpdate, user],
  );

  return {
    handleSaveProfile,
  };
};
