# ADR-0004: Auth Contract Migration to HttpOnly Cookie Session

## Context

Current frontend auth stores JWT in `localStorage/sessionStorage` and sends `Authorization: Bearer ...`.
Current backend contract returns `accessToken/refreshToken` in JSON body and validates bearer token from header.

This creates a critical XSS risk for token exfiltration from Web Storage.
We need a cross-repo contract before implementation.

## Decision

Phase 0 contract is agreed as follows.

### 1. Transport and session model

- Browser auth secrets are stored only in HttpOnly cookies.
- Frontend never stores access/refresh token in `localStorage/sessionStorage`.
- Frontend uses `fetch(..., { credentials: 'include' })` for authenticated API calls.

### 2. Auth endpoints (target contract)

- `POST /api/auth/login`
  Request: `{ email: string, password: string }`
  Response `200`: `{ user: AuthUser, authenticated: true }`
  Side effect: sets auth cookies.
- `POST /api/auth/register`
  Request: `{ email: string, password: string, name: string }`
  Response `201`: `{ user: AuthUser, authenticated: true }`
  Side effect: sets auth cookies.
- `GET /api/auth/me`
  Request: no body
  Response `200`: `{ user: AuthUser, authenticated: true }`
  Response `401`: centralized auth error (`AUTH_REQUIRED`/`AUTH_INVALID`).
- `POST /api/auth/refresh`
  Request: no token in body
  Response `200`: `{ authenticated: true }`
  Side effect: rotates auth cookies.
- `POST /api/auth/logout`
  Request: `{ allSessions?: boolean }`
  Response `200`: `{ success: true, message: string }`
  Side effect: clears auth cookies server-side and in response.

`AuthUser` = `{ _id: string, email: string, name: string, role: 'user' | 'support1' | 'admin' }`.

### 3. Cookie policy

- Cookies are set with `HttpOnly; Secure`.
- Production cross-site SPA (`netlify.app` -> `onrender.com`) uses `SameSite=None`.
- Local development may use `SameSite=Lax` where site context allows.
- Cookie names are prefixed and stable across FE/BE contracts.

### 4. CSRF policy

- Because production is cross-site and requires credentialed cookies, backend enforces CSRF protection for state-changing requests.
- Frontend sends CSRF token in `X-CSRF-Token` header for `POST/PUT/PATCH/DELETE`.
- Backend validates CSRF token and rejects invalid/missing tokens with `403`.

### 5. CORS policy

- Backend enables credentialed CORS for allowlisted frontend origins only.
- No wildcard origin with credentials.
- Frontend API client always sets credentials mode according to contract.

### 6. Migration compatibility (agreed)

- During migration window backend may keep legacy token fields in auth responses.
- Frontend migration target ignores token body and relies on cookie + `/api/auth/me`.
- Final state removes token body from public auth contract.

### 7. Acceptance criteria for Phase 0

- [x] Current FE/BE auth contract was inspected in code and tests.
- [x] Target cookie-session contract is defined (endpoints, cookies, CSRF, CORS).
- [x] Backend/frontend responsibility split is explicit.
- [x] Migration compatibility window is explicitly documented.

## Alternatives

- Keep bearer tokens in Web Storage with stricter CSP only.
- Store token in memory only and force re-auth on reload.
- Server-side opaque session store instead of JWT pair.

## Consequences

- Security posture improves against token theft via XSS.
- Backend and frontend both require coordinated breaking-change migration.
- CSRF protection becomes mandatory in production cross-site mode.
- Auth integration tests and contract tests must be rewritten to cookie semantics.
