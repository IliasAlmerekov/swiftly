import { Navigate, useLocation, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';

import { paths } from '@/config/paths';
import { useAuthContext } from '@/shared/context/AuthContext';
import { canAccess, type AccessKey } from '@/shared/security/access-matrix';

interface ProtectedRouteProps {
  children: ReactNode;
  access: AccessKey;
}

/**
 * Component for protecting routes based on authentication and access matrix rules.
 *
 * @param children - The component(s) to render if access is granted
 * @param access - Access key from centralized RBAC/PBAC matrix
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, access }) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const location = useLocation();
  const { userId: targetUserId } = useParams<{ userId?: string }>();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={paths.auth.login.getHref()} state={{ from: location }} replace />;
  }

  const isAllowed = canAccess(access, user?.role, {
    actorUserId: user?.id,
    targetUserId: targetUserId ?? null,
  });

  if (!isAllowed) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-destructive text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
