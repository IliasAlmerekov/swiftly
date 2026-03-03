# Phase 3: isStaff Consolidation — Remaining Pages

**Layer:** Presentation
**Depends on:** Phase 1 (none strictly required, but run after to keep phases coherent)
**Can be tested in isolation:** Yes

---

## Goal

Replace inline `isStaff` computations in four remaining files with calls to the already-existing `useIsStaff()` hook. `TicketDetailPage.tsx` was handled in Phase 2. This phase covers: `DashboardPage.tsx`, `CreateTicket.tsx`, `Tickets.tsx`, `PersonalInformationSection.tsx`.

---

## Files to MODIFY

### `src/app/pages/DashboardPage.tsx`

**Current state (verified lines 1–108):**

- Line 26: `const { role, userName } = useAuthHook();` — `role` is also passed to `DashboardTabContent` on line 93
- Line 31: `const isStaff = role === 'admin' || role === 'support1';`

**Changes:**

1. **REMOVE** line 31 only:

   ```
   const isStaff = role === 'admin' || role === 'support1';
   ```

2. **ADD** on the line immediately after `const { role, userName } = useAuthHook();`:

   ```
   const { isStaff } = useIsStaff();
   ```

3. **ADD import** (alongside existing imports at top of file):
   ```
   import { useIsStaff } from '@/shared/hooks/useIsStaff';
   ```

**DO NOT CHANGE:**

- `const { role, userName } = useAuthHook();` — `role` is still needed: passed to `DashboardTabContent` as `role={role}` (line 93) and `userName` is passed as `userName={userName ?? ''}`
- All references to `isStaff` in JSX remain valid (variable name unchanged)
- The contract pattern (`useDashboardPageContract`) — untouched

---

### `src/features/tickets/pages/CreateTicket.tsx`

**Current state (verified lines 1–35):**

- Line 2: `import { useAuth } from '@/shared/hooks/useAuth'`
- Line 20: `const { role } = useAuth();`
- Line 21: `const isStaff = role === 'admin' || role === 'support1';`
- Line 22: `const isRoleReady = role !== undefined && role !== null;`
- Lines 24–35: `useCreateTicketForm({ isStaff, isRoleReady })` — consumes both values

**Changes:**

1. **REMOVE** lines 20–22:

   ```
   const { role } = useAuth();
   const isStaff = role === 'admin' || role === 'support1';
   const isRoleReady = role !== undefined && role !== null;
   ```

2. **ADD** replacement:

   ```
   const { isStaff, isRoleReady } = useIsStaff();
   ```

3. **REPLACE** import (or add alongside):
   - Remove: `import { useAuth } from '@/shared/hooks/useAuth';`
   - Add: `import { useIsStaff } from '@/shared/hooks/useIsStaff';`

   **Verify first:** confirm `useAuth` is NOT used anywhere else in `CreateTicket.tsx` before removing its import. If it is, keep the import and only swap the isStaff/isRoleReady lines.

**DO NOT CHANGE:**

- `useCreateTicketForm({ isStaff, isRoleReady })` — call signature unchanged
- All JSX using `isStaff` — unchanged

---

### `src/features/tickets/pages/Tickets.tsx`

**Current state (verified lines 117–131):**

- Line 17: `import { useAuth } from '@/shared/hooks/useAuth'`
- Line 119: `const { role } = useAuth();`
- Line 120: `const isStaff = role === 'admin' || role === 'support1';`
- Line 131: `useTicketFilters({ isStaff })` — only `isStaff` passed, not `role`

**Changes:**

1. **REMOVE** lines 119–120:

   ```
   const { role } = useAuth();
   const isStaff = role === 'admin' || role === 'support1';
   ```

2. **ADD** replacement:

   ```
   const { isStaff } = useIsStaff();
   ```

3. **REPLACE** import:
   - Remove: `import { useAuth } from '@/shared/hooks/useAuth';`
   - Add: `import { useIsStaff } from '@/shared/hooks/useIsStaff';`

   **Verify first:** scan `Tickets.tsx` for any other usage of `role` or `useAuth` beyond lines 119–120. If `role` is used elsewhere (e.g. passed as column prop), keep `useAuth` and only remove the `isStaff` inline computation.

**DO NOT CHANGE:**

- `useTicketFilters({ isStaff })` — call signature unchanged
- All other hooks and state in the component

---

### `src/features/users/components/PersonalInformationSection.tsx`

**Current state (verified line 56):**

- Line 56: `const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'support1';`
- `currentUser` arrives as a prop (not from a hook)

**Changes:**

1. **REMOVE** line 56:

   ```
   const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'support1';
   ```

2. **ADD** replacement (near other hook calls at the top of the function body):

   ```
   const { isStaff } = useIsStaff();
   ```

3. **ADD import**:
   ```
   import { useIsStaff } from '@/shared/hooks/useIsStaff';
   ```

**DO NOT CHANGE:**

- `currentUser` prop and all its other usages (form default values, display fields, etc.)
- All references to `isStaff` in JSX remain valid

---

## Tests for This Phase

No new test files. Verify via type-check and test suite:

| Verification                             | Method                                                                                    | Expected       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- | -------------- |
| No inline isStaff in DashboardPage       | `grep -n "role === 'admin'" src/app/pages/DashboardPage.tsx`                              | Zero results   |
| No inline isStaff in CreateTicket        | `grep -n "role === 'admin'" src/features/tickets/pages/CreateTicket.tsx`                  | Zero results   |
| No inline isStaff in Tickets             | `grep -n "role === 'admin'" src/features/tickets/pages/Tickets.tsx`                       | Zero results   |
| No inline isStaff in PersonalInfoSection | `grep -n "role === 'admin'" src/features/users/components/PersonalInformationSection.tsx` | Zero results   |
| Full type check                          | `npm run type-check`                                                                      | Zero errors    |
| Full test suite                          | `npm run test:run`                                                                        | No regressions |

---

## Quality Gate

Before marking Phase 3 complete, ALL must pass:

- [ ] `npm run type-check` — zero TypeScript errors
- [ ] `npm run lint -- --max-warnings 0` — zero lint warnings
- [ ] `npm run format:check` — Prettier clean
- [ ] `npm run test:run` — full suite passes (no regressions)
- [ ] Zero occurrences of `role === 'admin' || role === 'support1'` in the 4 modified files (verify with grep)

---

## Human Review Checkpoint

Before proceeding to Phase 4, check:

- [ ] `DashboardPage.tsx` still passes `role={role}` to `DashboardTabContent` (role from `useAuthHook()` is unchanged)?
- [ ] `CreateTicket.tsx` still passes both `isStaff` and `isRoleReady` to `useCreateTicketForm`?
- [ ] `Tickets.tsx`: was `role` used beyond the isStaff computation? If yes, confirm `useAuth` import was kept?
- [ ] `PersonalInformationSection.tsx`: `currentUser` prop is still present and used for all form fields?
