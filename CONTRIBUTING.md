# Contributing to PingPanda

## 1. Start with the system boundaries

PingPanda is a Next.js and TypeScript application with a Hono API layer, Clerk authentication, Prisma persistence, and PostgreSQL. Before changing behavior, read the root README and the architecture and operations guides under `docs/`.

The repository has several sensitive boundaries: authenticated user identity, API keys, user-owned resources, event payloads, quotas, payment provider callbacks, and database migrations. Changes in these areas require more care than ordinary presentation updates.

## 2. Contribution principles

- Keep UI, API routing, domain operations, and persistence responsibilities separated.
- Enforce user ownership on the server, not only in the client.
- Validate all client-provided values, including nested JSON event fields.
- Never expose server credentials to browser code.
- Treat payment provider callbacks as untrusted until signatures are verified.
- Preserve existing data through reviewed Prisma migrations.
- Make external provider failures visible and recoverable.
- Update documentation when a feature, environment variable, route, or deployment assumption changes.

## 3. Local setup

```bash
git clone https://github.com/Brajesh31/PingPanda_AI_SaaS_Monitoring_Platform.git
cd PingPanda_AI_SaaS_Monitoring_Platform
npm ci
cp .env.example .env
npm run dev
```

Configure the required development credentials before exercising authenticated, database-backed, payment, Redis, or Discord functionality. Never place real credentials in a commit.

## 4. Making a change

1. Create a focused branch.
2. Identify the affected layer and existing patterns.
3. Implement the smallest coherent change.
4. Add or update tests for the behavior.
5. Validate the Prisma schema if the data model changed.
6. Run the build and lint commands supported by the current package scripts.
7. Update relevant docs and environment examples.
8. Open a pull request with a clear summary and verification notes.

## 5. Database and migration changes

Schema changes must include a migration and a description of their effect on existing records. Consider nullable fields, unique constraints, relation deletion behavior, indexes, and rollback implications.

Do not casually modify unique constraints or ownership relations. In particular, quota accounting depends on the intended uniqueness scope across users and months. Explain the business rule before changing the schema.

## 6. API and authorization changes

For every new protected procedure, specify:

- Whether authentication is required.
- Whether Clerk sessions, API keys, or both are accepted.
- Which user owns the resource.
- Which input fields are accepted.
- Validation and error behavior.
- Whether the operation has external side effects.
- Whether retries are safe.

Never rely on a user ID supplied by the browser as authorization evidence. Resolve the user from authenticated server context and scope all queries accordingly.

## 7. Integration changes

Payment, Redis, and Discord code should handle provider errors, timeouts, and rate limits. Webhook processing should be signature-verified and idempotent. External API calls should not log credentials or sensitive payloads.

Document any new environment variables in the relevant setup documentation and provide safe placeholder names only.

## 8. Pull request description

Include:

- The problem being addressed.
- The design and affected layers.
- Any schema or API contract changes.
- New environment variables.
- Security and ownership implications.
- Tests and commands run.
- Deployment or migration steps.
- Known limitations.

## 9. Reporting defects

A useful report includes the affected route, expected and actual behavior, browser or runtime details, sanitized logs, and reproducible steps. Remove API keys, cookies, authorization headers, payment data, and personal event content before sharing.

## 10. Security reports

Do not publish exploitable vulnerabilities or leaked credentials in public issues. Follow the repository's security reporting guidance and include enough detail for private reproduction.

## 11. Review standard

A contribution is ready when the behavior is correct, authorization is enforced server-side, failures are handled, tests cover important paths, database changes are safe, and documentation reflects the actual implementation.
