# Development Workflow

## Stack and repository conventions

PingPanda is a TypeScript application built with Next.js App Router, React, Hono, Clerk, Prisma, and PostgreSQL. The repository uses npm and commits `package-lock.json`. Use npm commands so local development and CI resolve the same dependency graph.

## Setup

```bash
git clone https://github.com/Brajesh31/PingPanda_AI_SaaS_Monitoring_Platform.git
cd PingPanda_AI_SaaS_Monitoring_Platform
npm ci
cp .env.example .env
```

Fill in the local service credentials required by the code paths being developed. The checked-in environment example is intentionally a placeholder, not a complete production configuration.

## Run the application

```bash
npm run dev
```

Use the URL printed by Next.js. Do not assume every page or API operation is usable until Clerk, PostgreSQL, and any relevant provider credentials are configured.

## Useful commands

```bash
npm run lint
npx tsc --noEmit
npx prisma validate
npx prisma generate
npx prisma format
npm run build
```

The package scripts do not currently define a unit-test command. See [TESTING.md](TESTING.md) for the present CI scope and recommended test coverage.

## Where code belongs

| Concern | Location |
|---|---|
| Next.js routes and layouts | `src/app` |
| Shared UI | `src/components` |
| Client hooks | `src/hooks` |
| Shared helpers and integrations | `src/lib` |
| Database client | `src/db.ts` |
| Hono composition | `src/server/index.ts` |
| Authentication middleware and procedures | `src/server/procedures.ts` |
| Domain API routers | `src/server/routers` |
| Database schema | `prisma/schema.prisma` |

## Adding a server procedure

1. Select the domain router that owns the operation.
2. Define a Zod input schema for client-controlled values.
3. Use a public procedure only when the operation genuinely requires no authenticated local user.
4. For private operations, use authenticated server context and scope data by `ctx.user.id`.
5. Check category and event ownership before linking or mutating records.
6. Handle missing records and provider failures with safe, predictable errors.
7. Add tests for unauthorized and cross-user access.
8. Update the API reference.

## Changing the database

1. Write down the intended data rule and ownership model.
2. Update the Prisma schema.
3. Run `npx prisma format` and `npx prisma validate`.
4. Create a migration against a disposable development database.
5. Inspect the SQL and its impact on existing records.
6. Test migration and rollback/recovery assumptions.
7. Update data model and operations documentation.

Do not use a destructive reset against a shared or production database.

## Configuration changes

When code starts reading a new environment variable:

- Add a blank or safe example value to `.env.example`.
- Document whether it is required and which runtime consumes it.
- Keep secrets server-side.
- Never include a real credential in a commit, issue, test fixture, or screenshot.

## Pull request expectations

Keep changes focused. Include affected routes and data models, authorization implications, migration steps, environment changes, tests run, and known limitations. See [CONTRIBUTING.md](../CONTRIBUTING.md).
