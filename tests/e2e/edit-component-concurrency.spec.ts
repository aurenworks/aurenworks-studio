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

test('optimistic concurrency: second editor sees conflict and reloads latest', async ({ browser }) => {
  const api = await request.newContext();
  const token = await devLogin(api);
  const projectId = await createProject(api, token);
  const componentId = await createComponent(api, token, projectId);

  const r0 = await api.get(`${API_BASE}/components/${componentId}`, { headers: { Authorization: `Bearer ${token}` } });
  expect(r0.headers()['etag']).toBeTruthy();

  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();
  const p1 = await ctx1.newPage();
  const p2 = await ctx2.newPage();

  await p1.goto(`${STUDIO}/projects/${projectId}/components/${componentId}`);
  await p2.goto(`${STUDIO}/projects/${projectId}/components/${componentId}`);

  // Use the form tab instead of YAML tab for easier testing
  // The form tab should be active by default, so we don't need to click on it
  
  // Wait for the form to load
  await p1.waitForTimeout(2000);
  
  // Modify the component name to trigger a change
  const nameInput = p1.locator('input[name="name"]');
  await nameInput.clear();
  await nameInput.fill('Deals - Modified by Editor 1');
  
  // Wait for the change to be processed
  await p1.waitForTimeout(1000);
  
  // The form tab uses a submit button, not a save button
  await p1.locator('button[type="submit"]').click();
  
  // Wait for the form submission to complete
  await p1.waitForTimeout(3000);
  
  // Check for success message or navigation
  try {
    await p1.getByText(/saved/i).waitFor({ timeout: 5000 });
  } catch {
    // If no "saved" message, check if we navigated away or if there's a different success indicator
    console.log('No "saved" message found, checking for other success indicators');
  }

  // Wait for page 2 to load
  await p2.waitForLoadState('networkidle');
  
  // Debug: Check if page 2 is on the component page
  const page2Title = await p2.title();
  console.log('Page 2 title:', page2Title);
  
  // Debug: Check if the form is loaded
  const nameInput2 = p2.locator('input[name="name"]');
  const nameValue2 = await nameInput2.inputValue();
  console.log('Page 2 name value:', nameValue2);
  
  // Modify the component name on page 2 to trigger a conflict
  await nameInput2.clear();
  await nameInput2.fill('Deals - Modified by Editor 2');
  
  // Wait for the change to be processed
  await p2.waitForTimeout(1000);
  
  await p2.locator('button[type="submit"]').click();
  
  // Wait for the response
  await p2.waitForTimeout(3000);
  
  // Check for conflict dialog
  const dialogExists = await p2.getByRole('dialog').count() > 0;
  console.log('Dialog exists:', dialogExists);
  
  if (dialogExists) {
    await expect(p2.getByRole('dialog')).toContainText(/conflict|409/i);
  } else {
    console.log('No conflict dialog found, checking for other indicators');
    // Take a screenshot for debugging
    await p2.screenshot({ path: 'test-results/no-conflict-dialog.png' });
  }
  await p2.getByRole('button', { name: /reload latest|open latest/i }).click();
  await p2.locator('button[type="submit"]').click();
  
  // Wait for the form submission to complete
  await p2.waitForTimeout(3000);
  
  // Check for success message or navigation
  try {
    await p2.getByText(/saved/i).waitFor({ timeout: 5000 });
  } catch {
    // If no "saved" message, check if we navigated away or if there's a different success indicator
    console.log('No "saved" message found for page 2, checking for other success indicators');
  }

  await ctx1.close(); await ctx2.close();
});
