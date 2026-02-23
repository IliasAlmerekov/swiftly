# ADR 0003: Deterministic API Mocking for Critical E2E Flows

## Status

Accepted

## Context

Critical E2E specs for ticket creation were marked `fixme` due to flaky behavior:

- dependency on external backend availability/state
- non-deterministic parallel execution conflicts
- brittle selectors tied to variable UI text

## Decision

For critical flow E2E tests we use deterministic, per-test Playwright API mocking:

- route all `**/api/**` requests in test scope
- provide isolated in-memory state for users/tickets per test
- issue deterministic JWT payloads for role-based auth paths
- use stable `data-testid` selectors for critical controls

## Consequences

Positive:

- no dependency on backend runtime/data state
- reliable parallel execution
- consistent role-based happy/negative coverage

Trade-off:

- mocked API contract must be maintained with frontend expectations
- does not replace full end-to-end backend integration in separate environments
