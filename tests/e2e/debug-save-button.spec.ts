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

test('debug save button', async ({ page }) => {
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

  // Click on YAML tab
  await page.getByTestId('yaml-tab').click();

  // Wait for YAML editor to load
  await page.waitForTimeout(3000);

  // Check save button state
  const saveButton = page.getByTestId('save-button');
  const isEnabled = await saveButton.isEnabled();
  const isDisabled = await saveButton.isDisabled();
  const buttonText = await saveButton.textContent();
  const buttonClasses = await saveButton.getAttribute('class');

  console.log('Save button enabled:', isEnabled);
  console.log('Save button disabled:', isDisabled);
  console.log('Save button text:', buttonText);
  console.log('Save button classes:', buttonClasses);

  // Check for YAML errors
  const yamlErrorElements = await page
    .locator('[class*="red-50"], [class*="red-600"]')
    .count();
  console.log('YAML error elements found:', yamlErrorElements);

  // Check for any error messages in the page
  const allErrorElements = await page
    .locator('[class*="error"], [class*="red"], [class*="invalid"]')
    .count();
  console.log('All error elements found:', allErrorElements);

  // Check if there are any console errors
  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleLogs.push(msg.text());
    }
  });

  // Try to click on YAML editor and type
  await page.getByTestId('yaml-editor').click();
  await page.waitForTimeout(1000);

  await page.keyboard.press('End');
  await page.keyboard.type('\n# test change');
  await page.waitForTimeout(2000);

  // Check save button state after typing
  const isEnabledAfter = await saveButton.isEnabled();
  const isDisabledAfter = await saveButton.isDisabled();

  console.log('Save button enabled after typing:', isEnabledAfter);
  console.log('Save button disabled after typing:', isDisabledAfter);

  // Check for any new error messages
  const yamlErrorElementsAfter = await page
    .locator('[class*="red-50"], [class*="red-600"]')
    .count();
  console.log('YAML error elements after typing:', yamlErrorElementsAfter);

  // Log any console errors
  if (consoleLogs.length > 0) {
    console.log('Console errors:', consoleLogs);
  }

  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/debug-save-button.png' });
});
