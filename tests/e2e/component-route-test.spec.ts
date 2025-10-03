import { test, request } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
const STUDIO = process.env.STUDIO_BASE_URL || 'http://localhost:5173';

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
    data: { name: 'E2E Project', ownerId: 'dev-owner' },
  });
  const j = await r.json();
  return j.id;
}

async function createComponent(api: any, token: string, projectId: string) {
  const r = await api.post(`${API_BASE}/components`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      projectId,
      name: 'Deals',
      fields: [
        { key: 'title', type: 'text', label: 'Title', required: true },
        { key: 'amount', type: 'number', label: 'Amount' },
      ],
    },
  });
  const j = await r.json();
  return j.id;
}

test('component route test', async ({ page }) => {
  const api = await request.newContext();
  const token = await devLogin(api);
  const projectId = await createProject(api, token);
  const componentId = await createComponent(api, token, projectId);

  console.log('Project ID:', projectId);
  console.log('Component ID:', componentId);

  // Test navigation to component page
  await page.goto(`${STUDIO}/projects/${projectId}/components/${componentId}`);

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/component-route-test.png' });

  // Check if we can find any elements
  const body = await page.textContent('body');
  console.log('Page content:', body?.substring(0, 500));

  // Check if the component designer is loaded
  const hasComponentDesigner =
    (await page.locator('h2').filter({ hasText: 'Edit Component' }).count()) >
    0;
  console.log('Has component designer:', hasComponentDesigner);

  // Check if we can find the yaml tab
  const hasYamlTab = (await page.getByTestId('yaml-tab').count()) > 0;
  console.log('Has yaml tab:', hasYamlTab);
});
