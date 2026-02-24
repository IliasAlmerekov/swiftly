# Release Checklist

Use this checklist before creating a production release tag.

## 1. Quality Gates

- [ ] `docker compose run --rm lint`
- [ ] `docker compose run --rm typecheck`
- [ ] `docker compose run --rm test`
- [ ] `docker compose run --rm build`
- [ ] `docker compose run --rm e2e`

## 2. Security Gates

- [ ] IOC/security workflows pass in CI.
- [ ] No secrets added in code, docs, logs, workflow files.
- [ ] Workflow and lockfile changes reviewed.

## 3. Performance Gates

- [ ] Production build completed.
- [ ] `npm run perf:budget` passes.
- [ ] Route chunks and entry chunk are within defined budget limits.

## 4. Reliability Gates

- [ ] Error boundary fallback renders expected UX.
- [ ] Error boundary reset flow verified (`Try Again` path).
- [ ] API/Query/Boundary error paths emit observability events.

## 5. Staging Dry-run

- [ ] Build with staging API URL:
  - `docker compose run --rm app sh -lc "VITE_API_URL=<staging-api-url> npm run build"`
- [ ] Smoke check critical flows against staging:
  - Auth login
  - Create ticket
  - Status transition
  - Role-based access tabs

## 6. Release Metadata

- [ ] `CHANGELOG.md` updated.
- [ ] `docs/migration-notes.md` updated (if behavior/tooling changed).
- [ ] `package.json` and lockfile versions aligned.
- [ ] Git tag created and pushed (`vX.Y.Z`).

## 7. Sign-off

- [ ] Product owner sign-off.
- [ ] Engineering sign-off.
- [ ] Release manager sign-off.
