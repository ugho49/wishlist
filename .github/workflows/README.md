# CI / CD (GitHub Actions)

This replaces the previous CircleCI setup (`.circleci/`).

## Workflows

| File | Trigger | Purpose |
| --- | --- | --- |
| `pr-checks.yml` | `pull_request` → `main`, and `workflow_call` | Install, biome check, typecheck, unit tests, integration tests, API codegen check, API Docker build, front build. Computes the calendar version and the Nx affected projects. |
| `deployments.yml` | `push` → `main` | Runs `pr-checks` (which pushes the API image + builds the front), then deploys whatever is affected. **No manual approval** — merge to `main` deploys automatically. |
| `deploy-api.yml` | `workflow_call` | Runs Drizzle migrations, **then** deploys the API to the VPS (Dokploy), then creates an `api@<version>` GitHub release. |
| `deploy-front.yml` | `workflow_call` | Deploys the front bundle to Firebase Hosting, then creates a `front@<version>` GitHub release. |

The `claude.yml` / `claude-code-review.yml` workflows are unrelated and left untouched.

## Affected-based execution

`nrwl/nx-set-shas` + `nx affected` only run checks/deploys for projects touched by the
change. `deploy-api` runs when `api` is affected; `deploy-front` runs when `front` is affected.

## Versioning

Calendar version `YYYY.MM.DD.<short_sha>` (same scheme as before). Used as the Docker image
tag, the `VITE_APP_VERSION` of the front bundle, and the GitHub release tag.

## Required secrets

Set these as repository secrets (and/or on the `production` environment for the deploy jobs):

### Docker Hub (API image push)
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

### VPS / Dokploy (API deploy)
- `VPS_API_URL`
- `VPS_API_KEY`
- `DOKPLOY_API_APPLICATION_ID`

### Database (Drizzle migrations — `production` environment)
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`

> The runner connects directly to the database to run migrations, so it must be reachable
> from GitHub-hosted runners (no Tailscale).

### Firebase (front deploy)
- `FIREBASE_SERVICE_ACCOUNT` — the service-account JSON (the previous `FIREBASE_JSON`).

The built-in `GITHUB_TOKEN` is used to create releases (no GitHub App token needed).
