# Test Strategy — Medium Priority Refactoring

**Date:** 2026-03-03

---

## Overview

This refactoring introduces two new shared components and moves one hook. All existing tests must continue to pass (no regressions). New unit tests are needed for the two new shared components.

---

## 1. New Tests — Shared Components

### `src/shared/components/LoadingState.tsx`

**Test file:** `src/shared/components/LoadingState.test.tsx`
**Render wrapper:** `render()` from `@/test/test-utils`
**MSW handlers:** None needed

| Scenario | Input | Expected |
|---|---|---|
| Renders with explicit message | `<LoadingState message="Loading tickets..." />` | text "Loading tickets..." visible |
| Renders with default message | `<LoadingState />` (no props) | default message text visible (not empty) |
| Renders loading spinner/indicator | `<LoadingState />` | spinner element present in DOM |

### `src/shared/components/ErrorState.tsx`

**Test file:** `src/shared/components/ErrorState.test.tsx`
**Render wrapper:** `render()` from `@/test/test-utils`
**MSW handlers:** None needed

| Scenario | Input | Expected |
|---|---|---|
| Renders error message | `<ErrorState message="Something went wrong" />` | text "Something went wrong" visible |
| Renders close button when onClose provided | `<ErrorState message="err" onClose={fn} />` | close button visible in DOM |
| Close button calls onClose | `<ErrorState message="err" onClose={mockFn} />` + user clicks close | `mockFn` called once |
| No close button when onClose absent | `<ErrorState message="err" />` | no close button in DOM |

---

## 2. Regression Tests — isStaff Consolidation

All existing page tests that cover staff/non-staff rendering must continue to pass after replacing inline `isStaff` with `useIsStaff()`.

**Strategy:** Mock `useAuth()` (or `useAuthContext()`) to return specific role values. `useIsStaff()` is not mocked — it is exercised through the real hook.

| Test file | Scenario | Mock | Expected |
|---|---|---|---|
| `DashboardPage.test.tsx` | staff user sees admin tab | `useAuth().role = 'admin'` | admin dashboard tab rendered |
| `DashboardPage.test.tsx` | non-staff user sees user tab only | `useAuth().role = 'customer'` | no admin-specific content |
| `CreateTicket.test.tsx` (if exists) | staff sees assignee field | `useAuth().role = 'support1'` | assignee field visible |
| `Tickets.test.tsx` (if exists) | staff sees all-tickets filter | `useAuth().role = 'admin'` | all-tickets tab visible |
| `TicketDetailPage.test.tsx` (if exists) | staff sees workflow card | `useAuthContext().user.role = 'admin'` | workflow card rendered |

---

## 3. Regression Tests — useDashboardData Move

Existing `DashboardPage.test.tsx` mocks `useDashboardData`. After the move, only the mock path changes.

| File | Change | Expected behavior |
|---|---|---|
| `DashboardPage.test.tsx` | `vi.mock('@/app/hooks/useDashboardData', ...)` → `vi.mock('@/features/dashboard', ...)` | All existing test scenarios pass unchanged |

**No new test logic** is required for `useDashboardData` — its behavior is identical post-move.

---

## 4. Regression Tests — LoadingState/ErrorState Migration

| Test file | Scenario | Expected |
|---|---|---|
| `UserProfile.test.tsx` (if exists) | loading state shown | shared `LoadingState` renders (import updated) |
| `UserProfile.test.tsx` (if exists) | error state with close | shared `ErrorState` with close button renders |
| `TicketDetailPage.test.tsx` (if exists) | loading state shown | shared `LoadingState` renders (was inline) |
| `TicketDetailPage.test.tsx` (if exists) | error state (no close) | shared `ErrorState` without close button |

---

## 5. Quality Gates (must pass after all changes)

```bash
npm run type-check                     # tsc --noEmit — catches wrong imports
npm run lint -- --max-warnings 0       # ESLint
npm run format:check                   # Prettier
npm run test:run                       # full Vitest suite — no regressions
npm run build                          # Vite build — catches dead code, bad imports
```

---

## Test Infrastructure Notes

- All test renders use `render()` from `src/test/test-utils.tsx` (wraps with QueryClient, Router, AuthContext)
- No new MSW handlers needed (no new API endpoints)
- Deleted feature-scoped files (`users/components/LoadingState.tsx`, `ErrorState.tsx`) must not break any test imports — update `users/components/index.ts` and any test that imported from there
