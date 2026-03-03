# Phase 6: Move useDashboardData

**Layer:** Application + Wiring
**Depends on:** none (independent of Phases 1–5)
**Can be tested in isolation:** Yes — existing tests cover the hook via mock

---

## Goal

Move `useDashboardData` from `src/app/hooks/useDashboardData.ts` to `src/features/dashboard/hooks/useDashboardData.ts`, export it through the dashboard feature barrel, and update the two files that import it (`dashboard-page-contract.tsx`, `DashboardPage.test.tsx`). Delete the original file.

---

## Files to CREATE

### `src/features/dashboard/hooks/useDashboardData.ts`

**Source:** Copy the full implementation from `src/app/hooks/useDashboardData.ts` — no logic changes.
**Purpose:** Hook in its correct feature location.

**CRITICAL — import paths inside the moved hook:**
All imports within the hook body must use feature index paths (CLAUDE.md rule 7: never import through internal paths, only through `features/{name}/index.ts`).

Verify each import in the current `src/app/hooks/useDashboardData.ts`:

| Current import | Required path after move | Check |
|---|---|---|
| `@/features/tickets` functions (`getAIStats`, `getAllTickets`, etc.) | Must come from `@/features/tickets` (index) — verify these are exported in `src/features/tickets/index.ts` |
| `@/features/users` functions (`activityInterval`, `getSupportUsers`, `setUserStatusOnline`) | Must come from `@/features/users` (index) — verify these are exported in `src/features/users/index.ts` |
| `@/features/dashboard/types/dashboard` types | Change to relative `../types/dashboard` since the file is now inside the same feature |
| `@/types` (Ticket type) | Unchanged — shared types |

**Pre-check (run before creating the file):**
```bash
grep -n "^export" src/features/tickets/index.ts | grep -E "getAIStats|getAllTickets|getTicketStatsOfMonth|getTickets|getUserTicketStats"
grep -n "^export" src/features/users/index.ts | grep -E "activityInterval|getSupportUsers|setUserStatusOnline"
```

If any of these are NOT exported through the feature index, they must be added to the respective `index.ts` before the hook is moved. Do not bypass this by importing from internal paths.

---

## Files to MODIFY

### `src/features/dashboard/index.ts`

**Current state (verified):**
```ts
// Hooks
export { useGreeting } from './hooks/useGreeting';
```

**Changes:**
1. **ADD** after the `useGreeting` export line:
   ```ts
   export { useDashboardData } from './hooks/useDashboardData';
   ```

**DO NOT CHANGE:**
- All existing exports (Analytics, components, useGreeting, types)

---

### `src/app/pages/dashboard-page-contract.tsx`

**Current state (verified line 8):**
```ts
import { useDashboardData } from '@/app/hooks/useDashboardData';
```

**Changes:**
1. **REPLACE** line 8:
   ```ts
   // Before:
   import { useDashboardData } from '@/app/hooks/useDashboardData';

   // After:
   import { useDashboardData } from '@/features/dashboard';
   ```

**DO NOT CHANGE:**
- The `DashboardPageContract` interface
- The `defaultDashboardPageContract` object
- The `DashboardPageContractProvider` component
- The `useDashboardPageContract` export

---

### `src/app/pages/DashboardPage.test.tsx`

**Current state (verified lines 6 and 13–15):**
```ts
import { useDashboardData } from '@/app/hooks/useDashboardData';

vi.mock('@/app/hooks/useDashboardData', () => ({
  useDashboardData: vi.fn(),
}));
```

**Changes:**

1. **REPLACE** the import on line 6:
   ```ts
   // Before:
   import { useDashboardData } from '@/app/hooks/useDashboardData';

   // After:
   import { useDashboardData } from '@/features/dashboard';
   ```

2. **REPLACE** the `vi.mock` call on lines 13–15:
   ```ts
   // Before:
   vi.mock('@/app/hooks/useDashboardData', () => ({
     useDashboardData: vi.fn(),
   }));

   // After:
   vi.mock('@/features/dashboard', async () => {
     const actual = await vi.importActual<typeof import('@/features/dashboard')>('@/features/dashboard');
     return {
       ...actual,
       useDashboardData: vi.fn(),
     };
   });
   ```

   **Note:** The test file already has a similar `vi.mock('@/features/dashboard', async () => ...)` pattern on lines 38+. The new mock for `useDashboardData` must be merged into this existing mock rather than creating a duplicate `vi.mock('@/features/dashboard', ...)`. Vitest does not support two separate `vi.mock` calls for the same module path.

   **Merge strategy:** Find the existing `vi.mock('@/features/dashboard', async () => { ... })` block in the test file and add `useDashboardData: vi.fn()` to its returned object alongside the existing mock entries.

**DO NOT CHANGE:**
- Any test case logic, `beforeEach`, `describe`, `it` blocks
- Mock return values for `useDashboardData` set in `beforeEach`

---

## Files to DELETE

### `src/app/hooks/useDashboardData.ts`

**Action:** Delete after confirming:
1. `src/features/dashboard/hooks/useDashboardData.ts` exists and TypeScript compiles without errors
2. `dashboard-page-contract.tsx` import updated
3. `DashboardPage.test.tsx` mock updated
4. `npm run test:run` passes

---

## Tests for This Phase

No new test files. All coverage comes from the existing `DashboardPage.test.tsx`:

| Verification | Command | Expected |
|---|---|---|
| Hook resolves from new path | `npm run type-check` | Zero errors |
| Dashboard contract resolves import | `npm run type-check` | Zero errors |
| Test mock resolves | `npx vitest run src/app/pages/DashboardPage.test.tsx` | All tests pass |
| No import of old path remains | `grep -rn "app/hooks/useDashboardData" src/` | Zero results |
| Full suite passes | `npm run test:run` | No regressions |
| Build passes | `npm run build` | No errors |

---

## Quality Gate

Before marking Phase 6 complete, ALL must pass:

- [ ] `npm run type-check` — zero TypeScript errors
- [ ] `npm run lint -- --max-warnings 0` — zero lint warnings
- [ ] `npm run format:check` — Prettier clean
- [ ] `npx vitest run src/app/pages/DashboardPage.test.tsx` — all existing tests pass
- [ ] `npm run test:run` — full suite passes
- [ ] `npm run build` — production build succeeds
- [ ] `grep -rn "app/hooks/useDashboardData" src/` — zero results
- [ ] `src/app/hooks/useDashboardData.ts` does not exist
- [ ] `src/app/hooks/` directory is empty (or deleted if no other files)

---

## Human Review Checkpoint

Final review before closing the ticket:

- [ ] `useDashboardData` is exported from `src/features/dashboard/index.ts`?
- [ ] `dashboard-page-contract.tsx` imports `useDashboardData` from `@/features/dashboard`?
- [ ] `DashboardPage.test.tsx` has a single `vi.mock('@/features/dashboard', ...)` (not two separate mocks for the same path)?
- [ ] All imports inside `useDashboardData.ts` use feature index paths (no `@/features/tickets/api/...` internal imports)?
- [ ] `src/app/hooks/` is empty or removed?
- [ ] `npm run build` passes without errors?
