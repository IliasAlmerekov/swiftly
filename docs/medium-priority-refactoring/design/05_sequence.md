# Sequence Diagrams — Medium Priority Refactoring

**Date:** 2026-03-03

---

## Diagram 1 — isStaff Resolution in Page Components

### Happy path (role loaded)

```
Backend API
  └──▶ AuthContext.setProfile(profile)
         stores: role = 'admin' | 'support1' | 'customer'

Page (e.g. DashboardPage) mounts
  └──▶ useIsStaff()
         └──▶ useAuth()
                └──▶ AuthContext: reads role
         computes: isStaff = role === 'admin' || role === 'support1'
         returns: { isStaff, isAdmin, isSupport, isRoleReady, role }

Page: destructures { isStaff }
Page: passes isStaff={isStaff} to child component
Child component: renders staff-only UI iff isStaff === true
```

### Role not yet loaded (auth initializing)

```
Page mounts before auth resolves
  └──▶ useIsStaff()
         └──▶ useAuth(): role === undefined
         returns: { isStaff: false, isRoleReady: false, ... }

Page: isStaff === false → staff-only UI hidden
Auth resolves → role becomes 'admin'
  └──▶ useIsStaff() re-runs (memo dependency [role] changed)
         returns: { isStaff: true, isRoleReady: true }
Page re-renders → staff-only UI appears
```

### ticketColumns special case (render function, no hook)

```
Tickets page calls useIsStaff()
  returns { role }
  passes role into ticketColumns column definitions

columnDef.cell render function runs:
  const role = getValue()  // role from render parameter
  // Line 38 (owner cell — admin only, unchanged):
  const isClickable = role === 'admin' && !!ownerId
  // Line 76 (assignee cell — staff check):
  const isClickable = STAFF_ROLES.includes(role) && !!assigneeId
  //   STAFF_ROLES from @/shared/security/access-matrix
```

---

## Diagram 2 — LoadingState / ErrorState Rendering

### TicketDetailPage happy/error paths (after refactoring)

```
TicketDetailPage mounts
  └──▶ useTicket(ticketId) [TanStack Query]

Case A — ticketId missing:
  └──▶ <ErrorState message="Ticket not found" />
         (shared component, onClose not passed → no close button)

Case B — isLoading === true:
  └──▶ <LoadingState />
         (shared component, message not passed → renders default)

Case C — isError === true:
  └──▶ <ErrorState message={error.message} />
         (shared component, onClose not passed → no close button)

Case D — ticket === undefined (loaded but not found):
  └──▶ <ErrorState message="Ticket not found" />

Case E — data loaded successfully:
  └──▶ renders ticket detail content
```

### UserProfile happy/error paths (after refactoring)

```
UserProfile mounts
  └──▶ useUserProfile() [TanStack Query]

Case A — isLoading === true:
  └──▶ <LoadingState message="Loading profile..." />
         (shared component, optional message passed)

Case B — fetchError present, user undefined:
  └──▶ <ErrorState message={fetchError.message} onClose={clearFetchError} />
         (onClose passed → close button rendered — behavior preserved)

Case C — localError present:
  └──▶ <ErrorState message={localError} onClose={clearLocalError} />

Case D — data loaded:
  └──▶ renders profile content
```

---

## Diagram 3 — useDashboardData Initialization (import path change only)

### Before (current)

```
dashboard-page-contract.tsx
  import { useDashboardData } from '@/app/hooks/useDashboardData'
  │
  └──▶ DashboardPageContractProvider
         provides: { useDashboardData }
         │
         └──▶ DashboardPage
                reads via useDashboardPageContract()
                calls useDashboardData()
                  └──▶ 7x useQuery → backend API
                  └──▶ useEffect: setUserStatusOnline
                  └──▶ useEffect: activityInterval
                returns 18-field dashboard state object
```

### After (post-move)

```
dashboard-page-contract.tsx
  import { useDashboardData } from '@/features/dashboard'   ← CHANGED
  │
  └──▶ DashboardPageContractProvider   ← UNCHANGED
         provides: { useDashboardData }
         │
         └──▶ DashboardPage            ← UNCHANGED
                reads via useDashboardPageContract()
                calls useDashboardData()
                  └──▶ 7x useQuery → backend API  ← UNCHANGED
                  └──▶ useEffect: setUserStatusOnline  ← UNCHANGED
                  └──▶ useEffect: activityInterval     ← UNCHANGED
                returns 18-field dashboard state object  ← UNCHANGED
```

### Test mock path update

```
Before:  vi.mock('@/app/hooks/useDashboardData', () => ({ useDashboardData: vi.fn() }))
After:   vi.mock('@/features/dashboard', () => ({ useDashboardData: vi.fn() }))
```

**Behavior delta: none.** Only the module resolution path changes.
