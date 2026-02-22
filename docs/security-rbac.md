# Security RBAC/PBAC Matrix

Date: 2026-02-22

## Model

- `RBAC`: base permission by role (`user`, `support1`, `admin`).
- `PBAC`: contextual condition on top of role checks (for example, own-profile access by `user`).
- Source of truth in code: `src/shared/security/access-matrix.ts`.

## Matrix

| Access Key                         | Scope     | Allowed Roles               | PBAC Condition                                          | Enforced In                                                                                                        |
| ---------------------------------- | --------- | --------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `route.dashboard`                  | Route     | `user`, `support1`, `admin` | none                                                    | `src/app/router.tsx`, `src/shared/components/auth/ProtectedRoute.tsx`                                              |
| `route.ticketDetail`               | Route     | `user`, `support1`, `admin` | none                                                    | `src/app/router.tsx`, `src/shared/components/auth/ProtectedRoute.tsx`                                              |
| `route.userProfile`                | Route     | `user`, `support1`, `admin` | none                                                    | `src/app/router.tsx`, `src/shared/components/auth/ProtectedRoute.tsx`                                              |
| `route.userById`                   | Route     | `user`, `support1`, `admin` | if role=`user`, `actorUserId` must equal `targetUserId` | `src/app/router.tsx`, `src/shared/components/auth/ProtectedRoute.tsx`                                              |
| `component.dashboard.adminTab`     | Component | `admin`                     | none                                                    | `src/features/dashboard/components/DashboardTabContent.tsx`, `src/shared/components/auth/AccessGuard.tsx`          |
| `component.dashboard.analyticsTab` | Component | `support1`, `admin`         | none                                                    | `src/features/dashboard/components/DashboardTabContent.tsx`, `src/shared/components/auth/AccessGuard.tsx`          |
| `component.users.profileEdit`      | Component | `admin`                     | none                                                    | `src/features/users/hooks/components/PersonalInformationSection.tsx`, `src/shared/components/auth/AccessGuard.tsx` |

## Guard Wiring

1. `ProtectedRoute` is the route-level gate and now validates access only through matrix keys.
2. `AccessGuard` is the component-level gate and validates access through the same matrix.
3. `route.userById` uses PBAC with route param context (`/users/:userId`) and current actor id.

## Notes

- Any new protected route or privileged UI control must add a new `AccessKey` and matrix rule first.
- Do not add ad-hoc role checks when a matrix key can be reused.
