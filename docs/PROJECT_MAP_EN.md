# PROJECT MAP — Swiftly Helpdesk Frontend (English)

> This document is the first entry point for anyone working on the project.
> Goal: quickly locate the right file and understand how a feature is organized.
>
> Update whenever folder structure or architectural decisions change.

---

## Table of Contents

1. [Tech stack](#1-tech-stack)
2. [Directory structure](#2-directory-structure)
3. [Layers and import rules](#3-layers-and-import-rules)
4. [Entry point and bootstrapping](#4-entry-point-and-bootstrapping)
5. [Routes and pages](#5-routes-and-pages)
6. [Features (features/)](#6-features)
7. [Shared layer](#7-shared-layer)
8. [Authentication & access control](#8-authentication--access-control)
9. [API layer](#9-api-layer)
10. [State management](#10-state-management)
11. [Tests](#11-tests)
12. [Where to find X?](#12-where-to-find-x)
13. [Adding a new feature](#13-adding-a-new-feature)
14. [Known structural issues](#14-known-structural-issues)

---

## 1. Tech stack

| Layer         | Technology                            |
| ------------- | ------------------------------------- |
| Framework     | React 19 + TypeScript                 |
| Build tool    | Vite 7                                |
| Routing       | React Router DOM v7                   |
| Server state  | TanStack React Query v5               |
| Forms         | React Hook Form + Zod                 |
| UI components | shadcn/ui (Radix UI + Tailwind 4)     |
| Icons         | Lucide React, Tabler Icons            |
| HTTP client   | Native `fetch` wrapped as `apiClient` |
| Unit tests    | Vitest + Testing Library + MSW        |
| E2E tests     | Playwright                            |
| Linting       | ESLint + Prettier + Stylelint         |
| Git hooks     | Husky + lint-staged + commitlint      |

---

## 2. Directory structure

```
src/
├── app/                    # App root: router, providers, app-level pages
│   ├── index.tsx           # Root <App> = <AppProvider> + <AppRouter>
│   ├── provider.tsx        # AppProvider: QueryClient, AuthProvider, ThemeProvider
│   ├── router.tsx          # All application routes
│   ├── hooks/
│   │   └── useDashboardData.ts  # Aggregator hook for dashboard data
│   └── pages/
│       ├── DashboardPage.tsx          # Dashboard page (lazy loaded)
│       ├── dashboard-page-contract.tsx # DI contract for testing DashboardPage
│       ├── NotFoundPage.tsx
│       └── DashboardPage.test.tsx
│
├── features/               # Business features. Each feature is a self-contained module
│   ├── auth/               # Authentication
│   ├── dashboard/          # Dashboard and analytics
│   ├── tickets/            # Tickets (main feature)
│   └── users/              # Profiles and user management
│
├── shared/                 # Reusable, feature-agnostic code
│   ├── api/                # HTTP client, API modules, Zod contracts
│   ├── components/         # Shared components
│   ├── context/            # React contexts (AuthContext)
│   ├── hooks/              # Common hooks (useAuth, useIsStaff, usePagination, ...)
│   ├── lib/                # Utilities, helpers, observability
│   ├── security/           # RBAC: access-matrix.ts, canAccess()
│   └── types/              # (empty — types live in src/types/)
│
├── components/             # ⚠️ LEGACY: contains LiquidEther.tsx (should be in shared)
├── config/                 # env.ts, paths.ts
├── provider/               # theme-provider.tsx
├── types/                  # Global types (index.ts, api-error.ts, api.ts)
└── test/                   # MSW mocks, test utilities, setup
```

---

## 3. Layers and import rules

Dependencies flow **only one way**:

```
shared  ──►  features  ──►  app
```

| From          | To shared | To other features | To app |
| ------------- | --------- | ----------------- | ------ |
| `shared/`     | ✅        | ❌ forbidden      | ❌     |
| `features/X/` | ✅        | ❌ other features | ❌     |
| `app/`        | ✅        | ✅                | ✅     |

**Features must be imported via their public `index.ts` only:**

```ts
// ✅ Correct
import { Tickets } from '@/features/tickets';

// ❌ Incorrect – direct path into the feature internals
import { Tickets } from '@/features/tickets/pages/Tickets';
```

---

## 4. Entry point and bootstrapping

```
index.html
  └── src/main.tsx
        └── <App>                        (src/app/index.tsx)
              ├── <AppProvider>           (src/app/provider.tsx)
              │     ├── ErrorBoundary
              │     ├── QueryClientProvider  — staleTime 5min, retry 1
              │     ├── AuthProvider         — cookie-session auth
              │     └── ThemeProvider        — dark/light
              └── <AppRouter>             (src/app/router.tsx)
```

> **Provider initialization order matters** – see the comment in `provider.tsx`.

---

## 5. Routes and pages

All paths live in `src/config/paths.ts`. Never hard‑code URL strings.

| URL                            | Page / Component             | Access          |
| ------------------------------ | ---------------------------- | --------------- |
| `/`                            | → redirect to `/login`       | public          |
| `/login`                       | `LoginPage`                  | public          |
| `/register`                    | `RegisterPage`               | public          |
| `/dashboard`                   | `DashboardPage`              | all roles       |
| `/dashboard?tab=tickets`       | → “Tickets” tab              | all roles       |
| `/dashboard?tab=create-ticket` | → “Create ticket” tab        | all roles       |
| `/dashboard?tab=analytics`     | → “Analytics” tab            | admin, support1 |
| `/tickets/:ticketId`           | `TicketDetailPage`           | all roles       |
| `/users/:userId`               | `UserProfile` (other user)   | admin, support1 |
| `/user-profile`                | `UserProfile` (current user) | all roles       |
| `*`                            | `NotFoundPage`               | —               |

**Route protection**: `<ProtectedRoute access="route.X">` checks auth + RBAC via `access-matrix.ts`.

### Dashboard tabs

Dashboard (`/dashboard`) is **one page** with four tabs controlled by the `?tab=` query param.
Rendering is done by `DashboardTabContent` from `features/dashboard`.

---

## 6. Features

### `features/auth/`

Handles: login form, registration, logout.

```
auth/
├── api/          → loginWithSession, registerWithSession, logoutCurrentSession
├── components/   → LoginForm.tsx, RegisterForm.tsx, AuthBackground.tsx
├── hooks/        → useLogin.tsx, useRegister.tsx, useAuth.ts (query hooks)
├── pages/        → LoginPage.tsx, RegisterPage.tsx
└── index.ts      → public API of the feature
```

> **Note**: `AuthProvider` and `useAuth` are **not** part of `features/auth`; they live
> in `shared/context/AuthContext` and `shared/hooks/useAuth`. The session is initialized on
> mount in `AuthProvider` via GET `/users/profile`.

---

### `features/tickets/`

The main feature. Covers listing tickets, creation, details, comments, attachments,
AI overlay.

```
tickets/
├── api/
│   ├── index.ts    → all CRUD operations (getTickets, createTicket, updateTicket, ...)
│   └── ai.ts       → AI chat API (sendAiMessage, getAiStats)
├── components/
│   ├── TicketTable.tsx, TicketRow.tsx, TicketStats.tsx, TicketSearchBar.tsx
│   ├── CreateTicketForm.tsx
│   ├── ai-overlay/   → AiOverlay + chat (useAiChat, ChatMessage, ...)
│   └── ticket-detail/ → ticket detail page components
│       ├── ticket-header.tsx
│       ├── ticket-details-card.tsx
│       ├── ticket-description-card.tsx
│       ├── ticket-comments.tsx + comment-form.tsx
│       ├── ticket-attachments-card.tsx
│       ├── ticket-workflow-card.tsx   ← assignment, status, priority
│       ├── ticket-requester-card.tsx
│       └── ticket-edit-form.tsx
├── config/
│   └── ticketColumns.tsx  → table columns config (TICKET_COLUMNS)
├── constants/
│   └── ticketTable.ts     → column type definitions
├── hooks/
│   ├── useTickets.ts      → React Query hooks (useTicket, useCreateTicket, ...)
│   ├── useTicketFilters.ts → URL param filters (staff tabs, date ranges)
│   └── useCreateTicketForm.ts
├── pages/
│   ├── Tickets.tsx        → paginated ticket list
│   ├── CreateTicket.tsx   → creation form
│   └── TicketDetailPage.tsx
├── utils/
│   └── ticketUtils.ts     → normalizeCategoryValue and others
└── index.ts
```

**Key query keys** (`ticketKeys` in `useTickets.ts`):

```ts
ticketKeys.list({ scope: 'mine' }); // current user tickets
ticketKeys.list({ scope: 'all' }); // all tickets (admin/support)
ticketKeys.detail(ticketId); // specific ticket
```

---

### `features/dashboard/`

Covers metric cards, charts, support status, analytics.

```
dashboards/
├── components/
│   ├── DashboardContent.tsx    → component with all metrics
│   ├── DashboardTabContent.tsx → renders tabs (dashboard/tickets/createTicket/analytics)
│   ├── AdminTicketCard.tsx, UserTicketCard.tsx
│   ├── RecentTickets.tsx, ViewSupportStatus.tsx
│   └── charts/                → TicketStatusChart.tsx etc.
├── hooks/
│   └── useGreeting.ts         → time-of-day greeting
├── pages/
│   └── Analytics.tsx          → analytics page
├── types/
│   └── dashboard.ts           → DashboardTicketSummary, DashboardMonthlyStat, ...
└── index.ts
```

> **Note**: dashboard data is aggregated in `src/app/hooks/useDashboardData.ts` (not inside the feature).

---

### `features/users/`

Handles profile page, profile editing, and avatar upload.

```
users/
├── api/
│   └── index.ts    → getAdminUsers, getUserProfile, updateUserById, uploadAvatar, ...
├── hooks/
│   ├── useUsers.ts          → React Query hooks
│   ├── useProfileEditor.ts  → profile editing logic
│   ├── useAvatarHandlers.ts → upload / delete avatar
│   └── components/          ← ⚠️ issue: components nested under hooks (see section 14)
│       ├── PersonalInformationSection.tsx
│       ├── ManagerSelect.tsx + VirtualizedManagerSelect.tsx
│       ├── UserCard.tsx, UserSearchBar.tsx
│       ├── ErrorState.tsx, LoadingState.tsx
│       └── index.ts
├── pages/
│   └── UserProfile.tsx
├── types/
│   └── (empty)
└── index.ts
```

---

## 7. Shared layer

### `shared/api/`

```
shared/api/
├── client.ts      → createApiClient(), apiClient (singleton)
│                    Methods: .get, .post, .put, .patch, .delete, .upload
├── auth.ts        → getCurrentSession, loginWithSession, logoutCurrentSession, ...
├── users.ts       → getAdminUsers, getUserProfile, setUserStatusOffline
├── contracts.ts   → Zod schemas for API response validation (437 lines)
├── csrf.ts        → postWithCsrf() — automatically manages CSRF token for mutations
└── index.ts       → public API re-exports
```

**API client** (`client.ts`):

- Base URL from `VITE_API_URL` (env) or `http://localhost:4000/api`
- 30‑second timeout
- Automatic normalization of errors into `ApiError`
- On 401 → redirect to `/login`
- `credentials: 'include'` for authenticated requests (cookie‑session)

**CSRF**: all POST/PUT/PATCH/DELETE mutations go through `postWithCsrf()` — it caches the token and refreshes automatically on `CSRF_INVALID`.

---

### `shared/components/`

```
shared/components/
├── auth/
│   ├── ProtectedRoute.tsx   → route protection (auth + RBAC)
│   └── AccessGuard.tsx      → component-level RBAC
├── filters/
│   └── FilterSelect.tsx     → reusable filter `<Select>`
├── layout/
│   ├── AppLayout.tsx        → main layout (sidebar + header + content)
│   ├── Sidebar.tsx          → sidebar navigation (role‑dependent)
│   ├── TabPageLayout.tsx    → layout for tabbed pages
│   └── nav-user.tsx         → user block in sidebar
├── ui/                      → shadcn UI primitives (button, card, dialog, ...)
└── ErrorBoundary.tsx        → React error boundary
```

---

### `shared/hooks/`

| Hook                | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `useAuth()`         | Current user, role, isAuthenticated, isLoading         |
| `useIsStaff()`      | `{ isStaff, isAdmin, isSupport, isRoleReady, role }`   |
| `useAdminUsers()`   | List of all users (staff only)                         |
| `useTicketFilter()` | Client‑side filtering of tickets array by search query |
| `useTicketStatus()` | Ticket status management                               |
| `useUserFilter()`   | Client‑side user search                                |
| `usePagination()`   | Cursor‑based pagination                                |
| `useDebounce()`     | Debounce a value                                       |
| `use-mobile.ts`     | `useIsMobile()` — detect mobile viewport               |

---

### `shared/lib/`

```
shared/lib/
├── utils.ts             → cn() — Tailwind utility (clsx + twMerge)
├── createStrictContext.ts → Context factory with provider check
├── errorHandler.ts      → defaultQueryErrorHandler for React Query
├── observability.ts     → reportError() — error.logging
├── apiErrors.ts         → helpers for ApiError
└── security/
    └── sanitizeRichText.ts  → XSS sanitization for HTML/Markdown
```

### `shared/security/`

```
shared/security/
└── access-matrix.ts     → ACCESS_MATRIX, canAccess(key, role, context)
```

The RBAC matrix is the single source of truth for route/component permissions.

---

## 8. Authentication & access control

### Session lifecycle

```
1. User opens the app
2. AuthProvider mounts → GET /users/profile (cookies included)
3. Success → user stored in AuthContext
4. Failure → user = null, isAuthenticated = false
5. Login → loginWithSession() → POST /auth/login → login(user) in context
6. Logout → logout() → user = null
7. 401 on any request → redirect to /login (apiClient.onUnauthorized)
```

### Route protection

```tsx
// In router.tsx — every protected route:
<ProtectedRoute access="route.dashboard">
  <AppLayout>
    <DashboardPage />
  </AppLayout>
</ProtectedRoute>
```

### Component protection

```tsx
// Hide component from non-admins:
<AccessGuard access="component.dashboard.adminTab">
  <AdminOnlyComponent />
</AccessGuard>
```

### Adding a new permission

Open `src/shared/security/access-matrix.ts` and add a key to `AccessKey` and an entry in `ACCESS_MATRIX`.

### Roles

| Role       | Description                               |
| ---------- | ----------------------------------------- |
| `user`     | Regular staff member, sees own tickets    |
| `support1` | Support: sees all tickets, can assign     |
| `admin`    | Everything support1 can + user management |

**Check role in components** using `useIsStaff()` from `@/shared/hooks/useIsStaff`. Don’t
hardcode `role === 'admin' || role === 'support1'`.

---

## 9. API layer

### Request flow

```
Component/hook
    └── useXxx() (React Query hook in features/X/hooks/)
          └── getXxx() (API function in features/X/api/ or shared/api/)
                └── apiClient.get/post/... (shared/api/client.ts)
                      └── fetch() → Backend API
```

### Typing responses

All API responses are validated with Zod in `shared/api/contracts.ts`:

```ts
// Example: getting a ticket
const ticket = await parseApiPayload(response, ticketSchema);
```

### CSRF mutations

```ts
// Any POST mutation (create ticket, comment, login):
import { postWithCsrf } from '@/shared/api/csrf';
await postWithCsrf('/tickets', ticketData);
```

### Error handling

Errors normalize into `ApiError` (`src/types/api-error.ts`). React Query uses
`defaultQueryErrorHandler` for mutation failures.

---

## 10. State management

| State type   | Where stored                  | How to access                      |
| ------------ | ----------------------------- | ---------------------------------- |
| Server state | React Query cache             | `useXxx()` hooks in features/hooks |
| Auth state   | `AuthContext`                 | `useAuth()` or `useAuthContext()`  |
| UI state     | component `useState`          | kept close to usage                |
| URL state    | React Router searchParams     | `useSearchParams()`                |
| Theme        | `ThemeContext` (localStorage) | `useTheme()` from `next-themes`    |

> **Query invalidation** after mutations:

```ts
// e.g. reset ticket list after creating a ticket
queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
```

### Contract Provider pattern (DashboardPage)

`DashboardPage` uses a DI pattern—hooks are injected via context for test isolation:

```tsx
// tests can supply mock hooks via contract={}
<DashboardPageContractProvider contract={mockContract}>
  <DashboardPageContent />
</DashboardPageContractProvider>
```

Only DashboardPage uses this; other pages use normal imports.

---

## 11. Tests

### Structure

```
src/test/
├── mocks/
│   ├── db.ts          → in-memory test DB (MSW + fixtures)
│   ├── server.ts      → MSW server (setupServer)
│   ├── handlers/
│   │   ├── auth.ts    → handlers for /auth/*
│   │   └── tickets.ts → handlers for /tickets/*
│   └── index.ts       → re-export
└── test-utils.tsx     → custom render() with providers

e2e/
├── critical-flows.smoke.spec.ts
├── critical-flows.negative.spec.ts
├── navigation.spec.ts
└── support/
    └── mock-api.ts    → Playwright mock API
```

### Writing unit tests

```ts
import { render, screen } from '@/test/test-utils'; // custom render with providers
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock a specific endpoint:
server.use(
  http.get('/api/tickets', () => HttpResponse.json({ items: [], pageInfo: { ... } }))
);
```

### Running

```bash
npm run test            # watch mode
npm run test:run        # single run
npm run test:coverage   # with coverage
npm run e2e             # Playwright e2e
```

---

## 12. Where to find X?

| What you're looking for                 | Where to look                                      |
| --------------------------------------- | -------------------------------------------------- |
| All routes                              | `src/app/router.tsx`                               |
| URL paths (strings)                     | `src/config/paths.ts`                              |
| Env variables                           | `src/config/env.ts`                                |
| Global types (User, Ticket, Comment…)   | `src/types/index.ts`                               |
| ApiError type                           | `src/types/api-error.ts`                           |
| HTTP client                             | `src/shared/api/client.ts`                         |
| Auth API (login, logout, session)       | `src/shared/api/auth.ts`                           |
| Zod schemas for response validation     | `src/shared/api/contracts.ts`                      |
| CSRF logic                              | `src/shared/api/csrf.ts`                           |
| RBAC access matrix                      | `src/shared/security/access-matrix.ts`             |
| Role check in component                 | `src/shared/hooks/useIsStaff.ts`                   |
| Current user                            | `src/shared/hooks/useAuth.ts`                      |
| Sidebar navigation                      | `src/shared/components/layout/Sidebar.tsx`         |
| Application layout                      | `src/shared/components/layout/AppLayout.tsx`       |
| shadcn UI components                    | `src/shared/components/ui/`                        |
| Common hooks (pagination, debounce…)    | `src/shared/hooks/`                                |
| Ticket list request                     | `src/features/tickets/api/index.ts` → `getTickets` |
| Ticket list React Query hook            | `src/features/tickets/hooks/useTickets.ts`         |
| Server-side ticket filters (URL params) | `src/features/tickets/hooks/useTicketFilters.ts`   |
| Client-side ticket search               | `src/shared/hooks/useTicketFilter.ts`              |
| Ticket table columns                    | `src/features/tickets/config/ticketColumns.tsx`    |
| AI chat                                 | `src/features/tickets/components/ai-overlay/`      |
| AI API                                  | `src/features/tickets/api/ai.ts`                   |
| Dashboard data (aggregation)            | `src/app/hooks/useDashboardData.ts`                |
| XSS sanitization                        | `src/shared/lib/security/sanitizeRichText.ts`      |
| Error logging                           | `src/shared/lib/observability.ts` → `reportError`  |
| App providers                           | `src/app/provider.tsx`                             |
| MSW mocks for tests                     | `src/test/mocks/`                                  |
| E2E tests                               | `e2e/`                                             |
| Architecture docs                       | `docs/ARCHITECTURE.md`                             |
| Testing docs                            | `docs/TESTING.md`                                  |
| Security docs                           | `docs/SECURITY.md`                                 |

---

## 13. Adding a new feature

1. **Create folder structure:**

   ```
   src/features/my-feature/
   ├── api/
   │   └── index.ts
   ├── components/
   ├── hooks/
   │   └── useMyFeature.ts
   ├── pages/
   │   └── MyFeaturePage.tsx
   └── index.ts          ← public API, only what is needed externally
   ```

2. **Add a route** in `src/app/router.tsx`:

   ```tsx
   <Route
     path={paths.app.myFeature.path}
     element={
       <ProtectedRoute access="route.myFeature">
         <AppLayout>
           <MyFeaturePage />
         </AppLayout>
       </ProtectedRoute>
     }
   />
   ```

3. **Add the path** in `src/config/paths.ts`.
4. **Add a permission** in `src/shared/security/access-matrix.ts` (if RBAC is needed).
5. **API**: import `apiClient` from `@/shared/api`; use `postWithCsrf` for mutations.
6. **React Query hooks**: create them in `features/my-feature/hooks/`, following the pattern from `useTickets.ts`.
7. **Types**: add to `src/types/index.ts` (shared) or `features/my-feature/types/` (feature-specific).

---

## 14. Known structural issues

These issues exist and should be fixed when convenient:

### 🔴 High priority

| Problem                                 | Files                              | Fix                                       |
| --------------------------------------- | ---------------------------------- | ----------------------------------------- |
| Components placed under `hooks/` folder | `features/users/hooks/components/` | Move them to `features/users/components/` |
| `LiquidEther.tsx` in wrong location     | `src/components/LiquidEther.tsx`   | Move to `features/auth/components/`       |

### 🟡 Medium priority

| Problem                                                                   | Files                                                                       | Fix                               |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------- |
| Duplication of `isStaff` checks                                           | `DashboardPage.tsx`, `CreateTicket.tsx`, `Tickets.tsx`, `ticketColumns.tsx` | Use `useIsStaff()` everywhere     |
| Duplication of `LoadingState`/`ErrorState`                                | `TicketDetailPage.tsx`, `users/hooks/components/`                           | Extract into `shared/components/` |
| `useDashboardData` lives in `app/hooks/` instead of `features/dashboard/` | `src/app/hooks/useDashboardData.ts`                                         | Move it                           |

### 🔵 Low priority

| Problem                                                                     | Files                                                                  | Fix                                           |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------- |
| Two places for security (`shared/security/` and `shared/lib/security/`)     | —                                                                      | Pick one and merge                            |
| `useTicketFilter` vs `useTicketFilters` — similar names, different meanings | `shared/hooks/useTicketFilter.ts`, `tickets/hooks/useTicketFilters.ts` | Rename `useTicketFilter` to `useTicketSearch` |
| `TabType` contains routing concepts                                         | `src/types/index.ts`                                                   | Rename or rethink                             |
