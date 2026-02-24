# Testing Strategy

## Test Types

- Unit tests: pure domain and use-case logic
- Integration tests: DB, HTTP, external services
- End-to-end tests: critical user flows only

## Rules

- Every bug fix must add a regression test
- Tests must be deterministic
- No real network calls in unit tests
- Mock/fake only at IO boundaries

## Quality

- Tests must assert behavior, not implementation
- Avoid brittle snapshots
- Clear test names describing behavior

## React Testing Library Rules

- Prefer semantic queries in this order: `getByRole` -> `getByLabelText` -> `getByText`; use `getByTestId` only as an explicit escape hatch.
- Use `findBy*`/`waitFor` for async UI updates instead of manual sleeps.
- Assert user-visible outcomes and accessibility semantics, not internal component details.

## Critical Flow Coverage

- See `docs/critical-flows-test-matrix.md` for required flow coverage:
  auth, create ticket, status change, role access.

## Coverage Gate (Changed Files)

- Minimum per changed source file: `80%` lines by default.
- Run full gate:
  - `npm run test:coverage:gate`
- `COVERAGE_BASE_REF` is required for changed-file comparison in CI (for local runs, the script skips if not set).
- Override threshold/base ref when needed:
  - `MIN_CHANGED_FILE_COVERAGE=85 COVERAGE_BASE_REF=origin/main npm run test:coverage:gate`

## Playwright Stability Rules

- Use locator APIs (`getByRole`, `getByLabel`, `getByText`) over brittle CSS/XPath selectors.
- Rely on Playwright auto-waiting and web assertions; do not use hard-coded `waitForTimeout`.
- Keep E2E deterministic: controlled test data, isolated fixtures, and stable setup/cleanup per test.
- Mock network only at boundaries and keep mock behavior explicit and versioned with tests.

## Source Baseline (Context7)

- React docs (`/reactjs/react.dev`): purity, effects boundaries, StrictMode checks.
- Testing Library docs (`/websites/testing-library`): user-centric queries and async test utilities.
- Playwright docs (`/microsoft/playwright`): locator-first strategy, auto-waiting, fixtures, anti-flake practices.
