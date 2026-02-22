import type { UserRole } from '@/types';

export type AccessKey =
  | 'route.dashboard'
  | 'route.ticketDetail'
  | 'route.userProfile'
  | 'route.userById'
  | 'component.dashboard.adminTab'
  | 'component.dashboard.analyticsTab'
  | 'component.users.profileEdit';

export interface AccessContext {
  actorUserId?: string | null;
  targetUserId?: string | null;
}

interface AccessRule {
  description: string;
  allowedRoles: UserRole[];
  condition?: (context: AccessContext, role: UserRole) => boolean;
}

const ALL_ROLES: UserRole[] = ['user', 'support1', 'admin'];
const STAFF_ROLES: UserRole[] = ['support1', 'admin'];

export const ACCESS_MATRIX: Record<AccessKey, AccessRule> = {
  'route.dashboard': {
    description: 'Authenticated users can access dashboard shell.',
    allowedRoles: ALL_ROLES,
  },
  'route.ticketDetail': {
    description: 'Authenticated users can access ticket detail route.',
    allowedRoles: ALL_ROLES,
  },
  'route.userProfile': {
    description: 'Authenticated users can access own profile route.',
    allowedRoles: ALL_ROLES,
  },
  'route.userById': {
    description: 'Staff can view any profile; users can only access their own id.',
    allowedRoles: ALL_ROLES,
    condition: ({ actorUserId, targetUserId }, role) =>
      role !== 'user' ||
      (Boolean(actorUserId) && Boolean(targetUserId) && actorUserId === targetUserId),
  },
  'component.dashboard.adminTab': {
    description: 'Only admins can access admin dashboard tab.',
    allowedRoles: ['admin'],
  },
  'component.dashboard.analyticsTab': {
    description: 'Support and admin can access analytics tab.',
    allowedRoles: STAFF_ROLES,
  },
  'component.users.profileEdit': {
    description: 'Only admins can edit profile fields.',
    allowedRoles: ['admin'],
  },
};

export const canAccess = (
  access: AccessKey,
  role: UserRole | null | undefined,
  context: AccessContext = {},
): boolean => {
  if (!role) {
    return false;
  }

  const rule = ACCESS_MATRIX[access];
  if (!rule.allowedRoles.includes(role)) {
    return false;
  }

  if (!rule.condition) {
    return true;
  }

  return rule.condition(context, role);
};
