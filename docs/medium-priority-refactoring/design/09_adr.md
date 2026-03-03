# Architecture Decision Records — Medium Priority Refactoring

**Date:** 2026-03-03

---

## ADR-001: useDashboardData Placement — `app/hooks/` vs `features/dashboard/hooks/`

**Status:** Proposed — pending human review

### Context

`useDashboardData` currently lives in `src/app/hooks/useDashboardData.ts`, the only file in that directory. The ticket requests moving it to `features/dashboard/`. The hook aggregates data from `@/features/tickets` (5 functions) and `@/features/users` (3 functions), and imports all 4 type definitions from `@/features/dashboard/types/dashboard`.

### Option A — Keep in `src/app/hooks/` (current location)

`src/app/hooks/` was created as an "app-layer orchestration" location for hooks that cross feature boundaries.

**Rejected because:**
- It is the only file in `src/app/hooks/` — the directory serves no broader purpose
- All 4 type definitions come from `features/dashboard/` — the hook is conceptually a dashboard concern
- CLAUDE.md rule 7 allows cross-feature imports when done through `features/{name}/index.ts`; this is not a true cross-feature concern since the hook outputs dashboard-typed data
- Having a single file in `app/hooks/` creates an inconsistent pattern not repeated elsewhere

### Option B — Move to `src/features/dashboard/hooks/useDashboardData.ts` (chosen)

**Chosen because:**
- The ticket explicitly requires this move
- All output types are dashboard-scoped (`DashboardTicketSummary`, `DashboardSupportStatus`, etc.)
- `features/dashboard/hooks/` already exists (hosts `useGreeting.ts`) — this is the established pattern for feature hooks
- Cross-feature API calls (`getTickets`, `getSupportUsers`) are imported through feature index files, satisfying CLAUDE.md rule 7

**Consequences:**
- `src/app/hooks/useDashboardData.ts` is deleted
- `src/features/dashboard/hooks/useDashboardData.ts` is created with identical implementation
- `src/features/dashboard/index.ts` must add `export { useDashboardData } from './hooks/useDashboardData'`
- `src/app/pages/dashboard-page-contract.tsx` import: `@/app/hooks/useDashboardData` → `@/features/dashboard`
- `src/app/pages/DashboardPage.test.tsx` mock: `vi.mock('@/app/hooks/useDashboardData', ...)` → `vi.mock('@/features/dashboard', ...)`
- **CONSTRAINT:** All imports of `getAIStats`, `getAllTickets`, etc. inside `useDashboardData` must use `@/features/tickets` and `@/features/users` (feature index), never internal paths

---

## ADR-002: ErrorState `onClose` Prop — Required vs Optional in Shared Component

**Status:** Proposed — pending human review

### Context

Two existing implementations of `ErrorState` have incompatible prop APIs:

| Implementation | `onClose` |
|---|---|
| `src/features/users/components/ErrorState.tsx` | **required** `onClose: () => void` — close button always rendered |
| `TicketDetailPage.tsx` inline | **absent** — no close button |

A single shared component must serve both use cases.

### Option A — Keep `onClose` required

Requires `TicketDetailPage` to pass a no-op handler: `onClose={() => {}}`.

**Rejected because:**
- Semantically incorrect: a no-op close handler implies the error can be dismissed, but the tickets page re-fetches or navigates away — the concept of "dismiss" is inappropriate there
- Forces callers to supply boilerplate for a feature they do not use

### Option B — Make `onClose` optional (chosen)

```ts
interface ErrorStateProps {
  message: string;
  onClose?: () => void;
}
```

Close button is rendered **only when `onClose` is provided**.

**Chosen because:**
- `UserProfile` passes `onClose` → close button appears (behavior preserved, no regression)
- `TicketDetailPage` does not pass `onClose` → no close button (matches current inline behavior)
- API is more honest: the component only offers dismiss when the caller supports it

**Consequences:**
- `UserProfile.tsx` continues to pass `onClose` — no change needed to its call site
- `TicketDetailPage.tsx` does not pass `onClose` — no change needed to its call site
- The users feature-scoped `ErrorState.tsx` is deleted; its only consumer (`UserProfile`) is updated to import from shared

---

## ADR-003: Feature-Scoped LoadingState/ErrorState — Delete vs Re-export

**Status:** Proposed — pending human review

### Context

`src/features/users/components/` currently defines `LoadingState.tsx` and `ErrorState.tsx`, exported through `src/features/users/components/index.ts`. The only consumer is `src/features/users/pages/UserProfile.tsx`.

### Option A — Keep feature-scoped files as re-exports from shared

```ts
// src/features/users/components/LoadingState.tsx (after)
export { LoadingState } from '@/shared/components/LoadingState';
```

**Rejected because:**
- Creates indirection with no benefit: `UserProfile` imports from `../components` which re-exports from `shared/components` — adding a hop
- Does not eliminate the concept of feature-local loading/error components; developers may create more of them in future
- Contradicts the goal of consolidating to shared — the feature barrel would still advertise these components as "feature-owned"

### Option B — Delete feature-scoped files, update consumers to import from shared (chosen)

```ts
// src/features/users/pages/UserProfile.tsx (after)
import { LoadingState, ErrorState } from '@/shared/components';
```

**Chosen because:**
- Eliminates the duplication entirely — one canonical location in `shared/components/`
- `shared/components/` is the established home for cross-feature presentational utilities (alongside `auth/` and `layout/`)
- Importing directly from `@/shared/components` is permitted — CLAUDE.md rule 7 restricts cross-**feature** imports, not imports from `shared/`

**Consequences:**
- `src/features/users/components/LoadingState.tsx` deleted
- `src/features/users/components/ErrorState.tsx` deleted
- `src/features/users/components/index.ts` updated: remove `LoadingState` and `ErrorState` export lines
- `src/features/users/pages/UserProfile.tsx` updated: import from `@/shared/components`
- Any tests that imported `LoadingState`/`ErrorState` from `@/features/users/components` must update their import paths

---

## OPEN QUESTIONS

None. This is a pure code-quality refactoring with no product decisions, no infrastructure changes, and no business logic changes. All design decisions are internal to the codebase and resolved in the ADRs above.

---

## HUMAN REVIEW CHECKLIST

!! DO NOT PROCEED TO PLANNING UNTIL THIS CHECKLIST IS COMPLETE !!

**Architecture:**
- [ ] ADR-001: Agree that `useDashboardData` should move to `features/dashboard/hooks/`?
- [ ] ADR-001: Confirm cross-feature imports (`@/features/tickets`, `@/features/users`) via index files is acceptable inside a feature hook?
- [ ] ADR-002: Agree `onClose` should be optional in the shared `ErrorState`?
- [ ] ADR-003: Agree that feature-scoped `LoadingState`/`ErrorState` in `features/users/components/` should be deleted (not re-exported)?

**Components:**
- [ ] All 18 affected files in `03_c4_components.md` — are any missing?
- [ ] `ticketColumns.tsx` line 38 (`role === 'admin'` — admin only) is intentionally **not** changed to `isStaff`?

**Tests:**
- [ ] `DashboardPage.test.tsx` mock path update is the only required change to existing tests?
- [ ] New shared component tests (`LoadingState.test.tsx`, `ErrorState.test.tsx`) are sufficient?

When approved, run:
`/plan_feature medium-priority-refactoring`
