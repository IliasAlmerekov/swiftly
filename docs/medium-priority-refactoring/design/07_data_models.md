# Data Models — Medium Priority Refactoring

**Date:** 2026-03-03
**Note:** No new domain types. Only shared component prop interfaces are introduced.

---

## 1. useIsStaff Return Type (EXISTING — unchanged)

**File:** `src/shared/hooks/useIsStaff.ts`
**Status:** No changes to the hook interface. Already complete.

```ts
// Existing — do NOT modify
interface UseIsStaffResult {
  isStaff: boolean;       // role === 'admin' || role === 'support1'
  isAdmin: boolean;       // role === 'admin'
  isSupport: boolean;     // role === 'support1'
  isRoleReady: boolean;   // role !== undefined && role !== null
  role: UserRole;
}
```

---

## 2. Shared LoadingState Props (NEW)

**File:** `src/shared/components/LoadingState.tsx`

```ts
interface LoadingStateProps {
  message?: string;
  // No default specified here — component defines its own default
}
```

**Design decision:** `message` is optional. The component renders a sensible default (e.g. `"Loading..."`) when omitted. This accommodates:
- `TicketDetailPage` inline variant — had no props (static text)
- `UserProfile` usage — passes `message="Loading profile..."`

---

## 3. Shared ErrorState Props (NEW)

**File:** `src/shared/components/ErrorState.tsx`

```ts
interface ErrorStateProps {
  message: string;
  onClose?: () => void;
  // onClose is OPTIONAL (was required in users/components/ErrorState)
}
```

**Design decision:** `onClose` becomes optional. See ADR-002.
- When `onClose` is provided → close button is rendered
- When `onClose` is absent → no close button rendered

This accommodates:
- `UserProfile` — passes `onClose` → close button shown (behavior preserved)
- `TicketDetailPage` inline variant — had no `onClose` → no close button (behavior preserved)

---

## 4. useDashboardData Return Type (EXISTING — unchanged)

**File:** `src/features/dashboard/hooks/useDashboardData.ts` (after move)
**Status:** Identical to current `src/app/hooks/useDashboardData.ts`. No interface changes.

```ts
// Existing types from src/features/dashboard/types/dashboard.ts
interface UseDashboardDataResult {
  adminSummary: DashboardTicketSummary;
  userSummary: DashboardTicketSummary;
  recentTicket: Ticket | null;
  isRecentTicketsLoading: boolean;
  isRecentTicketsError: boolean;
  supportStatus: DashboardSupportStatus;
  userMonthlyStats: DashboardMonthlyStat[];
  userMonthlyStatsPeriodLabel: string;
  isUserMonthlyStatsLoading: boolean;
  aiStats: DashboardAiRequestStat[];
  isAiStatsLoading: boolean;
  monthlyTicketStats: DashboardMonthlyStat[];
  monthlyTicketStatsPeriodLabel: string;
  isMonthlyTicketStatsLoading: boolean;
  isAdminMetricsLoading: boolean;
  isAdminMetricsError: boolean;
  isUserMetricsLoading: boolean;
  isUserMetricsError: boolean;
}
```

---

## 5. STAFF_ROLES (EXISTING — unchanged, new import site)

**File:** `src/shared/security/access-matrix.ts`
**Status:** No changes. `ticketColumns.tsx` will import this constant.

```ts
// Existing — do NOT modify
const STAFF_ROLES: UserRole[] = ['support1', 'admin'];
```

`ticketColumns.tsx` line 76 replacement:
```ts
// Before:
const isClickable = (role === 'admin' || role === 'support1') && !!assigneeId;

// After:
const isClickable = STAFF_ROLES.includes(role) && !!assigneeId;
```

---

## Summary of Type Changes

| Type | File | Change |
|---|---|---|
| `LoadingStateProps` | `src/shared/components/LoadingState.tsx` | **NEW** |
| `ErrorStateProps` | `src/shared/components/ErrorState.tsx` | **NEW** |
| `UseIsStaffResult` | `src/shared/hooks/useIsStaff.ts` | Unchanged |
| `UseDashboardDataResult` | `src/features/dashboard/hooks/useDashboardData.ts` | Unchanged (moved) |
| Dashboard types (`DashboardTicketSummary`, etc.) | `src/features/dashboard/types/dashboard.ts` | Unchanged |
