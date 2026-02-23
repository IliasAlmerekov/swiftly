# Critical Flows Test Matrix

## Scope

This matrix defines the mandatory coverage for critical workflows:

- `auth`
- `create ticket`
- `status change`
- `role access`

It follows React testing best practices from Context7 references:

- user-centric interaction (`@testing-library/user-event`)
- semantic queries (`getByRole` / `findByRole`) as primary selectors
- deterministic async assertions

## Matrix

| Flow          | Integration                                                                                                               | E2E Smoke (Happy Path)                                          | E2E Negative                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Auth          | `src/test/mocks/handlers/integration.test.ts` (`auth flow`)                                                               | `e2e/critical-flows.smoke.spec.ts` (`user/support/admin login`) | Existing login invalid credentials in integration; browser required constraints covered in form validation flows |
| Create ticket | `src/test/mocks/handlers/integration.test.ts` (`create ticket flow`)                                                      | `e2e/critical-flows.smoke.spec.ts` (`user creates ticket`)      | `e2e/critical-flows.negative.spec.ts` (`required fields`)                                                        |
| Status change | `src/test/mocks/handlers/integration.test.ts` (`status change flow`)                                                      | `e2e/critical-flows.smoke.spec.ts` (`support resolves ticket`)  | Covered by role restrictions + API-level handler checks                                                          |
| Role access   | `src/test/mocks/handlers/integration.test.ts` (`role access flow`) + `src/shared/components/auth/ProtectedRoute.test.tsx` | `e2e/critical-flows.smoke.spec.ts` (`admin tabs access`)        | `e2e/critical-flows.negative.spec.ts` (`access denied`)                                                          |

## Stability Controls

- Stable selectors: semantic, user-facing selectors (`getByRole`, labeled fields) for critical controls.
- Deterministic data setup: Playwright API mocking in `e2e/support/mock-api.ts` creates isolated, per-test state.
- No shared backend state dependency in e2e.
- Flaky specs removed: previous `fixme` create-ticket specs under `e2e/tickets/`.
