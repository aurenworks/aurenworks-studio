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

test('yaml editor test', async ({ page }) => {
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

  // Wait for the component designer to load (check for either form or yaml tab)
  await page.waitForSelector(
    '[data-testid="yaml-tab"], [data-testid="form-tab"]',
    { timeout: 10000 }
  );

  // Debug: Check what's actually on the page
  const pageContent = await page.textContent('body');
  console.log('Page content:', pageContent);

  // Check if we have the component designer loaded
  const hasComponentDesigner = await page
    .locator('[data-testid="yaml-tab"], [data-testid="form-tab"]')
    .count();
  console.log('Has component designer:', hasComponentDesigner > 0);

  // If we don't have the component designer, take a screenshot and fail
  if (hasComponentDesigner === 0) {
    await page.screenshot({
      path: 'test-results/yaml-editor-test-no-designer.png',
    });
    throw new Error('Component designer not loaded');
  }

  // Click on YAML tab
  await page.getByTestId('yaml-tab').click();

  // Wait for YAML editor to load
  await page.waitForTimeout(2000);

  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/yaml-editor-test.png' });

  // Check if YAML editor is visible
  const yamlEditor = page.getByTestId('yaml-editor');
  const isVisible = await yamlEditor.isVisible();
  console.log('YAML editor visible:', isVisible);

  // Check if save button is enabled
  const saveButton = page.getByTestId('save-button');
  const isEnabled = await saveButton.isEnabled();
  console.log('Save button enabled:', isEnabled);

  // Check for any error messages
  const errorElements = await page
    .locator('[class*="error"], [class*="red"]')
    .count();
  console.log('Error elements found:', errorElements);

  // Try to click on YAML editor
  try {
    await yamlEditor.click();
    console.log('Successfully clicked on YAML editor');
  } catch (error) {
    console.log('Failed to click on YAML editor:', error);
  }
});
