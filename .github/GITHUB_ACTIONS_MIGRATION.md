# CircleCI to GitHub Actions Migration Guide

This document outlines the migration from CircleCI to GitHub Actions for the Wishlist project.

## Overview

The migration replaces the CircleCI setup with two GitHub Actions workflows:

1. **CI Workflow** (`.github/workflows/ci.yml`) - Runs on all PRs and pushes to main
2. **Build and Deploy Workflow** (`.github/workflows/deploy.yml`) - Builds and deploys affected apps on main branch

## Workflows

### CI Workflow

**Triggers:** Pull requests and pushes to main branch

**Jobs:**
- `install-dependencies` - Installs and caches dependencies
- `check` - Runs Biome code quality checks
- `typecheck` - Runs TypeScript type checking (Nx affected)
- `test-unit` - Runs unit tests (Nx affected)
- `test-int` - Runs integration tests with Testcontainers (Nx affected)
- `detect-affected` - Determines which apps are affected for downstream workflows

**Key Features:**
- Uses Nx affected commands to only run tests/checks for changed code
- Caches node_modules for faster subsequent runs
- Uploads test results as artifacts
- Testcontainers work natively in GitHub Actions (no special setup needed)

### Build and Deploy Workflow

**Triggers:** After CI workflow completes successfully on main branch

**Jobs:**

#### API Pipeline (when API is affected):
1. `build-api-docker` - Builds Docker image (non-main branches, no push)
2. `build-and-publish-api-docker` - Builds and publishes to Docker Hub (main branch only)
3. `deploy-api-approval` - Manual approval gate for production deployment
4. `deploy-api` - Deploys to OVH server via SSH

#### Frontend Pipeline (when frontend is affected):
1. `build-front` - Builds frontend application
2. `deploy-front-approval` - Manual approval gate for production deployment
3. `deploy-front` - Deploys to Firebase

## Required GitHub Secrets

The following secrets need to be configured in the GitHub repository settings:

### Docker Hub (for API deployment)
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password or access token

### OVH Server (for API deployment)
- `OVH_SERVER_URL` - OVH server hostname/IP
- `OVH_SERVER_USER` - SSH username for OVH server
- `OVH_SERVER_SSH_KEY` - Private SSH key for authentication
- `OVH_SERVER_PORT` - SSH port number

### Firebase (for frontend deployment)
- `FIREBASE_TOKEN` - Firebase authentication token (or use service account)
- `FIREBASE_JSON` - Firebase service account JSON (for service account auth)

### Optional
- `NX_CLOUD_ACCESS_TOKEN` - Nx Cloud access token for distributed caching (optional but recommended)

## Environment Configuration

Two GitHub Environments need to be created for manual approvals:

1. **production-api** - Requires manual approval before API deployment
2. **production-frontend** - Requires manual approval before frontend deployment

To create these:
1. Go to repository Settings → Environments
2. Create each environment
3. Add required reviewers for approval

## Key Differences from CircleCI

### Testcontainers
- **CircleCI:** Required `setup_remote_docker` and custom Python script (`autoforward.py`) for port forwarding
- **GitHub Actions:** Works natively with Docker, no special setup needed

### Workspace/Artifacts
- **CircleCI:** Used workspaces (`persist_to_workspace`, `attach_workspace`)
- **GitHub Actions:** Uses cache for dependencies, artifacts for build outputs

### Nx Affected Detection
- **CircleCI:** Used `nx/set-shas` orb with continuation workflow
- **GitHub Actions:** Uses `nrwl/nx-set-shas` action with job outputs for conditional execution

### Manual Approvals
- **CircleCI:** Used `type: approval` jobs
- **GitHub Actions:** Uses GitHub Environments with required reviewers

### Caching
- **CircleCI:** Manual cache management with `save_cache`/`restore_cache`
- **GitHub Actions:** Uses `actions/cache` with automatic key generation

## Migration Steps

1. **Add GitHub Secrets:** Configure all required secrets in repository settings
2. **Create Environments:** Set up production-api and production-frontend environments with reviewers
3. **Enable Workflows:** Merge the new workflow files to main branch
4. **Test CI:** Create a test PR to verify CI workflow runs correctly
5. **Test Deployment:** After merging to main, verify build and deploy workflow with manual approvals
6. **Remove CircleCI:** Once verified, remove `.circleci` directory and disable CircleCI project

## Advantages of GitHub Actions

1. **No external service:** Everything runs within GitHub
2. **Better integration:** Native access to PR/issue data, GitHub CLI, etc.
3. **Simpler Testcontainers setup:** No port forwarding script needed
4. **Built-in approval gates:** Using GitHub Environments
5. **Better caching:** Automatic cache key generation
6. **Cost:** Free for public repositories, generous free tier for private repos

## Files to Remove After Migration

Once the GitHub Actions workflows are verified:
- `.circleci/config.yml`
- `.circleci/continuation.yml`
- `.circleci/autoforward.py`
- Entire `.circleci/` directory

## Troubleshooting

### Integration tests failing
- Check Docker is available: `docker --version`
- Verify TESTCONTAINERS_HOST_OVERRIDE is set correctly
- Check test container logs in GitHub Actions output

### Nx affected not detecting changes
- Ensure `fetch-depth: 0` is set in checkout action
- Verify `nrwl/nx-set-shas` action is configured correctly
- Check NX_BASE and NX_HEAD environment variables

### Deployment approval not required
- Verify GitHub Environment is created
- Add required reviewers to the environment
- Check branch protection rules

### Docker build failing
- Verify Dockerfile path is correct
- Check build context in docker/build-push-action
- Review build logs for specific errors

## Testing Checklist

- [ ] CI workflow runs on pull requests
- [ ] Unit tests execute only for affected projects
- [ ] Integration tests execute successfully
- [ ] Biome checks run and report correctly
- [ ] TypeScript checks validate properly
- [ ] Build workflow detects affected apps correctly
- [ ] Docker image builds successfully for API
- [ ] Frontend builds successfully
- [ ] Manual approval gates work for deployments
- [ ] API deploys to OVH server correctly
- [ ] Frontend deploys to Firebase correctly
