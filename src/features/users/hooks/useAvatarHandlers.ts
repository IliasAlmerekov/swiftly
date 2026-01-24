import { useState } from 'react';
import { updateUserProfile, uploadUserAvatar } from '@/api/users';
import type { User } from '@/types';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';

export const useAvatarHandlers = (
  isViewingOtherUser: boolean,
  userId: string | undefined,
  onUserUpdate: (updatedUser: User) => void,
  onError: (error: string) => void,
) => {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    // Users can only change their own avatar
    if (isViewingOtherUser && userId) {
      onError('Cannot upload avatar for other users');
      return;
    }

    // check file size
    if (file.size > 5 * 1024 * 1024) {
      onError('File size must not exceed 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      onError('Please select an image file');
      return;
    }

    setUploadingAvatar(true);

    try {
      const updatedUser = await uploadUserAvatar(file);
      onUserUpdate(updatedUser);
    } catch (err) {
      onError(getApiErrorMessage(err, 'Error uploading avatar'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    // Users can only remove their own avatar
    if (isViewingOtherUser && userId) {
      onError('Cannot remove avatar for other users');
      return;
    }

    try {
      const updatedUser = await updateUserProfile({ avatar: undefined });
      onUserUpdate(updatedUser);
    } catch (err) {
      onError(getApiErrorMessage(err, 'Error removing avatar'));
    }
  };

  return {
    handleAvatarUpload,
    handleRemoveAvatar,
    uploadingAvatar,
  };
};
