// Auth Feature - Public API
// Only exports that should be used by other parts of the app

// Pages (for router)
export { default as LoginPage } from './pages/LoginPage';
export { default as RegisterPage } from './pages/RegisterPage';

// API (for external use)
export * from './api';

// Hooks
export { useLogin } from './hooks/useLogin';
export { default as useRegister } from './hooks/useRegister';

// React Query Hooks
export { authKeys, useAdminUsers, useLoginMutation, useRegisterMutation } from './hooks/useAuth';
