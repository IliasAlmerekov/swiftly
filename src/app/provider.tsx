import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/provider/theme-provider';
import { AuthProvider } from '@/shared/context/AuthContext';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import { defaultQueryErrorHandler } from '@/shared/lib/errorHandler';

// ============ Query Client Configuration ============

/**
 * QueryClient must be created outside of the component
 * to avoid recreation on each render
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data is considered fresh
      retry: 1, // One retry on error
      refetchOnWindowFocus: false, // Do not refetch on window focus
    },
    mutations: {
      retry: 0, // Do not automatically retry mutations
      onError: defaultQueryErrorHandler,
    },
  },
});

// ============ App Provider ============

interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider wraps the entire application with all necessary providers.
 * Order matters: outer providers are initialized first.
 *
 * Provider hierarchy:
 * 1. ErrorBoundary - catches React errors
 * 2. QueryClientProvider - server state management
 * 3. AuthProvider - authentication context
 * 4. ThemeProvider - theme context
 */
export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
