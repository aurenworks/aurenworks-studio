# E2E Testing with GitHub Workflows

This document explains how to set up and run end-to-end tests using GitHub Actions workflows.

## Overview

We provide three different GitHub workflow configurations for E2E testing:

1. **Simple E2E Tests** (`.github/workflows/e2e-tests-simple.yml`)
   - Quick setup with mock API
   - 20-minute timeout
   - Good for basic testing

2. **Advanced E2E Tests** (`.github/workflows/e2e-tests-advanced.yml`)
   - Attempts to use real API if available
   - Fallback to mock API
   - 45-minute timeout
   - More comprehensive testing

3. **CI Pipeline** (`.github/workflows/ci.yml`)
   - Full CI/CD pipeline including E2E tests
   - Runs unit tests first, then E2E tests
   - 30-minute timeout for E2E portion

## Prerequisites

### Repository Setup

1. **API Repository Access**: The workflows attempt to access the `aurenworks-api` repository. Ensure:
   - The API repository is in the same GitHub organization
   - The `GITHUB_TOKEN` has access to the API repository
   - Or configure a custom token in GitHub Secrets

2. **Environment Variables**: Configure these in your repository settings:
   ```
   API_REPOSITORY=aurenworks-api  # Optional: custom API repo name
   API_BRANCH=main                # Optional: custom API branch
   ```

### Local Development

For local E2E testing, use the existing setup:

```bash
# Start the API and database
docker compose -f docker-compose.dev.yml up --build -d

# Start the Studio
pnpm dev

# Run E2E tests
pnpm test:e2e
```

## Workflow Features

### Environment Configuration

All workflows use these environment variables:
- `STUDIO_BASE_URL`: http://localhost:5173
- `API_BASE_URL`: http://localhost:3000
- `DATABASE_URL`: postgres://postgres:postgres@localhost:5432/aurenworks

### Services

- **PostgreSQL 15**: Database service with health checks
- **API Service**: Real API (if available) or mock API
- **Studio Service**: Built and served via Vite preview

### Test Data

- Uses `seed.sh` script to create test data
- Fallback to mock data if seeding fails
- Supports both real and mock API scenarios

### Artifacts

- **Test Reports**: HTML reports from Playwright
- **Videos**: Test recordings on failure
- **Screenshots**: Failure screenshots

## Running Tests

### GitHub Actions

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

### Local Testing

```bash
# Install Playwright
pnpm test:e2e:install

# Run all E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug
```

## Configuration

### Playwright Configuration

The `playwright.config.ts` file is configured for:
- 60-second timeout per test
- Chromium browser
- Video recording on failure
- Trace on first retry

### Mock API

When the real API is not available, a mock API server is started that:
- Handles CORS properly
- Provides mock endpoints for authentication
- Returns realistic test data
- Supports the optimistic concurrency test

## Troubleshooting

### Common Issues

1. **API Not Available**: The workflows will fall back to mock API
2. **Database Connection**: Ensure PostgreSQL service is healthy
3. **Timeout Issues**: Increase timeout in workflow files
4. **Test Failures**: Check artifacts for videos and screenshots

### Debugging

1. **Check Workflow Logs**: Look for service startup messages
2. **Review Artifacts**: Download and examine test reports
3. **Local Reproduction**: Run tests locally with same environment
4. **Service Health**: Verify all services are running

## Best Practices

1. **Keep Tests Fast**: Optimize test execution time
2. **Use Mocks When Appropriate**: Don't always require real API
3. **Handle Flakiness**: Add retries and better waits
4. **Monitor Resources**: Watch for memory/timeout issues
5. **Update Regularly**: Keep dependencies and workflows current

## Future Improvements

- [ ] Add Firefox and WebKit browser support
- [ ] Implement parallel test execution
- [ ] Add performance testing
- [ ] Create test data factories
- [ ] Add visual regression testing
- [ ] Implement test result notifications
