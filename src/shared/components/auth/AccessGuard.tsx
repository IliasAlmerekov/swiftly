import type { ReactNode } from 'react';

import { useAuth } from '@/shared/hooks/useAuth';
import { canAccess, type AccessContext, type AccessKey } from '@/shared/security/access-matrix';

interface AccessGuardProps {
  access: AccessKey;
  children: ReactNode;
  fallback?: ReactNode;
  context?: AccessContext;
}

export const AccessGuard = ({ access, children, fallback = null, context }: AccessGuardProps) => {
  const { role, userId } = useAuth();

  const allowed = canAccess(access, role, {
    actorUserId: userId,
    ...context,
  });

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AccessGuard;
