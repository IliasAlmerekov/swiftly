import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import TicketDetailPage from './features/tickets/pages/TicketDetailPage';
import AppLayout from './shared/components/layout/AppLayout';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { ThemeProvider } from './provider/theme-provider';
import { AuthProvider } from './shared/context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserProfile from './features/users/pages/UserProfile';
import ProtectedRoute from './shared/components/auth/ProtectedRoute';

// QueryClient must be created outside of the component to avoid recreation on each render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data is considered fresh
      retry: 1, // One retry on error
      refetchOnWindowFocus: false, // Do not refetch on window focus
    },
    mutations: {
      retry: 0, // Do not automatically retry mutations
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes with sidebar */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <DashboardPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tickets/:ticketId"
                  element={
                    <ProtectedRoute>
                      <AppLayout
                        title="Solutions IT HelpDesk - Ticket Details"
                        currentTab="my-tickets"
                      >
                        <TicketDetailPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/:userId"
                  element={
                    <ProtectedRoute>
                      <AppLayout title="User Profile" currentTab="user-profile">
                        <UserProfile isViewingOtherUser={true} />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-profile"
                  element={
                    <ProtectedRoute>
                      <AppLayout title="Profile" currentTab="user-profile">
                        <UserProfile />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
