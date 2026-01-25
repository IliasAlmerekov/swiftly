import { Button } from '@/shared/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getUserProfile, getUserProfileById } from '@/api/users';
import type { User } from '@/types';
import { useParams } from 'react-router-dom';
import {
  UserCard,
  PersonalInformationSection,
  LoadingState,
  ErrorState,
} from '../hooks/components';
import { useAvatarHandlers, useProfileEditor } from '../hooks';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';

interface UserProfileProps {
  isViewingOtherUser?: boolean;
}

export default function UserProfile({ isViewingOtherUser = false }: UserProfileProps) {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUserList, setAllUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom hooks for handling avatar and profile editing
  const { handleAvatarUpload, handleRemoveAvatar, uploadingAvatar } = useAvatarHandlers(
    isViewingOtherUser,
    userId,
    (updatedUser: User) => {
      setUser(updatedUser);
    },
    (errorMessage: string) => setError(errorMessage),
  );

  const {
    editMode,
    formData,
    selectedManagerId,
    setEditMode,
    handleSaveProfile,
    handleInputChange,
    handleCancelEdit,
  } = useProfileEditor(
    user,
    currentUser,
    isViewingOtherUser,
    userId,
    (updatedUser: User) => {
      setUser(updatedUser);
    },
    (errorMessage: string) => setError(errorMessage),
  );

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Always get current user to check permissions
        const currentUserData = await getUserProfile();
        setCurrentUser(currentUserData);

        let userData: User;

        const isStaff = currentUserData.role === 'admin' || currentUserData.role === 'support1';

        // If viewing another user and we have a userId param, check permissions
        if (isViewingOtherUser && userId) {
          if (userId === currentUserData._id) {
            userData = currentUserData;
          } else {
            if (!isStaff) {
              setError('Access restricted: you cannot view other user profiles.');
              setLoading(false);
              return;
            }
            userData = await getUserProfileById(userId);
          }
        } else {
          // Otherwise, get current user's profile
          userData = currentUserData;
        }

        setUser(userData);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Error fetching user profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, isViewingOtherUser]);

  // getAllUsers for manager dropdown
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'support1')) {
          return;
        }
        const users = await getAllUsers();
        setAllUserList(users);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Error fetching all users'));
      }
    };

    fetchAllUsers();
  }, [currentUser]);

  // Create stable handlers with useCallback
  const handleEdit = useCallback(() => setEditMode(true), [setEditMode]);

  const handleCancel = useCallback(() => {
    handleCancelEdit();
  }, [handleCancelEdit]);

  const handleErrorClose = useCallback(() => setError(null), []);

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          {error ? (
            <ErrorState message={error} onClose={handleErrorClose} />
          ) : (
            <p className="text-foreground">User not found</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen px-4 py-6 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-foreground text-2xl font-semibold">
          {isViewingOtherUser && userId ? `${user.name}'s Profile` : 'Your personal profile'}
        </h1>

        {error && <ErrorState message={error} onClose={handleErrorClose} />}

        {/* User Card */}
        <UserCard
          user={user}
          isViewingOtherUser={isViewingOtherUser}
          onAvatarUpload={handleAvatarUpload}
          onAvatarRemove={handleRemoveAvatar}
          uploadingAvatar={uploadingAvatar}
        />

        {/* Personal Information Section */}
        <PersonalInformationSection
          user={user}
          currentUser={currentUser}
          editMode={editMode}
          formData={formData}
          selectedManagerId={selectedManagerId}
          allUsers={allUserList}
          onEdit={handleEdit}
          onSave={handleSaveProfile}
          onInputChange={handleInputChange}
        />

        {editMode && currentUser?.role === 'admin' && (
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button onClick={handleSaveProfile}>Save Changes</Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
