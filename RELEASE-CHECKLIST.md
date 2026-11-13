# Release Checklist

## Scope and review

- [ ] Confirm the release scope and review all changed files.
- [ ] Review API contract and compatibility changes.
- [ ] Review user ownership and authentication behavior.
- [ ] Review new dependencies and security advisories.
- [ ] Update CHANGELOG.md and relevant documentation.

## Validation

- [ ] `npm ci` succeeds from the committed lockfile.
- [ ] `npx prisma validate` succeeds.
- [ ] `npx prisma generate` succeeds.
- [ ] `npx tsc --noEmit` succeeds.
- [ ] `npm run lint` succeeds.
- [ ] `npm run build` succeeds in the intended deployment environment.
- [ ] Relevant automated and manual tests are recorded.
- [ ] Cross-user authorization tests cover affected resources.

## Database

- [ ] Schema changes include a reviewed migration.
- [ ] Migration tested against a disposable database.
- [ ] Backup and recovery implications reviewed.
- [ ] Unique constraints and relation deletion behavior reviewed.
- [ ] No destructive reset command is part of the production release.

## Configuration and providers

- [ ] Required environment variables are documented.
- [ ] Production secrets are configured outside source control.
- [ ] Clerk production URLs and credentials are correct.
- [ ] CORS allowlist is explicit.
- [ ] Stripe price and webhook configuration are verified if billing is enabled.
- [ ] Redis and Discord are configured or intentionally disabled.

## Deployment and verification

- [ ] The target runtime is explicitly selected, Next.js hosting or Wrangler.
- [ ] Build and runtime compatibility verified for that target.
- [ ] Migrations applied through the approved process.
- [ ] Authentication and database smoke tests pass.
- [ ] Logs do not expose credentials or private payloads.
- [ ] Rollback or recovery procedure is understood.
- [ ] Release notes accurately describe implemented behavior and limitations.
