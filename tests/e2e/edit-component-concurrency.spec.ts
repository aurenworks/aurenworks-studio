import { test, request, expect } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
const STUDIO_BASE_URL = process.env.STUDIO_BASE_URL || 'http://localhost:5173';

async function devLogin(api: any) {
  const r = await api.post(`${API_BASE}/auth/login`, {
    data: { email: 'dev@auren.local', role: 'OWNER' },
  });
  const body = await r.json();
  return body.token || body.jwt || body.accessToken;
}

async function createProject(api: any, token: string) {
  const r = await api.post(`${API_BASE}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: 'E2E Concurrency Test Project', ownerId: 'dev-owner' },
  });
  const j = await r.json();
  return j.id;
}

async function createComponent(api: any, token: string, projectId: string) {
  const r = await api.post(`${API_BASE}/projects/${projectId}/components`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      name: 'Test Component',
      type: 'api',
      status: 'active',
      fields: [
        { key: 'title', type: 'text', label: 'Title', required: true },
        { key: 'amount', type: 'number', label: 'Amount' },
      ],
    },
  });
  const j = await r.json();
  return j.id;
}

test('optimistic concurrency: second editor sees conflict and reloads latest', async ({
  browser,
}) => {
  // Setup: Create project and component
  const api = await request.newContext();
  const token = await devLogin(api);
  const projectId = await createProject(api, token);
  const componentId = await createComponent(api, token, projectId);

  // 1. Both editors load the same component simultaneously
  const p1 = await browser.newPage();
  const p2 = await browser.newPage();

  // Set auth token in both pages
  await p1.addInitScript(token => {
    localStorage.setItem('auth_token', token);
  }, token);
  await p2.addInitScript(token => {
    localStorage.setItem('auth_token', token);
  }, token);

  // Navigate both pages to the component editor
  await p1.goto(
    `${STUDIO_BASE_URL}/projects/${projectId}/components/${componentId}`
  );
  await p2.goto(
    `${STUDIO_BASE_URL}/projects/${projectId}/components/${componentId}`
  );

  // Wait for both pages to load
  await p1.waitForLoadState('networkidle');
  await p2.waitForLoadState('networkidle');

  // Wait for the component designer to be visible and form to be ready
  await p1.waitForSelector('h2:has-text("Edit Component")');
  await p2.waitForSelector('h2:has-text("Edit Component")');

  // Wait for the component name input to be visible and ready
  await p1.waitForSelector('[data-testid="component-name"]');
  await p2.waitForSelector('[data-testid="component-name"]');

  // 2. Both editors make changes to their local state
  // Editor 1 changes the name
  await p1.fill('[data-testid="component-name"]', 'Updated by Editor 1');
  // Editor 2 changes the name
  await p2.fill('[data-testid="component-name"]', 'Updated by Editor 2');

  // 3. First editor saves successfully (updates server ETag)
  // Wait for the PUT request to complete
  const [response] = await Promise.all([
    p1.waitForResponse(
      response =>
        response
          .url()
          .includes(`/projects/${projectId}/components/${componentId}`) &&
        response.request().method() === 'PUT'
    ),
    p1.click('button[type="submit"]'),
  ]);

  // Verify the response was successful
  expect(response.status()).toBe(200);

  // Wait for network to be idle to ensure React Query has processed the mutation
  await p1.waitForLoadState('networkidle');

  // Wait for the success toast to appear (toast appears after mutation succeeds)
  // The mutation's onSuccess callback shows the toast, which may happen after the response
  const toast = p1.locator('[data-testid="toast-success"]');
  await expect(toast).toBeVisible({
    timeout: 5000,
  });
  // Verify it contains the expected message
  await expect(toast).toContainText('Component updated successfully!', {
    timeout: 2000,
  });

  // 4. Second editor tries to save (should conflict)
  await p2.click('button[type="submit"]');
  await p2.waitForLoadState('networkidle');

  // 5. Verify conflict resolution modal appears
  await expect(
    p2.locator('[data-testid="conflict-resolution-modal"]')
  ).toBeVisible({ timeout: 5000 });

  // Verify modal content
  await expect(p2.locator('text=Conflict Detected')).toBeVisible();
  await expect(p2.locator('text=Latest Version')).toBeVisible();
  await expect(p2.locator('text=Your Draft')).toBeVisible();

  // 6. Click "Open Latest Version" button
  await p2.click('button:has-text("Open Latest Version")');

  // Wait for the modal to close and form to update
  await p2.waitForSelector('[data-testid="conflict-resolution-modal"]', {
    state: 'hidden',
  });
  await p2.waitForLoadState('networkidle');

  // Verify that the latest version was loaded
  // The component name should now be "Updated by Editor 1"
  await expect(p2.locator('[data-testid="component-name"]')).toHaveValue(
    'Updated by Editor 1',
    { timeout: 5000 }
  );

  // Cleanup
  await p1.close();
  await p2.close();
  await api.dispose();
});
