# Quality & Production Readiness

## Definition of Done

- Feature or fix implemented as requested
- Tests added and passing
- Docs updated if behavior or API changed
- No unnecessary complexity introduced

## Review Checklist

### Correctness

- Edge cases handled
- Errors are explicit and meaningful
- Timezones, locales, encoding considered

### Security

- Input validation at boundaries
- Authorization checks in the right layer
- No secrets in code, logs, or configs
- OWASP Top 10 risks considered where relevant

### Maintainability

- Clear naming, small functions
- Single Responsibility per module/class
- No circular dependencies
- React components and hooks must keep render phase pure (no side effects or mutations)
- Prefer derived state and event handlers; use Effects only for external synchronization
- Hooks linting (`rules-of-hooks`, `exhaustive-deps`) must be clean in changed code

### Performance

- Avoid unnecessary IO and N+1 patterns
- No premature optimization
- Caching only with invalidation strategy

### Observability

- Logs at system boundaries
- Errors are traceable
- Metrics/hooks added if applicable

### Compatibility

- Backward compatibility preserved
- Migrations documented if required

## Frontend Quality Gates

- Accessibility-first UI contracts: interactive controls must expose stable roles/labels
- Avoid tests and code coupled to implementation details (private state, internals, fragile DOM shape)
- Define explicit async UI contracts for loading, success, empty, and error states

## Documentation Freshness

- When changing React/testing rules, verify against up-to-date official guidance via Context7 in the same task.
- If project rules intentionally diverge from official guidance, document rationale in ADR or PR notes.
