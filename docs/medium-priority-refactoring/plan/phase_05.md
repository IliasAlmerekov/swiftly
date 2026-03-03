# Phase 5: ticketColumns STAFF_ROLES

**Layer:** Presentation
**Depends on:** none
**Can be tested in isolation:** Yes

---

## Goal

Replace the inline staff role check on line 76 of `ticketColumns.tsx` with `STAFF_ROLES.includes(role)`, importing `STAFF_ROLES` from `src/shared/security/access-matrix.ts`. Line 38 (admin-only check) is intentionally left unchanged.

---

## Files to MODIFY

### `src/features/tickets/config/ticketColumns.tsx`

**Current state (verified lines 1–85):**

- Line 1: `import { Badge } from '@/shared/components/ui/badge';`
- Line 3: `import { UserCell } from '../components/UserCell';`
- Line 38: `const isClickable = role === 'admin' && !!ownerId;` ← **admin-only, DO NOT TOUCH**
- Line 76: `const isClickable = (role === 'admin' || role === 'support1') && !!assigneeId;` ← **target**

**Changes:**

1. **ADD import** at the top of the file:

   ```ts
   import { STAFF_ROLES } from '@/shared/security/access-matrix';
   ```

   **Verify first:** confirm `STAFF_ROLES` is exported from `access-matrix.ts`. The research doc confirms it is defined there as `const STAFF_ROLES: UserRole[] = ['support1', 'admin']`. Check whether it has an explicit `export` keyword — if not, it may need to be exported first. Run:

   ```
   grep -n "STAFF_ROLES" src/shared/security/access-matrix.ts
   ```

2. **REPLACE** line 76 only:

   ```ts
   // Before:
   const isClickable = (role === 'admin' || role === 'support1') && !!assigneeId;

   // After:
   const isClickable = STAFF_ROLES.includes(role) && !!assigneeId;
   ```

**DO NOT CHANGE:**

- Line 38: `const isClickable = role === 'admin' && !!ownerId;` — this is an **admin-only** check, not a staff check. `STAFF_ROLES.includes` would incorrectly include `support1` for the owner cell. Leave as-is.
- All other column definitions
- The `role` parameter in render functions — unchanged

---

## Tests for This Phase

No new test file needed for this single-line change. Verify:

| Verification                            | Command                                                                       | Expected                   |
| --------------------------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| Line 76 no longer contains inline check | `grep -n "role === 'support1'" src/features/tickets/config/ticketColumns.tsx` | Zero results               |
| Line 38 still has admin-only check      | `grep -n "role === 'admin'" src/features/tickets/config/ticketColumns.tsx`    | Exactly 1 result (line 38) |
| STAFF_ROLES import resolves             | `npm run type-check`                                                          | Zero TypeScript errors     |
| Tickets page still renders              | `npm run test:run`                                                            | No regressions             |

---

## Quality Gate

Before marking Phase 5 complete, ALL must pass:

- [ ] `npm run type-check` — zero TypeScript errors
- [ ] `npm run lint -- --max-warnings 0` — zero lint warnings
- [ ] `npm run format:check` — Prettier clean
- [ ] `npm run test:run` — full suite passes (no regressions)
- [ ] `grep -n "role === 'support1'" src/features/tickets/config/ticketColumns.tsx` → zero results
- [ ] `grep -n "role === 'admin'" src/features/tickets/config/ticketColumns.tsx` → exactly 1 result (the admin-only check on line 38 unchanged)

---

## Human Review Checkpoint

Before proceeding to Phase 6, check:

- [ ] `STAFF_ROLES` was confirmed as exported from `access-matrix.ts` (not just defined)?
- [ ] Line 38 (owner cell, admin-only) is untouched?
- [ ] `role` parameter type in the render function is compatible with `STAFF_ROLES.includes(role)` (i.e. `role` is typed as `UserRole`)?
