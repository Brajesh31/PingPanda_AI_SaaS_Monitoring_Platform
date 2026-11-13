# PingPanda External Integrations Guide

## Overview

The application references external identity, database, cache, payment, and messaging services. Each integration has distinct credentials and failure modes. Keep provider secrets server-side.

## Clerk

Clerk supplies external user identity. The local User model stores application-specific plan, API key, quota, and Discord fields. Account provisioning must synchronize external identities with local records. Configure production domains and redirect URLs, handle disabled identities, and avoid logging session tokens.

## PostgreSQL and Neon

Prisma defines the relational schema and the project includes the Neon serverless driver and Prisma adapter. Keep database URLs server-side, use connection strings appropriate to the runtime, apply migrations through a controlled release, back up important data, and monitor slow queries and connection errors.

## Upstash Redis

The example environment file includes REDIS_URL and REDIS_TOKEN. Configure these only for code paths that require Redis. Define cache TTL and invalidation rules. Cache state should not become authoritative for payments, account ownership, or event delivery unless the architecture explicitly supports it.

## Stripe

Before production payment use, configure server-side credentials, register webhook endpoints, verify webhook signatures, process duplicate events idempotently, reconcile provider subscription state with local plan state, and define cancellation, failed-payment, refund, and dispute handling. A browser redirect is not proof of payment settlement.

## Discord

The project includes Discord REST dependencies and a Discord identifier on the user model. Define account linking, requested permissions, rate-limit handling, retry behavior, and delivery failure visibility. Never place bot tokens in frontend configuration.

## Failure handling

For every provider, define timeout behavior, retry limits, idempotency, error classification, observability, and user-facing fallback behavior. Retrying an irreversible operation must not duplicate side effects.

## Environment management

Use separate credentials for development, staging, and production. Keep real values in the hosting platform's secret manager. Commit only variable names and safe placeholders.

## Integration review checklist

- [ ] Data flow and provider purpose documented.
- [ ] Environment variables listed.
- [ ] Secrets remain server-side.
- [ ] Provider errors and rate limits handled.
- [ ] Retry and idempotency behavior defined.
- [ ] Logs redact credentials and personal data.
- [ ] Tests use provider sandbox or mocks.
- [ ] Deployment and rollback implications reviewed.
