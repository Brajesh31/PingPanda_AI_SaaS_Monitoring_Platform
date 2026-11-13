# Quotas, Plans, and Billing

## Current model

The Prisma schema defines:

- `Plan`: `FREE` and `PRO`.
- `User.plan`: the user's current local plan, defaulting to `FREE`.
- `User.quotaLimit`: an optional per-user integer.
- `Quota`: a row containing `userId`, `year`, `month`, `count`, and `updatedAt`.

The project configuration defines the free and pro quota constants used by the usage procedure. The usage response includes category usage and limits, event usage and limits, and the next month boundary as a reset date.

## Current API behavior

The project router exposes `getUsage`, which:

1. Calculates the start of the current month.
2. Looks up a quota row for the authenticated user and current year/month.
3. Uses zero when no matching row is found.
4. Counts the user's event categories.
5. Selects FREE or PRO limits from the local plan.
6. Returns usage, limits, and the next month reset date.

The payment router exposes `getUserPlan` and `createCheckoutSession`. The current checkout mutation creates a Stripe session through the integration helper but returns a placeholder string rather than the session URL. This means the browser checkout redirect is not complete in the current implementation.

## Schema inconsistency to resolve

The current `Quota` model declares `userId` as unique while also storing year and month. This permits one quota row per user, not one row per user per month.

The current usage lookup filters by user, year, and month. These two choices do not describe a coherent historical monthly ledger. Before relying on quota accounting, choose one of the following models:

### Option A: One mutable current-period row

Keep a single quota row per user and update its year, month, and count at rollover. The update must be atomic and safe under concurrent event ingestion. Historical monthly reporting is not available from this table.

### Option B: A monthly usage ledger

Allow multiple rows per user and enforce uniqueness on `(userId, year, month)`. Create or increment the matching period row transactionally. This supports historical usage reporting and explicit period boundaries.

Do not change the constraint without reviewing existing data and creating a safe migration.

## Concurrency and accounting requirements

A correct quota implementation should:

- Define the timezone used to determine a billing month.
- Define whether usage is counted at request acceptance, event persistence, or successful delivery.
- Prevent concurrent requests from exceeding the configured limit.
- Make duplicate requests idempotent where clients may retry.
- Use a transaction or atomic database operation for count increments.
- Define behavior when the quota row does not yet exist.
- Define how plan changes affect the current billing period.
- Record enough information to explain usage disputes.

A read-then-write counter without transaction or atomic update semantics can lose increments under concurrent requests.

## Stripe integration boundary

The Stripe helper creates a Checkout Session in payment mode and attaches the local user ID as metadata. It uses a configured price identifier and application URL values.

Before enabling paid access in production:

1. Store Stripe secret credentials only on the server.
2. Confirm the configured price ID belongs to the intended Stripe product and environment.
3. Return the actual checkout session URL to the authenticated client.
4. Register a webhook endpoint and verify the signature against the raw request body.
5. Persist provider event IDs and process each event idempotently.
6. Reconcile the provider's authoritative payment/subscription state with the local user plan.
7. Define refunds, failed payments, cancellations, disputes, and plan downgrades.
8. Test all paths in Stripe test mode.

A successful browser redirect is not proof of payment. The local `Plan` value must not be upgraded solely from a query parameter or client-side success page.

## Operational checklist

- [ ] Quota period and timezone are defined.
- [ ] Quota schema uniqueness matches the chosen model.
- [ ] Counter updates are atomic and concurrency-tested.
- [ ] Plan limits are centralized and documented.
- [ ] Plan changes have a defined effective time.
- [ ] Stripe price IDs are environment-specific and verified.
- [ ] Checkout returns a valid session URL.
- [ ] Webhook signatures are verified.
- [ ] Duplicate provider events are idempotent.
- [ ] Refund and cancellation behavior is defined.
- [ ] Usage and billing changes are auditable.
