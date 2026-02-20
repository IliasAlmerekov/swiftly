import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { paths } from '@/config/paths';
import { LoginPage, RegisterPage } from '@/features/auth';
import { TicketDetailPage } from '@/features/tickets';
import { UserProfile } from '@/features/users';
import AppLayout from '@/shared/components/layout/AppLayout';
import ProtectedRoute from '@/shared/components/auth/ProtectedRoute';

// Lazy load heavy pages for code splitting
const DashboardPage = lazy(() => import('@/app/pages/DashboardPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
  </div>
);

// ============ Route Configuration ============

/**
 * Application router configuration.
 * Separates public and protected routes for clarity.
 * Uses centralized paths from @/config/paths
 * Uses React.lazy for code splitting
 */
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ============ Public Routes ============ */}
          <Route
            path={paths.home.path}
            element={<Navigate to={paths.auth.login.getHref()} replace />}
          />
          <Route path={paths.auth.login.path} element={<LoginPage />} />
          <Route path={paths.auth.register.path} element={<RegisterPage />} />

          {/* ============ Protected Routes ============ */}
          <Route
            path={paths.app.dashboard.path}
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={paths.app.ticket.path}
            element={
              <ProtectedRoute>
                <AppLayout title="Swiftly HelpDesk - Ticket Details" currentTab="tickets">
                  <TicketDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={paths.app.user.path}
            element={
              <ProtectedRoute>
                <AppLayout title="User Profile" currentTab="user-profile">
                  <UserProfile isViewingOtherUser={true} />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={paths.app.profile.path}
            element={
              <ProtectedRoute>
                <AppLayout title="Profile" currentTab="user-profile">
                  <UserProfile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
