# Phase 2: TicketDetailPage Full Migration

**Layer:** Presentation
**Depends on:** Phase 1 (shared LoadingState and ErrorState must exist)
**Can be tested in isolation:** Yes — existing page, changes are replacements only

---

## Goal

Perform all changes to `TicketDetailPage.tsx` in a single pass: remove the two inline component definitions, import from shared, and replace the inline `isStaff` computation with `useIsStaff()`.

---

## Files to MODIFY

### `src/features/tickets/pages/TicketDetailPage.tsx`

**Confirmed at:** research doc, lines 1–70 read in full
**Current state (verified):**

- Lines 23–28: inline `LoadingState` component defined (no props, static text)
- Lines 30–35: inline `ErrorState` component defined (`{ message: string }`, no onClose)
- Line 4: `import { useAuthContext } from '@/shared/context/AuthContext'`
- Lines 41–53: builds `currentUser` object from `useAuthContext().user`
- Line 55: `const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'support1'`

**Changes:**

1. **REMOVE** the inline `LoadingState` component (lines 23–28):

   ```
   // ============ Loading Component ============
   const LoadingState = () => (...)
   ```

2. **REMOVE** the inline `ErrorState` component (lines 30–35):

   ```
   // ============ Error Component ============
   const ErrorState = ({ message }: { message: string }) => (...)
   ```

3. **ADD import** at the top of the file:

   ```
   import { LoadingState, ErrorState } from '@/shared/components';
   ```

4. **REMOVE** line 55:

   ```
   const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'support1';
   ```

5. **ADD** after the `useAuthContext()` block (before the queries section):

   ```
   const { isStaff } = useIsStaff();
   ```

6. **ADD import** for `useIsStaff`:
   ```
   import { useIsStaff } from '@/shared/hooks/useIsStaff';
   ```

**DO NOT CHANGE:**

- `import { useAuthContext } from '@/shared/context/AuthContext'` — still needed for `currentUser` object (used for form defaults, admin users query, etc.)
- `const currentUser = user ? { _id, email, role, name } : null` — still needed
- All usages of `isStaff` as a variable after line 55 (they remain valid, value now comes from hook)
- All usages of `LoadingState` and `ErrorState` as JSX (component names unchanged — shared components use same names)
- All query hooks, mutation hooks, handler functions

---

## Tests for This Phase

No new test file needed. Verify via type-check and existing tests that:

| Verification                                    | Method                                                           | Expected           |
| ----------------------------------------------- | ---------------------------------------------------------------- | ------------------ |
| TypeScript resolves `LoadingState` from shared  | `npm run type-check`                                             | No error on import |
| TypeScript resolves `ErrorState` from shared    | `npm run type-check`                                             | No error on import |
| `useIsStaff` import resolves                    | `npm run type-check`                                             | No error on import |
| `isStaff` usage sites after removal still valid | `npm run type-check`                                             | No type errors     |
| No stale inline component defs remain           | Manual grep: `grep -n "const LoadingState" TicketDetailPage.tsx` | Zero results       |
| Full test suite passes                          | `npm run test:run`                                               | No regressions     |

---

## Quality Gate

Before marking Phase 2 complete, ALL must pass:

- [ ] `npm run type-check` — zero TypeScript errors
- [ ] `npm run lint -- --max-warnings 0` — zero lint warnings
- [ ] `npm run format:check` — Prettier clean
- [ ] `npm run test:run` — full suite passes (no regressions)
- [ ] `grep -n "const LoadingState" src/features/tickets/pages/TicketDetailPage.tsx` — zero results
- [ ] `grep -n "const ErrorState" src/features/tickets/pages/TicketDetailPage.tsx` — zero results
- [ ] `grep -n "role === 'admin' || role === 'support1'" src/features/tickets/pages/TicketDetailPage.tsx` — zero results

---

## Human Review Checkpoint

Before proceeding to Phase 3, check:

- [ ] `TicketDetailPage` still has `import { useAuthContext }` (not removed)?
- [ ] `currentUser` object is still constructed from `useAuthContext().user`?
- [ ] `isStaff` variable name unchanged (all downstream prop passes `isStaff={isStaff}` still valid)?
- [ ] Shared `ErrorState` renders without close button when `onClose` is not passed (matches original inline behaviour)?
