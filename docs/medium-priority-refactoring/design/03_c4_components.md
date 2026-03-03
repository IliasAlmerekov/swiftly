# C4 Components — Medium Priority Refactoring

**Date:** 2026-03-03

---

## Component Table

### Shared Layer — Changes

| Component      | Layer        | Type            | Action                         | File Path                                |
| -------------- | ------------ | --------------- | ------------------------------ | ---------------------------------------- |
| `useIsStaff`   | Application  | Custom Hook     | **EXISTING — gains consumers** | `src/shared/hooks/useIsStaff.ts`         |
| `LoadingState` | Presentation | React Component | **NEW**                        | `src/shared/components/LoadingState.tsx` |
| `ErrorState`   | Presentation | React Component | **NEW**                        | `src/shared/components/ErrorState.tsx`   |

### Feature: dashboard

| Component            | Layer       | Type                | Action                                     | File Path                                          |
| -------------------- | ----------- | ------------------- | ------------------------------------------ | -------------------------------------------------- |
| `useDashboardData`   | Application | TanStack Query Hook | **NEW** (moved from `app/hooks/`)          | `src/features/dashboard/hooks/useDashboardData.ts` |
| `dashboard/index.ts` | —           | Feature Barrel      | **MODIFY** — add `useDashboardData` export | `src/features/dashboard/index.ts`                  |

### Feature: tickets

| Component          | Layer        | Type           | Action                                                                                                        | File Path                                         |
| ------------------ | ------------ | -------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `CreateTicket`     | Presentation | Page Component | **MODIFY** — replace inline `isStaff` with `useIsStaff()`                                                     | `src/features/tickets/pages/CreateTicket.tsx`     |
| `Tickets`          | Presentation | Page Component | **MODIFY** — replace inline `isStaff` with `useIsStaff()`                                                     | `src/features/tickets/pages/Tickets.tsx`          |
| `TicketDetailPage` | Presentation | Page Component | **MODIFY** — replace inline `isStaff`; remove inline `LoadingState`/`ErrorState`; import from shared          | `src/features/tickets/pages/TicketDetailPage.tsx` |
| `ticketColumns`    | Presentation | Column Config  | **MODIFY** — replace `role === 'admin' \|\| role === 'support1'` with `STAFF_ROLES.includes(role)` on line 76 | `src/features/tickets/config/ticketColumns.tsx`   |

### Feature: users

| Component                       | Layer        | Type            | Action                                                                   | File Path                                                      |
| ------------------------------- | ------------ | --------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `PersonalInformationSection`    | Presentation | React Component | **MODIFY** — replace inline `isStaff` with `useIsStaff()`                | `src/features/users/components/PersonalInformationSection.tsx` |
| `LoadingState` (feature-scoped) | Presentation | React Component | **DELETE** — replaced by shared version                                  | `src/features/users/components/LoadingState.tsx`               |
| `ErrorState` (feature-scoped)   | Presentation | React Component | **DELETE** — replaced by shared version                                  | `src/features/users/components/ErrorState.tsx`                 |
| `users/components/index.ts`     | —            | Feature Barrel  | **MODIFY** — remove `LoadingState`/`ErrorState` exports                  | `src/features/users/components/index.ts`                       |
| `UserProfile`                   | Presentation | Page Component  | **MODIFY** — update import from `../components` to `@/shared/components` | `src/features/users/pages/UserProfile.tsx`                     |

### App Layer — Changes

| Component                      | Layer        | Type           | Action                                                                                        | File Path                                   |
| ------------------------------ | ------------ | -------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `DashboardPage`                | Presentation | Page Component | **MODIFY** — replace inline `isStaff` with `useIsStaff()`                                     | `src/app/pages/DashboardPage.tsx`           |
| `dashboard-page-contract.tsx`  | Application  | DI / Contract  | **MODIFY** — update import path from `@/app/hooks/useDashboardData` to `@/features/dashboard` | `src/app/pages/dashboard-page-contract.tsx` |
| `DashboardPage.test.tsx`       | —            | Test File      | **MODIFY** — update `vi.mock` path to `@/features/dashboard`                                  | `src/app/pages/DashboardPage.test.tsx`      |
| `useDashboardData` (app/hooks) | Application  | Custom Hook    | **DELETE** — source file after move                                                           | `src/app/hooks/useDashboardData.ts`         |

---

## Layer Definitions (this project)

| Layer          | Contents                                                             |
| -------------- | -------------------------------------------------------------------- |
| Domain         | TypeScript types, Zod schemas (zero framework imports)               |
| Application    | TanStack Query hooks (`useQuery`, `useMutation`), custom logic hooks |
| Infrastructure | API fetch functions (`features/{name}/api/`), MSW handlers           |
| Presentation   | React components, page components                                    |

---

## Dependency Flow (after refactoring)

```
AuthContext
  └─▶ useAuth()
        └─▶ useIsStaff()              ← shared/hooks
              └─▶ DashboardPage        ← replaces inline
              └─▶ CreateTicket         ← replaces inline
              └─▶ Tickets              ← replaces inline
              └─▶ TicketDetailPage     ← replaces inline (uses useAuthContext currently)
              └─▶ PersonalInformationSection ← replaces inline

shared/components/LoadingState        ← NEW
  └─▶ UserProfile (was: users/components/LoadingState)
  └─▶ TicketDetailPage (was: inline)

shared/components/ErrorState          ← NEW
  └─▶ UserProfile (was: users/components/ErrorState)
  └─▶ TicketDetailPage (was: inline)

features/dashboard/hooks/useDashboardData  ← MOVED from app/hooks/
  └─▶ dashboard-page-contract.tsx (updated import)
```

---

## ticketColumns.tsx Special Case

`ticketColumns.tsx` receives `role` as a **render function parameter** — hooks cannot be called inside render functions. The isStaff duplication on line 76 (`role === 'admin' || role === 'support1'`) is replaced with `STAFF_ROLES.includes(role)` using the existing constant from `src/shared/security/access-matrix.ts`.

Line 38 (`role === 'admin' && !!ownerId`) is **admin-only**, not staff — this is intentional and left unchanged.
