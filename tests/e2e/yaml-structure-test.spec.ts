import { test, expect, request } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
const STUDIO = process.env.STUDIO_BASE_URL || 'http://localhost:5173';

async function devLogin(api: any) {
  const r = await api.post(`${API_BASE}/auth/login`, { data: { email: 'dev@auren.local', role: 'OWNER' } });
  const body = await r.json(); return body.token || body.jwt || body.accessToken;
}

async function createProject(api: any, token: string) {
  const r = await api.post(`${API_BASE}/projects`, { headers: { Authorization: `Bearer ${token}` }, data: { name: 'E2E Project', ownerId: 'dev-owner' } });
  const j = await r.json(); return j.id;
}

async function createComponent(api: any, token: string, projectId: string) {
  const r = await api.post(`${API_BASE}/components`, { headers: { Authorization: `Bearer ${token}` }, data: { projectId, name: 'Deals', fields: [{ key:'title', type:'text', label:'Title', required:true }, { key:'amount', type:'number', label:'Amount' }] } });
  const j = await r.json(); return j.id;
}

test('yaml structure test', async ({ page }) => {
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
  
  // Get the original YAML content
  const yamlEditor = page.getByTestId('yaml-editor');
  const originalContent = await yamlEditor.textContent();
  console.log('Original YAML content:', originalContent);
  
  // Try to add a comment at the very end
  await yamlEditor.click();
  await page.waitForTimeout(1000);
  
  // Go to the very end and add a comment
  await page.keyboard.press('End');
  await page.keyboard.press('End');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.type('# Test comment');
  
  await page.waitForTimeout(2000);
  
  // Check save button state
  const saveButton = page.getByTestId('save-button');
  const isEnabled = await saveButton.isEnabled();
  console.log('Save button enabled after adding comment:', isEnabled);
  
  // Check for YAML errors
  const yamlErrorElements = await page.locator('[class*="red-50"], [class*="red-600"]').count();
  console.log('YAML error elements found:', yamlErrorElements);
  
  // Get the modified YAML content
  const modifiedContent = await yamlEditor.textContent();
  console.log('Modified YAML content:', modifiedContent);
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/yaml-structure-test.png' });
});
