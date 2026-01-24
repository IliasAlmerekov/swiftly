import { useState, useCallback, useEffect } from 'react';
import { updateUserProfile, updateUserProfileById } from '@/api/users';
import type { User } from '@/types';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';

export const useProfileEditor = (
  user: User | null,
  currentUser: User | null,
  isViewingOtherUser: boolean,
  userId: string | undefined,
  onUserUpdate: (updatedUser: User) => void,
  onError: (error: string) => void,
) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>(user || {});
  const [selectedManagerId, setSelectedManagerId] = useState<string>(user?.manager?._id || '');

  // Update formData when user data changes
  useEffect(() => {
    if (user) {
      setFormData(user);
      setSelectedManagerId(user?.manager?._id || '');
    }
  }, [user]);

  const handleSaveProfile = useCallback(async () => {
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
        const value = formData[field as keyof User];

        if (field === 'postalCode') {
          // For postalCode: include only if it's a positive number
          if (value && typeof value === 'number' && value > 0) {
            cleanedData[field] = value;
          }
        } else if (field === 'name') {
          // Name is a required field, always include if present
          if (value && typeof value === 'string') {
            cleanedData[field] = value.trim();
          }
        } else if (field === 'manager') {
          // For manager: use selectedManagerId
          if (
            selectedManagerId &&
            selectedManagerId.trim() !== '' &&
            user &&
            selectedManagerId !== user._id
          ) {
            cleanedData[field] = selectedManagerId.trim();
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
      setFormData(updatedUser);
      setSelectedManagerId(updatedUser.manager?._id || '');
      setEditMode(false);
    } catch (err) {
      console.error('Profile update error:', err);
      onError(getApiErrorMessage(err, 'Error saving profile'));
    }
  }, [
    currentUser?.role,
    onError,
    formData,
    selectedManagerId,
    isViewingOtherUser,
    userId,
    onUserUpdate,
    user,
  ]);

  const handleInputChange = useCallback(
    (field: keyof User, value: string | number) => {
      if (field === 'postalCode') {
        // For postalCode: include only if it's a positive number
        const numValue = typeof value === 'string' ? parseInt(value) : value;
        setFormData((prev) => ({
          ...prev,
          [field]: isNaN(numValue) || numValue <= 0 ? undefined : numValue,
        }));
        return;
      }

      if (field === 'manager') {
        if (value === user?._id) {
          onError('A user cannot be their own manager');
          return;
        }
        // For manager: store the selected user ID separately
        setSelectedManagerId(value as string);
        return;
      }

      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [user?._id, onError],
  );

  const handleCancelEdit = useCallback(() => {
    setEditMode(false);
    setFormData(user || {});
    setSelectedManagerId(user?.manager?._id || '');
  }, [user]);

  return {
    editMode,
    formData,
    selectedManagerId,
    setEditMode,
    handleSaveProfile,
    handleInputChange,
    handleCancelEdit,
  };
};
