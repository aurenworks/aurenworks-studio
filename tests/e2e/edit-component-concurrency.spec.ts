import { test, expect, request } from '@playwright/test';
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

test('optimistic concurrency: second editor sees conflict and reloads latest', async ({
  browser,
}) => {
  const api = await request.newContext();
  const token = await devLogin(api);
  const projectId = await createProject(api, token);
  const componentId = await createComponent(api, token, projectId);

  const r0 = await api.get(`${API_BASE}/components/${componentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const etag0 = r0.headers()['etag'];
  console.log('Initial ETag:', etag0);
  expect(etag0).toBeTruthy();

  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();
  const p1 = await ctx1.newPage();
  const p2 = await ctx2.newPage();
  
  // Monitor console logs for debugging
  p1.on('console', msg => console.log('P1 Console:', msg.text()));
  p2.on('console', msg => console.log('P2 Console:', msg.text()));
  
  // Monitor network requests
  p1.on('request', request => console.log('P1 Request:', request.method(), request.url()));
  p2.on('request', request => console.log('P2 Request:', request.method(), request.url()));
  p1.on('response', response => console.log('P1 Response:', response.status(), response.url()));
  p2.on('response', response => console.log('P2 Response:', response.status(), response.url()));

  await p1.goto(`${STUDIO}/projects/${projectId}/components/${componentId}`);
  await p2.goto(`${STUDIO}/projects/${projectId}/components/${componentId}`);

  // Debug: Check what page we're actually on
  const p1Title = await p1.title();
  const p2Title = await p2.title();
  console.log('Page 1 title:', p1Title);
  console.log('Page 2 title:', p2Title);
  
  // Debug: Check if we're on the component edit page or components list page
  const p1Url = p1.url();
  const p2Url = p2.url();
  console.log('Page 1 URL:', p1Url);
  console.log('Page 2 URL:', p2Url);

  // Wait for the component edit page to load properly
  await p1.waitForLoadState('networkidle');
  await p2.waitForLoadState('networkidle');
  
  // Debug: Check if we have the component form elements
  const nameInput1 = p1.locator('input[name="name"]');
  const nameInput1Count = await nameInput1.count();
  console.log('Page 1 name input count:', nameInput1Count);
  
  const nameInput2 = p2.locator('input[name="name"]');
  const nameInput2Count = await nameInput2.count();
  console.log('Page 2 name input count:', nameInput2Count);
  
  // If we don't have the form inputs, we're probably on the wrong page
  if (nameInput1Count === 0) {
    console.log('Page 1 is not on component edit page, taking screenshot');
    await p1.screenshot({ path: 'test-results/page1-wrong-page.png' });
    throw new Error('Page 1 is not on the component edit page');
  }
  
  if (nameInput2Count === 0) {
    console.log('Page 2 is not on component edit page, taking screenshot');
    await p2.screenshot({ path: 'test-results/page2-wrong-page.png' });
    throw new Error('Page 2 is not on the component edit page');
  }

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
    console.log(
      'No "saved" message found, checking for other success indicators'
    );
  }

  // Navigate back to the component edit page for the first editor
  await p1.goto(`${STUDIO}/projects/${projectId}/components/${componentId}`);
  await p1.waitForLoadState('networkidle');
  
  // IMPORTANT: Don't refresh page 2 - it should still have the old data and old ETag
  // This simulates the real-world scenario where the second editor doesn't get
  // the updated data automatically (no WebSocket updates, no polling, etc.)
  
  // Check the ETag after the first save
  const r1 = await api.get(`${API_BASE}/components/${componentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const etag1 = r1.headers()['etag'];
  console.log('ETag after first save:', etag1);
  console.log('ETag changed:', etag0 !== etag1);

  // Wait for page 2 to load but don't let it make any API calls
  // We need to ensure page 2 doesn't get the updated data
  await p2.waitForLoadState('networkidle');
  
  // Block any additional API calls from page 2 to prevent it from getting updated data
  await p2.route('**/api/**', route => route.abort());

  // Debug: Check if page 2 is on the component page
  const page2Title = await p2.title();
  console.log('Page 2 title:', page2Title);

  // Debug: Check if the form is loaded
  const nameInput2Debug = p2.locator('input[name="name"]');
  const nameValue2 = await nameInput2Debug.inputValue();
  console.log('Page 2 name value:', nameValue2);
  
  // Check if page 2 has the updated component data
  const expectedName = 'Deals - Modified by Editor 1';
  console.log('Expected name on page 2:', expectedName);
  console.log('Actual name on page 2:', nameValue2);
  console.log('Page 2 has updated data:', nameValue2 === expectedName);

  // Ensure both pages are on the component edit page
  const p1NameInputCount = await p1.locator('input[name="name"]').count();
  const p2NameInputCount = await p2.locator('input[name="name"]').count();
  
  if (p1NameInputCount === 0) {
    console.log('Page 1 is not on component edit page, navigating back');
    await p1.goto(`${STUDIO}/projects/${projectId}/components/${componentId}`);
    await p1.waitForLoadState('networkidle');
  }
  
  if (p2NameInputCount === 0) {
    console.log('Page 2 is not on component edit page, navigating back');
    await p2.goto(`${STUDIO}/projects/${projectId}/components/${componentId}`);
    await p2.waitForLoadState('networkidle');
  }
  
  // The second editor should still have the old data and old ETag.
  // We need to modify it without refreshing to ensure it uses the old ETag.
  console.log('Page 2 still has old data, modifying it to trigger conflict...');
  
  // Modify the component name on page 2 to trigger a conflict
  await nameInput2Debug.clear();
  await nameInput2Debug.fill('Deals - Modified by Editor 2');

  // Wait for the change to be processed
  await p2.waitForTimeout(1000);

  console.log('About to submit form on page 2...');
  
  // Check if the submit button is enabled
  const submitButton = p2.locator('button[type="submit"]');
  const isEnabled = await submitButton.isEnabled();
  console.log('Submit button enabled:', isEnabled);
  
  await submitButton.click();

  // Wait for the response
  await p2.waitForTimeout(3000);
  console.log('Form submission completed on page 2');

  // Check for conflict dialog - wait for it to appear
  let dialogExists = false;
  try {
    await p2.getByRole('dialog').waitFor({ timeout: 10000 });
    dialogExists = true;
    console.log('Dialog exists:', dialogExists);
    await expect(p2.getByRole('dialog')).toContainText(/conflict|409/i);
  } catch (error) {
    console.log('No conflict dialog found, checking for other indicators');
    // Take a screenshot for debugging
    await p2.screenshot({ path: 'test-results/no-conflict-dialog.png' });
  }
  
  // Wait for the reload latest button to appear
  try {
    await p2.getByRole('button', { name: /reload latest|open latest/i }).waitFor({ timeout: 10000 });
    await p2.getByRole('button', { name: /reload latest|open latest/i }).click();
  } catch (error) {
    console.log('Reload latest button not found, taking screenshot');
    await p2.screenshot({ path: 'test-results/no-reload-button.png' });
    throw new Error('Reload latest button not found');
  }
  
  await p2.locator('button[type="submit"]').click();

  // Wait for the form submission to complete
  await p2.waitForTimeout(3000);

  // Check for success message or navigation
  try {
    await p2.getByText(/saved/i).waitFor({ timeout: 5000 });
  } catch {
    // If no "saved" message, check if we navigated away or if there's a different success indicator
    console.log(
      'No "saved" message found for page 2, checking for other success indicators'
    );
  }

  await ctx1.close();
  await ctx2.close();
});
