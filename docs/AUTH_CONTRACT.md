# Auth Contract (Phase 1)

## Endpoint matrix

| Endpoint                  | authMode   | credentials policy | csrf required |
| ------------------------- | ---------- | ------------------ | ------------- |
| `GET /api/auth/csrf`      | `none`     | `include`          | no            |
| `POST /api/auth/login`    | `none`     | `include`          | yes           |
| `POST /api/auth/register` | `none`     | `include`          | yes           |
| `GET /api/auth/me`        | `required` | `include`          | no            |
| `POST /api/auth/refresh`  | `required` | `include`          | yes           |
| `POST /api/auth/logout`   | `required` | `include`          | yes           |

`authMode` replaces legacy `skipAuth` at frontend route/request policy level.

## Error matrix

| code               | http status | frontend reaction                               |
| ------------------ | ----------- | ----------------------------------------------- |
| `AUTH_REQUIRED`    | 401         | clear auth state and redirect to sign-in        |
| `AUTH_INVALID`     | 401         | clear auth state and redirect to sign-in        |
| `AUTH_FORBIDDEN`   | 403         | show "no access" state and keep current session |
| `CSRF_INVALID`     | 403         | trigger csrf refresh flow, then retry once      |
| `VALIDATION_ERROR` | 400         | show inline form validation errors              |

## Cookie, TTL, remember-me

| Policy                 | Value                                        |
| ---------------------- | -------------------------------------------- |
| Browser auth transport | HttpOnly cookie session only                 |
| Cookie flags (prod)    | `HttpOnly; Secure; SameSite=None`            |
| Default session TTL    | backend-defined short ttl                    |
| `keepLoggedIn=false`   | default ttl                                  |
| `keepLoggedIn=true`    | backend extends ttl using long-lived profile |
| Refresh behavior       | `POST /api/auth/refresh` rotates cookie ttl  |

### Secure env matrix

| Environment  | Secure flag | SameSite baseline |
| ------------ | ----------- | ----------------- |
| prod (https) | required    | `None`            |
| local-http   | forbidden   | `Lax`             |
| local-https  | allowed     | `Lax`             |

## CSRF bootstrap flow

1. Frontend requests `GET /api/auth/csrf` with `credentials: 'include'`.
2. Backend returns csrf bootstrap token payload and may set/update csrf cookie.
3. Frontend sends `X-CSRF-Token` for `POST /api/auth/login` and `POST /api/auth/register`.
4. If backend responds `403` with `CSRF_INVALID`, frontend repeats step 1 and retries once.

## CORS policy

- Backend allows credentialed CORS only for allowlisted frontend origins.
- Wildcard origin (`*`) is forbidden when `credentials: include` is used.

## Auth response compatibility window

- Transition window allows legacy token fields in login/register success payloads.
- Frontend must treat cookie session as source of truth and ignore token body fields.
- Legacy fields are deprecated and removed on deadline: `2026-06-30`.

## Migration checklist

### Phase 1 (contract-first artifacts)

- [x] `docs/AUTH_CONTRACT.md` created with endpoint, error, and cookie policy matrixes.
- [x] ADR-0004 updated with final contract decisions.
- [x] `specs/openapi.yaml` added for auth endpoints and unified error dto.
- [x] `authMode` naming documented as replacement for `skipAuth`.
- [x] Legacy token-body deprecation deadline placeholder documented.

Done criteria:

- [x] Browser auth contract is explicit and reviewable without reading runtime code.
- [x] 401/403 semantics and `error.code` are fixed and shared across docs/spec.

### Phase 2 (runtime rollout)

- [ ] Frontend removes token storage and uses cookie session only.
- [ ] Backend removes token-in-body from public responses after migration window.
- [ ] CSRF enforcement active on state-changing auth routes in production.
- [ ] Legacy behavior removed on deadline: `2026-06-30`.

Done criteria:

- [ ] `src` runtime matches this contract.
- [ ] Contract and integration tests pass against cookie-session flow.
