# Testing and Verification Guide

## Current automated coverage

The repository currently defines these npm scripts:

| Command | What it checks |
|---|---|
| `npm ci` | Installs the exact dependency graph from `package-lock.json` |
| `npx prisma validate` | Validates the Prisma schema |
| `npx prisma generate` | Generates the Prisma Client |
| `npx tsc --noEmit` | Runs TypeScript type checking without emitting files |
| `npm run lint` | Runs the configured Next.js ESLint command |
| `npm run build` | Builds the Next.js application |

There is no dedicated unit or integration test script in the current `package.json`. Do not describe the project as having automated application test coverage until a test runner and meaningful tests have been added.

The GitHub Actions workflow currently installs dependencies, validates Prisma, and runs TypeScript. A green workflow therefore confirms those checks only. It does not prove that authentication, database operations, billing, Discord, or event delivery work end to end.

## Local verification

Run the baseline checks from the repository root:

```bash
npm ci
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run lint
npm run build
```

The Prisma commands require a valid schema and may require the environment expected by Prisma. The application build may also require provider configuration depending on the route and build-time behavior. Use non-production credentials and a disposable database.

## Test layers to add

### Unit tests

Prioritize pure and deterministic logic:

- Category name and color parsing.
- Input validation and normalization.
- Quota period calculations and limit selection.
- Mapping of provider responses to internal status.
- Error translation that must not expose secrets.

Keep unit tests independent of live Clerk, Stripe, Discord, Redis, and PostgreSQL services.

### Database integration tests

Use an isolated test database. Cover:

- Creating and retrieving a local user.
- Category uniqueness within one user's ownership scope.
- Two different users creating categories with the same name.
- Event ownership and optional category association.
- Deleting or changing a category when events reference it.
- Quota row creation and concurrent updates.
- Migration behavior from the previous schema.

Always clean up test data and never point automated tests at production.

### API authorization tests

For every private procedure, cover:

- No session and no API key.
- Valid Clerk session with a synchronized local user.
- Valid bearer API key.
- Invalid bearer key with and without a valid Clerk session.
- A user attempting to access another user's category or event.
- Malformed input, missing resources, and quota exhaustion.

A test that only verifies a successful response is insufficient for user-owned resources. Cross-account access must be explicitly tested.

### Provider contract tests

Use provider test modes or mocks:

- Clerk identity lookup and local account synchronization.
- Stripe checkout-session creation and webhook signature validation.
- Discord API errors and rate-limit responses.
- Redis unavailable, timeout, and invalid-credential behavior.

Never put real provider credentials in fixtures or snapshots.

## Manual smoke test

1. Load the landing page.
2. Sign in using a non-production Clerk account.
3. Confirm the local user synchronization flow creates or finds the expected User row.
4. Open the dashboard and inspect empty-state behavior.
5. Create a category with a valid name, color, and optional emoji.
6. Create another category with the same name for the same user and confirm the conflict is handled.
7. Create the same category name under a different test user and verify user scoping.
8. Inspect category counts and time-range filters.
9. Exercise the API with a valid API key and an invalid key.
10. Confirm one user cannot read or mutate another user's data.
11. Exercise payment functionality only in Stripe test mode. Verify the returned checkout URL and server-side webhook processing before treating a plan as paid.
12. Review logs for credentials, authorization headers, and sensitive event payloads.

Some steps may not be executable in the current code. Record an unimplemented or placeholder flow as a known limitation rather than marking it passed.

## Test data and safety

- Use synthetic accounts and event payloads.
- Use a disposable database or isolated schema.
- Keep test API keys and provider credentials out of source control.
- Avoid sending test notifications to real Discord destinations.
- Do not create real charges.
- Do not use production user data in local fixtures.

## CI interpretation

The current CI job is a static validation gate, not an end-to-end test suite. If a check is skipped or unavailable because provider secrets are absent, document that limitation. Do not weaken a failing check merely to obtain a green badge.
