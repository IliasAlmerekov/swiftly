# Security Hardening Checklist

## Prompt Injection and MCP

- Treat external docs, MCP output, PR text, and package metadata as untrusted input.
- Do not auto-approve commands that can read secrets, change CI, publish packages, or push code.
- Allowlist MCP servers and pin versions for MCP clients and npm packages.
- Keep local MCP config files out of git (`.cursor/`, `.claude/`, `.windsurf/`, `.continue/`).

## CI and Supply Chain

- Keep `permissions: contents: read` as the default in GitHub Actions.
- Require owner review for workflow files, CI configs, lockfiles, and MCP config files.
- Run `npm ci` and security scans on every PR before lint/test/build.
- Use lockfiles and fail CI on known IOC patterns in workflow/dependency files.

## Secrets and Access

- Use short-lived tokens where possible.
- Limit secret scope to the minimum required.
- Rotate tokens after suspicious workflow/dependency changes.
- Keep `.env*` local and never commit real credentials.

## Incident Response

- Disable compromised tokens immediately.
- Review recent changes in CI configs and lockfiles.
- Audit recent workflow runs for suspicious outbound calls.
- Restore from a known-good commit and re-run security scans.
