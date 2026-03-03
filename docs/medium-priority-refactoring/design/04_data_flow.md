# Data Flow — Medium Priority Refactoring

**Date:** 2026-03-03
**Note:** No new server state is introduced. Existing TanStack Query data flows are unchanged. This document covers the three changed internal data paths.

---

## 1. isStaff Resolution Flow (after refactoring)

```
Backend API (/api/auth/profile)
  └─▶ AuthContext (src/shared/context/AuthContext.tsx)
        └─▶ stores: { role: UserRole, ... }
              └─▶ useAuth()
                    └─▶ useIsStaff()   ← src/shared/hooks/useIsStaff.ts
                          computes:
                            isStaff  = role === 'admin' || role === 'support1'
                            isAdmin  = role === 'admin'
                            isSupport = role === 'support1'
                            isRoleReady = role !== undefined && role !== null
                          └─▶ returns { isStaff, isAdmin, isSupport, isRoleReady, role }
                                └─▶ DashboardPage   { isStaff } → prop → DashboardContent
                                └─▶ CreateTicket    { isStaff, isRoleReady } → prop → CreateTicketForm
                                └─▶ Tickets         { isStaff } → useTicketFilters(options)
                                └─▶ TicketDetailPage { isStaff } → prop → TicketWorkflowCard, TicketEditForm
                                └─▶ PersonalInformationSection (calls hook directly, no prop needed)
```

**ticketColumns.tsx — special path (render function, no hook):**
```
ticketColumns render fn receives: role (parameter)
  └─▶ line 38: role === 'admin' && !!ownerId          (admin-only check — UNCHANGED)
  └─▶ line 76: STAFF_ROLES.includes(role) && !!assigneeId  ← replaces inline check
               STAFF_ROLES imported from @/shared/security/access-matrix
```

**TicketDetailPage — special source:**
```
TicketDetailPage uses useAuthContext() (not useAuth())
  └─▶ currentUser = useAuthContext().user
  Current: const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'support1'
  After:   const { isStaff } = useIsStaff()
           (useIsStaff internally calls useAuth() which reads the same AuthContext)
```

---

## 2. LoadingState / ErrorState Rendering Flow (after refactoring)

```
TanStack Query hook (e.g. useTicket, useUser)
  └─▶ returns { data, isLoading, isError, error }
        └─▶ Page Component (TicketDetailPage / UserProfile)
              ├─▶ isLoading === true
              │     └─▶ <LoadingState message="..." />   ← src/shared/components/LoadingState
              ├─▶ isError === true || data === undefined
              │     └─▶ <ErrorState message="..." onClose={...} />  ← src/shared/components/ErrorState
              │           onClose is optional — rendered only when provided
              └─▶ data present
                    └─▶ render main content
```

**Shared component props (resolved API):**
```
LoadingState:
  message?: string   ← optional; component uses its own default when absent

ErrorState:
  message: string    ← required
  onClose?: () => void  ← optional; close button rendered only when provided
```

**Migration:**
- `UserProfile.tsx`: `onClose` passed → close button visible (behavior preserved)
- `TicketDetailPage.tsx`: `onClose` not passed → no close button (matches current inline behavior)

---

## 3. useDashboardData Flow (unchanged except import path)

**Before:**
```
dashboard-page-contract.tsx
  import { useDashboardData } from '@/app/hooks/useDashboardData'
    └─▶ wraps in DashboardPageContractProvider
          └─▶ DashboardPage reads via useDashboardPageContract()
```

**After:**
```
dashboard-page-contract.tsx
  import { useDashboardData } from '@/features/dashboard'   ← updated
    └─▶ wraps in DashboardPageContractProvider  (unchanged)
          └─▶ DashboardPage reads via useDashboardPageContract()  (unchanged)
```

**Internal data flow of useDashboardData (unchanged):**
```
useDashboardData()
  ├─▶ useQuery(['dashboard', 'user-tickets'])      → getTickets({ scope: 'mine' })
  ├─▶ useQuery(['dashboard', 'all-tickets'])        → getAllTickets()
  ├─▶ useQuery(['dashboard', 'tickets-today'])      → getTickets({ scope: 'mine', date: 'today' })
  ├─▶ useQuery(['dashboard', 'support-users'])      → getSupportUsers()
  ├─▶ useQuery(['dashboard', 'user-ticket-stats'])  → getUserTicketStats()
  ├─▶ useQuery(['dashboard', 'ai-stats'])           → getAIStats()
  ├─▶ useQuery(['dashboard', 'monthly-ticket-stats']) → getTicketStatsOfMonth()
  ├─▶ useEffect: setUserStatusOnline() on mount
  ├─▶ useEffect: activityInterval() every 2 minutes (cleanup on unmount)
  └─▶ returns computed { adminSummary, userSummary, recentTicket, supportStatus, ... }
```

All `@/features/tickets` and `@/features/users` imports must use feature index files
(not internal paths), in conformance with CLAUDE.md rule 7.

---

## Error Paths

| Scenario | Current behavior | After refactoring |
|---|---|---|
| `role` is `undefined` during auth loading | inline checks may return false | `useIsStaff()` returns `isRoleReady: false`, `isStaff: false` — same result |
| API error on dashboard queries | TanStack Query sets `isError: true` | unchanged — `useDashboardData` behavior identical |
| LoadingState rendered without `message` | N/A (tickets inline had static text) | shared `LoadingState` renders its own default message |
| ErrorState rendered without `onClose` | N/A (tickets inline had no close button) | shared `ErrorState` renders no close button when `onClose` absent |
