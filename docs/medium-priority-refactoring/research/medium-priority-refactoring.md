# Research: Medium Priority Refactoring

**Date:** 2026-03-03
**Ticket:**

> - Duplication of `isStaff` checks in `DashboardPage.tsx`, `CreateTicket.tsx`, `Tickets.tsx`, `ticketColumns.tsx` — fix: use `useIsStaff()` everywhere
> - Duplication of `LoadingState`/`ErrorState` in `TicketDetailPage.tsx` and `users/hooks/components/` — fix: extract into `shared/components/`
> - `useDashboardData` lives in `app/hooks/` instead of `features/dashboard/` — fix: move it

---

## Current State

All three problems exist simultaneously: `useIsStaff()` is defined but unused (5+ files inline-duplicate the role check); `LoadingState`/`ErrorState` have two separate implementations with different APIs; `useDashboardData` lives in `src/app/hooks/` and is an orchestration hook that aggregates data from both `tickets` and `users` features.

---

## Domain Entities

### useIsStaff Hook

**File:** `src/shared/hooks/useIsStaff.ts`
**Exported function:** `useIsStaff()`
**Return type:**

```ts
{
  isStaff: boolean; // role === 'admin' || role === 'support1'
  isAdmin: boolean; // role === 'admin'
  isSupport: boolean; // role === 'support1'
  isRoleReady: boolean; // role !== undefined && role !== null
  role: UserRole;
}
```

**Dependencies:** `useAuth()` → reads `role` field
**Current consumers:** ZERO — hook is defined but not imported anywhere

### STAFF_ROLES constant

**File:** `src/shared/security/access-matrix.ts`, line 24
**Value:** `const STAFF_ROLES: UserRole[] = ['support1', 'admin'];`
**Usage:** Used as `allowedRoles` in access guard configuration

### LoadingState (users feature)

**File:** `src/features/users/components/LoadingState.tsx`
**Props:**

```ts
interface LoadingStateProps {
  message?: string; // defaults to 'Loading profile...'
}
```

**JSX structure:** Full-screen flex container (`min-h-screen`), animated spinning border circle (`border-primary`), message text
**Exported via:** `src/features/users/components/index.ts` line 3

### LoadingState (tickets inline)

**File:** `src/features/tickets/pages/TicketDetailPage.tsx`, lines 24–28
**Props:** None
**JSX structure:** `flex flex-1 items-center justify-center` container, static `"Loading..."` text
**Note:** Defined inline inside the page file, not extracted

### ErrorState (users feature)

**File:** `src/features/users/components/ErrorState.tsx`
**Props:**

```ts
interface ErrorStateProps {
  message: string;
  onClose: () => void; // required callback
}
```

**JSX structure:** `bg-destructive` banner, `text-destructive-foreground`, underlined close button with `onClick`
**Exported via:** `src/features/users/components/index.ts` line 4

### ErrorState (tickets inline)

**File:** `src/features/tickets/pages/TicketDetailPage.tsx`, lines 31–35
**Props:** `{ message: string }` — no onClose callback
**JSX structure:** `flex flex-1 items-center justify-center`, `text-red-500` message
**Note:** Defined inline inside the page file, not extracted

### useDashboardData Hook

**File:** `src/app/hooks/useDashboardData.ts`
**Exported function:** `useDashboardData()`
**Return value (18 fields):**

```ts
{
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

**Imports from `@/features/tickets`:** `getAIStats`, `getAllTickets`, `getTicketStatsOfMonth`, `getTickets`, `getUserTicketStats`
**Imports from `@/features/users`:** `activityInterval`, `getSupportUsers`, `setUserStatusOnline`
**Imports from `@/features/dashboard/types/dashboard`:** `DashboardAiRequestStat`, `DashboardMonthlyStat`, `DashboardSupportStatus`, `DashboardTicketSummary`
**Side effects:** `setUserStatusOnline()` on mount; `activityInterval()` every 2 minutes (cleanup included)
**Internal helpers:** `normalizeAiStats()`, `calculateTicketSummary()`

---

## Architecture and Patterns

### Folder structure (relevant portions)

```
src/
  app/
    hooks/
      useDashboardData.ts          ← only hook in this directory
    pages/
      DashboardPage.tsx
      DashboardPage.test.tsx
      dashboard-page-contract.tsx  ← contract/DI wrapper for useDashboardData
  features/
    dashboard/
      components/
        AdminTicketCard.tsx
        DashboardContent.tsx       ← receives isStaff as prop (line 35, 42, 48)
        DashboardTabContent.tsx
        RecentTickets.tsx
        UserTicketCard.tsx
        ViewSupportStatus.tsx
        charts/
          AnalyticsChart.tsx
          HardwareChart.tsx
          TicketsOfMonth.tsx
          TicketsofThisWeek.tsx
          TicketStatusChart.tsx
          UserTicketStats.tsx
      hooks/
        useGreeting.ts             ← feature-scoped hook, exported via index.ts
        useGreeting.test.ts
      pages/
        Analytics.tsx
      types/
        dashboard.ts               ← DashboardTicketSummary, DashboardSupportStatus, etc.
      index.ts                     ← exports: Analytics, DashboardContent, useGreeting, types
    tickets/
      components/
        CreateTicketForm.tsx       ← receives isStaff: boolean as prop (line 39)
        ticket-detail/
          ticket-edit-form.tsx     ← receives isStaff: boolean as prop (line 28)
          ticket-workflow-card.tsx ← receives isStaff: boolean as prop (line 74)
      config/
        ticketColumns.tsx          ← inline role checks (lines 38, 76)
      hooks/
        useCreateTicketForm.ts     ← receives isStaff: boolean as param
        useTicketFilters.ts        ← receives isStaff: boolean in options (lines 57, 79)
      pages/
        CreateTicket.tsx           ← inline: const isStaff = role === 'admin' || role === 'support1';
        TicketDetailPage.tsx       ← inline isStaff + defines LoadingState/ErrorState inline
        Tickets.tsx                ← inline: const isStaff = role === 'admin' || role === 'support1';
    users/
      components/
        ErrorState.tsx             ← feature-scoped ErrorState
        LoadingState.tsx           ← feature-scoped LoadingState
        PersonalInformationSection.tsx ← inline isStaff check (line 56)
        index.ts                   ← exports LoadingState, ErrorState
      pages/
        UserProfile.tsx            ← imports LoadingState, ErrorState from ../components
  shared/
    components/
      ui/                          ← shadcn/ui (never modify directly)
      auth/                        ← AccessGuard, ProtectedRoute
      layout/                      ← AppLayout, Sidebar, TabPageLayout
    context/
      AuthContext.tsx              ← stores user.role, maps profile.role → AuthUserState.role
    hooks/
      useIsStaff.ts                ← defined but ZERO consumers
    security/
      access-matrix.ts             ← STAFF_ROLES = ['support1', 'admin']
```

### Naming conventions observed

- Feature hooks: `use{FeatureName}.ts` in `features/{name}/hooks/`
- Shared hooks: `use{Name}.ts` in `shared/hooks/`
- Component files: PascalCase, `features/{name}/components/`
- Feature exports: all through `features/{name}/index.ts`

### Contract / DI pattern for DashboardPage

**File:** `src/app/pages/dashboard-page-contract.tsx`

- Defines `DashboardPageContract` interface with `useDashboardData` field
- `DashboardPageContractProvider` context provides real implementation
- `DashboardPage` reads from contract via `useDashboardPageContract()`
- `DashboardPage.test.tsx` mocks: `vi.mock('@/app/hooks/useDashboardData', ...)`

---

## Related Use Cases and Controllers

### isStaff inline computations (5 pages/components)

| File                                                           | Line  | Pattern                                                               |
| -------------------------------------------------------------- | ----- | --------------------------------------------------------------------- |
| `src/app/pages/DashboardPage.tsx`                              | 31    | `const isStaff = role === 'admin' \|\| role === 'support1';`          |
| `src/features/tickets/pages/CreateTicket.tsx`                  | 20–22 | Same + `isRoleReady`                                                  |
| `src/features/tickets/pages/Tickets.tsx`                       | 120   | `const isStaff = role === 'admin' \|\| role === 'support1';`          |
| `src/features/tickets/pages/TicketDetailPage.tsx`              | 55    | `currentUser?.role === 'admin' \|\| currentUser?.role === 'support1'` |
| `src/features/users/components/PersonalInformationSection.tsx` | 56    | `currentUser?.role === 'admin' \|\| currentUser?.role === 'support1'` |

### TicketDetailPage.tsx — isStaff source

**File:** `src/features/tickets/pages/TicketDetailPage.tsx`, line 55
**Source:** `useAuthContext().user` mapped to `currentUser` — differs from pages that use `useAuth().role`

### ticketColumns.tsx — inline role checks (not isStaff pattern)

**File:** `src/features/tickets/config/ticketColumns.tsx`

- Line 38: `const isClickable = role === 'admin' && !!ownerId;` (owner cell — admin only)
- Line 76: `const isClickable = (role === 'admin' || role === 'support1') && !!assigneeId;` (assignee cell — full staff)
- `role` arrives as a render function parameter, not via hook

### useDashboardData consumers

| File                                        | Consumption method                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------- |
| `src/app/pages/dashboard-page-contract.tsx` | Direct import: `import { useDashboardData } from '@/app/hooks/useDashboardData'` |
| `src/app/pages/DashboardPage.tsx`           | Via contract: `useDashboardPageContract().useDashboardData()`                    |
| `src/app/pages/DashboardPage.test.tsx`      | Mocked: `vi.mock('@/app/hooks/useDashboardData', ...)`                           |

---

## Data Persistence and Mapping

Not applicable — this ticket concerns frontend component architecture and hook placement, not data persistence layers.

---

## External Integrations

Not applicable — all three problems are internal to the frontend React component/hook architecture.

---

## Missing — Required for This Ticket

### isStaff consolidation

- `useIsStaff()` hook: EXISTS at `src/shared/hooks/useIsStaff.ts` — not missing, but zero consumers
- `isStaff` removal from 5 inline files: currently inline-duplicated in each

### LoadingState/ErrorState shared components

- `src/shared/components/LoadingState`: NOT FOUND — does not exist
- `src/shared/components/ErrorState`: NOT FOUND — does not exist
- A shared props interface reconciling users (message + onClose) and tickets (message only) variants: NOT FOUND

### useDashboardData location

- `src/features/dashboard/hooks/useDashboardData.ts`: NOT FOUND
- `useDashboardData` in `src/features/dashboard/index.ts` exports: NOT FOUND

---

## File Reference Index

**MUST READ before implementation:**

- `src/shared/hooks/useIsStaff.ts` — existing hook definition
- `src/shared/security/access-matrix.ts` — STAFF_ROLES constant
- `src/shared/context/AuthContext.tsx` — role source of truth
- `src/app/pages/DashboardPage.tsx` — inline isStaff at line 31
- `src/app/pages/dashboard-page-contract.tsx` — DI wrapper for useDashboardData
- `src/app/pages/DashboardPage.test.tsx` — mock pattern for useDashboardData
- `src/app/hooks/useDashboardData.ts` — hook to be moved
- `src/features/tickets/pages/CreateTicket.tsx` — inline isStaff at lines 20–22
- `src/features/tickets/pages/Tickets.tsx` — inline isStaff at line 120
- `src/features/tickets/pages/TicketDetailPage.tsx` — inline isStaff (line 55) + inline LoadingState/ErrorState (lines 24–35)
- `src/features/tickets/config/ticketColumns.tsx` — inline role checks (lines 38, 76)
- `src/features/tickets/components/CreateTicketForm.tsx` — receives isStaff as prop
- `src/features/tickets/components/ticket-detail/ticket-edit-form.tsx` — receives isStaff as prop
- `src/features/tickets/components/ticket-detail/ticket-workflow-card.tsx` — receives isStaff as prop
- `src/features/tickets/hooks/useTicketFilters.ts` — receives isStaff as param
- `src/features/tickets/hooks/useCreateTicketForm.ts` — receives isStaff as param
- `src/features/users/components/LoadingState.tsx` — users-scoped LoadingState definition
- `src/features/users/components/ErrorState.tsx` — users-scoped ErrorState definition
- `src/features/users/components/index.ts` — exports LoadingState, ErrorState
- `src/features/users/pages/UserProfile.tsx` — imports LoadingState/ErrorState from users feature
- `src/features/users/components/PersonalInformationSection.tsx` — inline isStaff at line 56
- `src/features/dashboard/components/DashboardContent.tsx` — receives isStaff as prop
- `src/features/dashboard/hooks/useGreeting.ts` — reference: feature-scoped hook pattern
- `src/features/dashboard/index.ts` — current dashboard exports (useDashboardData absent)
- `src/features/dashboard/types/dashboard.ts` — dashboard type definitions

**NOT FOUND (confirmed absent):**

- `src/shared/components/LoadingState` — no file
- `src/shared/components/ErrorState` — no file
- `src/features/dashboard/hooks/useDashboardData.ts` — no file
- Any consumer of `useIsStaff` hook (zero imports confirmed by grep)

---

## Constraints Observed

- **`useIsStaff()` hook is defined and complete** — confirmed at `src/shared/hooks/useIsStaff.ts`; it already returns `isStaff`, `isAdmin`, `isSupport`, `isRoleReady`, `role`
- **STAFF_ROLES definition** — `['support1', 'admin']` confirmed in `access-matrix.ts` line 24; matches inline pattern across all 5 files
- **isStaff prop-drilling pattern is established** — presentational components (`CreateTicketForm`, `TicketEditForm`, `TicketWorkflowCard`, `DashboardContent`) receive `isStaff: boolean` as prop; this prop-based API is already in place
- **ticketColumns.tsx `role` parameter** — receives `role` (not `isStaff`) as a render function parameter; different calling convention from page components
- **TicketDetailPage uses `useAuthContext()` not `useAuth()`** — line 55 accesses `currentUser?.role` whereas other files use `useAuth().role`
- **LoadingState/ErrorState props APIs differ** — users `ErrorState` requires `onClose: () => void`; tickets inline version has no `onClose`; reconciliation needed for shared version
- **useDashboardData imports from two features** — `@/features/tickets` (5 functions) and `@/features/users` (3 functions); it is a cross-feature aggregation hook
- **Contract DI pattern** — `dashboard-page-contract.tsx` wraps `useDashboardData` for mockability; any move of the hook must update the import path in this file and in `DashboardPage.test.tsx`
- **`src/features/dashboard/index.ts` does not export `useDashboardData`** — confirmed; it exports only `Analytics`, components, `useGreeting`, and types
- **Feature boundary rule** — CLAUDE.md rule 7: "NEVER cross feature boundaries — only import through `features/{name}/index.ts`"
- **All feature hooks exported through index.ts** — confirmed for `useGreeting` in `src/features/dashboard/index.ts`
- **Only one file in `src/app/hooks/`** — `useDashboardData.ts` is the sole occupant; no other app-layer hooks
