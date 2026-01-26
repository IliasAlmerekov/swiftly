// Users Feature - Public API
// Only exports that should be used by other parts of the app

// Pages (for router)
export { default as UserProfile } from './pages/UserProfile';

// API
export * from './api';

// Hooks
export * from './hooks';

// React Query Hooks
export {
  userKeys,
  useAllUsers,
  useUserProfile,
  useUserById,
  useSupportUsers,
  useUpdateProfile,
  useUpdateUserById,
  useUploadAvatar,
} from './hooks/useUsers';
