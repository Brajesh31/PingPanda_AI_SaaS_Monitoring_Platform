# PingPanda API Structure Reference

## Scope

This guide documents the API composition visible in the repository. It is not a complete OpenAPI specification. Exact procedure names, input schemas, and response types remain defined in the router implementations.

## Base path and router registration

The Hono application uses the `/api` base path and registers these routers:

| Prefix | Module | Responsibility |
|---|---|---|
| `/api/auth` | auth-router | Authentication-related procedures |
| `/api/category` | category-router | Event category management |
| `/api/payment` | payment-router | Payment operations |
| `/api/project` | project-router | Project and event operations |

The Next.js API adapter forwards requests to the Hono handler.

## Authentication

Private procedures use shared middleware. It attempts bearer API-key lookup against the local User record. If that does not resolve a user, it attempts Clerk session resolution and looks up the local record by external identity ID. A Clerk identity without a corresponding local User record is not sufficient for private operations.

## Procedure documentation standard

Each procedure should document its router and name, public/private status, input schema, ownership checks, response shape, validation errors, external side effects, and retry/idempotency behavior.

## Error categories

Use consistent behavior for unauthenticated requests, missing local accounts, missing resources, cross-user access, invalid input, quota restrictions, provider failures, and unexpected server failures. Do not return raw stack traces or secrets to clients.

## Ownership rules

Resolve the user from authenticated server context. Do not trust client-supplied user IDs. Queries for projects, categories, and events must include ownership constraints.

## API key handling

API keys are credentials. Do not log Authorization headers, expose keys in browser code, or include them in error messages. A production lifecycle should define generation, one-time display, rotation, revocation, and auditability.

## Adding an endpoint

1. Select the appropriate domain router.
2. Define and validate the input schema.
3. Choose public or private procedure explicitly.
4. Enforce ownership, plan, and quota rules.
5. Implement database access and external effects.
6. Define safe errors and retry behavior.
7. Test unauthorized and cross-user access.
8. Register new routers in the central Hono composition module.
9. Update this guide and the root README.

## Contract stability

Treat request and response changes as compatibility changes. Prefer additive changes and document deprecations with a migration window.
