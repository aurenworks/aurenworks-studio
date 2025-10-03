# Studio E2E Setup (API container + Playwright)

This bundle helps you run end-to-end tests for aurenworks-studio against a containerized aurenworks-api.

## Start the stack
```bash
docker compose -f docker-compose.dev.yml up --build -d
# API at http://localhost:3000; Postgres at localhost:5432
```

## Run Studio pointing to the containerized API
```bash
cp .env.studio.example ../aurenworks-studio/.env.local
# ensure VITE_API_BASE_URL=http://localhost:3000
# then in the Studio repo:
pnpm dev
```

## Seed sample data (optional)
```bash
API_BASE=http://localhost:3000 ./seed.sh
```

## Install and run Playwright E2E (in Studio repo)
```bash
pnpm add -D @playwright/test
pnpm dlx playwright install

STUDIO_BASE_URL=http://localhost:5173 API_BASE_URL=http://localhost:3000   pnpm playwright test tests/e2e/edit-component-concurrency.spec.ts
```
Adjust selectors and routes in the spec to your actual UI.
