# Migration Notes

## 1.1.2 (2026-02-25)

### Auth Security Migration (Phase 0)

- Cross-repo FE/BE auth contract alignment completed for migration away from browser token storage.
- Added ADR with target cookie-session contract:
  - `docs/adr/0004-auth-cookie-session-contract.md`
- The agreed contract defines endpoint behavior, cookie policy, CSRF requirement, CORS credentials policy, and migration compatibility window.

## 1.1.1 (2026-02-24)

### CI and Hooks

- Git hooks are now container-first:
  - `.husky/pre-commit` and `.husky/pre-push` run checks via `docker compose run --rm ...`
  - Local host `node_modules` is no longer required for hook execution.
- GitHub CI now runs only on `pull_request` events (not on `push` to merged branches).

### Performance and Release Gates

- Added automated perf budget gate:
  - `npm run perf:budget`
  - Implemented in `scripts/check-perf-budget.mjs`.
- Added release checklist:
  - `docs/release-checklist.md`

### Observability and Error Handling

- Added shared observability hook:
  - `src/shared/lib/observability.ts`
- Error events are now reported from:
  - React error boundary path (`AppProvider` + `ErrorBoundary`)
  - API client request/upload failure paths
  - React Query default error handler path

### Testing Stability

- Stabilized flaky tests in release gates:
  - `src/provider/theme-provider.test.tsx` timeout tuned for high-load CI/container runs
  - `src/features/auth/hooks/useLogin.test.tsx` switched to deterministic async assertion flow
