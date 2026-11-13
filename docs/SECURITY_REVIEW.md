# Security Review and Known Risks

## Scope and method

This is a source-level review of the repository structure and selected server, schema, and integration files. It is not a penetration test, a review of the live deployment, or a guarantee that every code path has been inspected. Reassess these findings whenever the relevant implementation changes.

## Findings requiring attention

### 1. CORS is enabled without an explicit origin policy

**Evidence:** `src/server/index.ts` composes the Hono app with `cors()` and does not pass an origin allowlist.

**Risk:** The effective policy is delegated to middleware defaults. That is not an intentional production trust boundary, especially if browser credentials or authenticated API operations are involved.

**Action:** Configure an explicit allowlist for the deployed application origins. Define credential behavior deliberately and add tests for allowed and rejected origins.

### 2. Payment checkout response is a placeholder

**Evidence:** `src/server/routers/payment-router.ts` calls `createCheckoutSession` but returns the literal URL value `TO BE DONE`.

**Risk:** The checkout session is created but its URL is not returned to the client. The current route cannot complete the expected redirect flow. Creating a session without exposing or otherwise using it can also leave confusing orphaned sessions.

**Action:** Return the session URL only after validating that the session was created. Add Stripe test-mode coverage. Do not grant PRO access from a client redirect; use verified provider events and persisted subscription/payment state.

### 3. Quota uniqueness does not match a monthly ledger

**Evidence:** `prisma/schema.prisma` stores `year` and `month` but declares `userId` as unique.

**Risk:** Only one quota row can exist per user. This is incompatible with retaining one row per user per month and can make historical accounting or month rollover incorrect.

**Action:** Decide whether quota is a single mutable current-period row or a historical ledger. For a ledger, use a composite uniqueness rule such as user, year, and month, then migrate and update all read/write paths. Test concurrent increments and month boundaries.

### 4. API-key lifecycle is not represented

**Evidence:** The User model stores a unique `apiKey`; the private middleware looks up the supplied bearer token directly.

**Risk:** The schema and middleware do not establish rotation, revocation, expiration, one-time display, or key scoping. A leaked key may remain valid until the stored value changes.

**Action:** Define a key lifecycle. Prefer storing a cryptographic hash rather than a reusable plaintext credential, show the secret once, support rotation/revocation, and never log Authorization headers. Add rate limits and audit events.

### 5. Invalid bearer credentials fall through to Clerk

**Evidence:** `src/server/procedures.ts` attempts API-key lookup and, if no user is found, proceeds to Clerk session lookup.

**Risk:** The behavior may be surprising for clients that expect an invalid bearer credential to fail immediately. It can also obscure client configuration errors.

**Action:** Specify the authentication precedence and failure semantics. Consider rejecting malformed or invalid bearer credentials explicitly, while preserving the intended session-only behavior when no Authorization header is supplied.

### 6. Account synchronization depends on a public procedure

**Evidence:** `getDatabaseSyncStatus` is a public procedure that reads the current Clerk user and creates a local User record when one is missing.

**Risk:** Account provisioning is coupled to a client-invoked synchronization request. The route should be reviewed for repeated calls, missing email addresses, race conditions, and duplicate creation under concurrent requests.

**Action:** Prefer a reliable server-side provisioning lifecycle, such as a verified identity-provider webhook plus an idempotent synchronization path. Handle missing email values and unique-constraint races safely.

### 7. User-supplied Discord identifier has limited validation

**Evidence:** `setDiscordID` validates only a maximum string length of 20.

**Risk:** The value is not validated against the expected Discord identifier format or verified as belonging to the authenticated user.

**Action:** Validate the expected identifier format and, where the workflow requires it, verify ownership through an explicit account-linking process.

## Additional controls to verify

- Every event and category query must include the authenticated local user's ownership scope.
- Category IDs supplied by clients must be checked against the current user before association.
- Event JSON fields need size and shape limits.
- Public ingestion endpoints need rate limits and abuse controls.
- Payment webhooks must verify signatures and process duplicate events idempotently.
- Provider errors must not return secrets or raw stack traces.
- Database credentials should use least privilege.
- Production logs should redact tokens, emails where appropriate, and private event payloads.
- The deployed environment must restrict allowed origins and configure secure cookies.
- Dependency updates should be reviewed and applied regularly.

## Remediation priority

| Priority | Issue | Reason |
|---|---|---|
| Critical before payment launch | Checkout URL placeholder and webhook verification | Payment flow is incomplete unless server-side state is reconciled |
| High | CORS policy | Public API trust boundary |
| High | API-key lifecycle and rate limiting | Credential compromise and abuse exposure |
| High | Ownership checks across every user-scoped operation | Prevent cross-account data access |
| High | Quota uniqueness and concurrency | Usage and billing correctness |
| Medium | Account synchronization race handling | Reliability during sign-up |
| Medium | Discord identifier verification | Prevent incorrect account linking |

## Review discipline

This file records findings, not completed fixes. Update each finding only after the implementation is changed and a relevant test or deployment verification demonstrates the fix.
