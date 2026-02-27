# Codebase Current State Facts (swiflty-helpdesk)

Code snapshot date: 2026-02-27.

Directory name fact: this workspace contains `swiflty-helpdesk` (exact spelling).

## 1. Stack and dependencies

- React + TypeScript + Vite: [package.json](../package.json#L5), [package.json](../package.json#L117), [package.json](../package.json#L119).
- UI stack: Tailwind 4 + Radix + shadcn dependencies ([package.json](../package.json#L45), [package.json](../package.json#L59)).
- Data/router stack: React Query + React Router ([package.json](../package.json#L60), [package.json](../package.json#L74)).
- Test stack: Vitest + Testing Library + Playwright + MSW ([package.json](../package.json#L87), [package.json](../package.json#L108), [package.json](../package.json#L120)).
- LockfileVersion = 3 ([package-lock.json](../package-lock.json#L4)).

## 2. Entry points and startup

- HTML entry + mount point: [index.html](../index.html#L27).
- React entry: [src/main.tsx](../src/main.tsx#L7).
- Top-level composition: `AppProvider` + `AppRouter`: [src/app/index.tsx](../src/app/index.tsx#L15).
- Run/build/test scripts: [package.json](../package.json#L7), [package.json](../package.json#L16), [package.json](../package.json#L25).
- Docker compose profiles/services: [docker-compose.yml](../docker-compose.yml#L16), [docker-compose.yml](../docker-compose.yml#L46).

## 3. Modules and responsibilities

- Layering rule `shared -> features -> app`: [docs/ARCHITECTURE.md](./ARCHITECTURE.md#L20).
- App layer providers/router: [src/app/provider.tsx](../src/app/provider.tsx#L47), [src/app/router.tsx](../src/app/router.tsx#L29).
- Features public API: [src/features/auth/index.ts](../src/features/auth/index.ts#L5), [src/features/tickets/index.ts](../src/features/tickets/index.ts#L5), [src/features/users/index.ts](../src/features/users/index.ts#L5), [src/features/dashboard/index.ts](../src/features/dashboard/index.ts#L5).
- Shared layer (api/auth guards/ui): [src/shared/api/client.ts](../src/shared/api/client.ts#L140), [src/shared/context/AuthContext.tsx](../src/shared/context/AuthContext.tsx#L36), [src/shared/components/auth/ProtectedRoute.tsx](../src/shared/components/auth/ProtectedRoute.tsx#L19).

## 4. UI, routing, pages

- Routes: `/`, `/login`, `/register`, `/dashboard`, `/tickets/:ticketId`, `/users/:userId`, `/user-profile`: [src/app/router.tsx](../src/app/router.tsx#L36).
- Dashboard tabs via `tab` query (`dashboard`, `tickets`, `createTicket`, `analytics`): [src/app/pages/DashboardPage.tsx](../src/app/pages/DashboardPage.tsx#L30), [src/app/pages/DashboardPage.tsx](../src/app/pages/DashboardPage.tsx#L82).
- Layout (sidebar/header/content): [src/shared/components/layout/AppLayout.tsx](../src/shared/components/layout/AppLayout.tsx#L52).
- Sidebar depends on role `user/support1/admin`: [src/shared/components/layout/Sidebar.tsx](../src/shared/components/layout/Sidebar.tsx#L21).

## 5. API clients and backend interaction

- Base HTTP client: timeout, error normalization, `fetch` with `credentials: 'include'`: [src/shared/api/client.ts](../src/shared/api/client.ts#L165), [src/shared/api/client.ts](../src/shared/api/client.ts#L171), [src/shared/api/client.ts](../src/shared/api/client.ts#L190).
- 401 handling (`onUnauthorized` redirect to `/login`): [src/shared/api/client.ts](../src/shared/api/client.ts#L288).
- Contract validation with zod: [src/shared/api/contracts.ts](../src/shared/api/contracts.ts#L363).
- Auth API module: [src/features/auth/api/index.ts](../src/features/auth/api/index.ts#L16).
- Tickets API module: [src/features/tickets/api/index.ts](../src/features/tickets/api/index.ts#L87).
- AI API module: [src/features/tickets/api/ai.ts](../src/features/tickets/api/ai.ts#L17).
- Users API module: [src/features/users/api/index.ts](../src/features/users/api/index.ts#L16).

## 6. State and hooks

- React Query `QueryClientProvider` in root provider: [src/app/provider.tsx](../src/app/provider.tsx#L54).
- AuthContext stores `user/isAuthenticated/isLoading` and `login/logout`: [src/shared/context/AuthContext.tsx](../src/shared/context/AuthContext.tsx#L16), [src/shared/context/AuthContext.tsx](../src/shared/context/AuthContext.tsx#L104).
- Ticket/user hooks with query keys and invalidation: [src/features/tickets/hooks/useTickets.ts](../src/features/tickets/hooks/useTickets.ts#L19), [src/features/users/hooks/useUsers.ts](../src/features/users/hooks/useUsers.ts#L17).
- Filters/pagination hooks: [src/features/tickets/hooks/useTicketFilters.ts](../src/features/tickets/hooks/useTicketFilters.ts#L79), [src/shared/hooks/usePagination.ts](../src/shared/hooks/usePagination.ts#L38).

## 7. Config and environment

- Env schema with zod; `VITE_API_URL` optional but required in production; fallback URL: [src/config/env.ts](../src/config/env.ts#L5), [src/config/env.ts](../src/config/env.ts#L67).
- `.env.example` includes `VITE_API_URL`: [.env.example](../.env.example#L2).
- Vite alias/proxy/test config: [vite.config.ts](../vite.config.ts#L23), [vite.config.ts](../vite.config.ts#L39), [vite.config.ts](../vite.config.ts#L64).
- Playwright config (`testDir`, `baseURL`, `webServer`): [playwright.config.ts](../playwright.config.ts#L8), [playwright.config.ts](../playwright.config.ts#L29).

## 8. Auth and permissions

- Route guard `ProtectedRoute` checks `isAuthenticated` and `canAccess(...)`: [src/shared/components/auth/ProtectedRoute.tsx](../src/shared/components/auth/ProtectedRoute.tsx#L20).
- Access matrix (RBAC/PBAC): [src/shared/security/access-matrix.ts](../src/shared/security/access-matrix.ts#L3).
- Component guard `AccessGuard`: [src/shared/components/auth/AccessGuard.tsx](../src/shared/components/auth/AccessGuard.tsx#L13).
- AuthProvider loads profile `/users/profile`; `login(token)` decodes JWT in memory; `getToken()` returns `null`: [src/shared/context/AuthContext.tsx](../src/shared/context/AuthContext.tsx#L56), [src/shared/context/AuthContext.tsx](../src/shared/context/AuthContext.tsx#L80), [src/shared/context/AuthContext.tsx](../src/shared/context/AuthContext.tsx#L100).

## 9. Tests

- Vitest config (`jsdom`, setup, coverage): [vite.config.ts](../vite.config.ts#L64).
- Test setup: MSW server + reset handlers/db: [src/test/setup.ts](../src/test/setup.ts#L5).
- Playwright E2E config: [playwright.config.ts](../playwright.config.ts#L8).
- E2E scenarios (smoke/negative/navigation): [e2e/critical-flows.smoke.spec.ts](../e2e/critical-flows.smoke.spec.ts#L10), [e2e/critical-flows.negative.spec.ts](../e2e/critical-flows.negative.spec.ts#L10), [e2e/navigation.spec.ts](../e2e/navigation.spec.ts#L9).
- E2E mock API: [e2e/support/mock-api.ts](../e2e/support/mock-api.ts#L154).
