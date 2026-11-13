# PingPanda Operations and Deployment Guide

## 1. Purpose

This guide describes the operational work required to run the application in a development, staging, or production environment. It focuses on dependencies, environment configuration, database lifecycle, provider integration, deployment choices, and post-deployment verification.

## 2. Deployment target decision

The package scripts expose two different runtime paths:

- `npm run build` and `npm run start` for a conventional Next.js deployment.
- `npm run deploy` for the configured Wrangler command.

Do not assume these are interchangeable. Select the intended platform and verify that its runtime supports Next.js routing, the Hono adapter, Prisma's Neon driver, and all required provider SDKs. Keep the chosen target documented in the deployment configuration and release process.

## 3. Required services

| Service | Why it is used | Required for |
|---|---|---|
| PostgreSQL / Neon | Persistent application records | Database-backed features |
| Clerk | User authentication | Authenticated user flows |
| Stripe | Payment processing | Subscription/payment flows |
| Upstash Redis | Optional caching | Only code paths that call Redis |
| Discord | Discord-related integration | Only Discord workflows |

Provision separate credentials and resources for development, staging, and production. Do not reuse production credentials in local development.

## 4. Environment variables

The repository's current `.env.example` includes:

```dotenv
REDIS_URL=
REDIS_TOKEN=
```

The complete runtime configuration also depends on the variables referenced by the environment helper, database client, Clerk setup, payment integration, and webhook handlers. Inspect those files before deployment and maintain a deployment-specific checklist with the exact variable names and whether each is required.

For each secret, record internally:

- Which service owns it.
- Which runtime consumes it.
- Whether it is public or server-only.
- Which environment contains it.
- How it is rotated.
- What breaks when it is absent.

Never commit real secret values.

## 5. Database lifecycle

Before deploying a new release:

1. Confirm the target database and credentials.
2. Review the Prisma schema diff.
3. Generate a migration for schema changes.
4. Test the migration against a disposable database.
5. Back up production data when the change is risky.
6. Apply migrations through the controlled release process.
7. Verify the application can read and write expected records.

Useful commands:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
npx prisma studio
```

Do not use destructive database reset commands against production. Do not rely on ad hoc schema pushes as a substitute for reviewed migrations.

### Quota schema caution

The current Quota model has a unique constraint on `userId`, while also storing year and month. That allows one row per user, not one row per user per month. Confirm the intended business rule before relying on this table for historical monthly accounting.

## 6. Authentication operations

Clerk identities are mapped to local User rows using `externalId`. A deployment must ensure that account creation or synchronization provisions the local record. If the external identity exists but the local row does not, private procedures reject the request.

API keys are stored in the User model. Treat them as secrets:

- Do not display full keys after creation.
- Provide a rotation/revocation path.
- Store only what the authentication design requires.
- Avoid logging Authorization headers.
- Scope every key to the intended account and permissions.

## 7. Payment operations

Before enabling payment functionality:

- Configure provider credentials on the server only.
- Register the correct webhook URL.
- Verify webhook signatures.
- Handle duplicate webhook delivery idempotently.
- Persist provider event identifiers where appropriate.
- Reconcile subscription status with the local plan.
- Define how cancellations, failed payments, refunds, and disputes affect access.
- Test the complete lifecycle in the provider's test mode.

A successful browser redirect is not proof that a payment was settled. The server-side provider event should be authoritative.

## 8. CORS and network exposure

The Hono composition currently attaches CORS middleware without a visible origin allowlist. Review this before exposing the API publicly. Configure only trusted application origins and decide explicitly whether credentialed requests are required.

Also review:

- Rate limiting for public or API-key endpoints.
- Request body size limits.
- Input validation for JSON fields.
- Abuse controls for event ingestion.
- Provider timeout and retry policy.
- Webhook signature verification.

## 9. Release checklist

### Before release

- [ ] Dependencies install with `npm ci`.
- [ ] Prisma schema validates.
- [ ] Prisma client is generated.
- [ ] Required environment variables are configured.
- [ ] Database migrations are reviewed and applied.
- [ ] Clerk production URLs and keys are configured.
- [ ] CORS policy is restricted.
- [ ] Payment webhook configuration is verified.
- [ ] Redis and Discord integrations are either configured or intentionally disabled.
- [ ] Build completes in the target deployment environment.

### After release

- [ ] Landing and authentication routes load.
- [ ] A test user can authenticate.
- [ ] A local User record is provisioned.
- [ ] Protected API requests enforce authentication.
- [ ] User-owned resources cannot be accessed by another account.
- [ ] Database reads and writes work.
- [ ] Payment test events are verified if payments are enabled.
- [ ] Logs contain no secrets.
- [ ] Error rates and provider failures are observable.

## 10. Incident response

For a production incident:

1. Identify the affected route, provider, or data model.
2. Capture timestamps and correlation identifiers.
3. Check application logs and provider status.
4. Determine whether the incident affects availability, data integrity, authentication, or payment state.
5. Avoid manually editing production records without a reviewed recovery plan.
6. Rotate credentials if exposure is suspected.
7. Restore from backups only after confirming the scope of data loss.
8. Document root cause and preventive actions.

## 11. Backup and recovery

Back up PostgreSQL using the facilities provided by the database host. Define retention and recovery objectives before production use. Test restoration periodically. A backup that has never been restored is not a verified recovery plan.

Redis should be treated as a cache unless the application explicitly stores authoritative state there. Rebuilding a cache must not be required to recover primary business records.

## 12. Operational boundaries

This repository alone does not establish an uptime SLA, guaranteed event delivery, multi-region failover, or a formal incident response service. Those claims require deployed infrastructure, monitoring, tested recovery procedures, and operational ownership.
