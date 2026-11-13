# Security Policy

## Scope

This policy covers the PingPanda web application and API source in this repository. The application handles authenticated user accounts, API keys, event payloads, quota information, and payment-related integrations. A deployment may also depend on external identity, database, cache, payment, and messaging providers.

## Reporting a vulnerability

Please do not disclose exploitable details in a public issue or pull request. Use GitHub's private vulnerability reporting feature for this repository when available. Include:

- A concise impact statement.
- Affected route, module, or commit.
- Reproduction steps using test accounts and non-production data.
- Required configuration and environment details.
- Relevant sanitized logs or request examples.
- A suggested mitigation, if known.

Do not include real API keys, session cookies, bearer tokens, payment credentials, or customer data in the report.

## Security-critical areas

### Authentication and API keys

The server supports Clerk session authentication and bearer API-key lookup. API keys must be treated as secrets. Do not log Authorization headers, return full keys unnecessarily, or place server-only keys in client-side code.

### Authorization and ownership

Authentication is not equivalent to authorization. Every user-owned event, category, project, quota, or payment resource must be scoped to the authenticated local user. Never trust client-supplied user identifiers as proof of ownership.

### Event ingestion

Treat event names, structured JSON fields, and formatted messages as untrusted input. Validate type, size, and allowed structure. Avoid rendering untrusted content as executable HTML. Consider abuse controls and quotas for ingestion endpoints.

### Payment processing

Verify provider webhook signatures using server-side secrets. Design handlers for duplicate delivery and retries. Do not grant paid access solely because a client returns to a success page. Reconcile provider state with the local account record.

### Database and migrations

Use least-privilege database credentials. Review migrations for data loss, exposure, and ownership changes. Back up important data before risky schema operations. Do not expose database URLs in client bundles or logs.

### CORS and API exposure

The current Hono composition enables CORS middleware without an explicit visible origin allowlist. Review and restrict origins for production. Avoid broad cross-origin access when credentials are involved.

### External integrations

Protect Clerk, Stripe, Redis, and Discord credentials. Apply timeouts, rate-limit handling, and safe retry policies. Do not allow provider failures to silently corrupt authoritative database state.

## Production security checklist

- [ ] Secrets are stored in the deployment provider, not in source control.
- [ ] Clerk production origins and redirect URLs are restricted.
- [ ] API keys can be rotated or revoked.
- [ ] User-owned queries enforce ownership on the server.
- [ ] Event payloads are validated and size-limited.
- [ ] Payment webhooks verify signatures and are idempotent.
- [ ] CORS uses an explicit allowlist.
- [ ] Rate limits protect sensitive and public endpoints.
- [ ] Logs exclude credentials and private payloads.
- [ ] Database access follows least privilege.
- [ ] Backups and restoration procedures are tested.
- [ ] Dependency updates are reviewed.

## Credential exposure

If a credential is committed or otherwise exposed, revoke or rotate it at the provider immediately. Removing it from the current source tree does not remove it from Git history, caches, forks, or existing clones. Review provider audit logs for unexpected use.

## Disclosure expectations

The goal is to acknowledge valid reports, investigate impact, and coordinate a fix before public disclosure. Do not probe systems or accounts that you do not own or have explicit permission to test.
