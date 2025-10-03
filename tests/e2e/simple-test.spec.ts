import { test, expect } from '@playwright/test';

const STUDIO = process.env.STUDIO_BASE_URL || 'http://localhost:5173';

test('simple navigation test', async ({ page }) => {
  // Test basic navigation to the Studio
  await page.goto(STUDIO);

  // Check if the page loads
  await expect(page).toHaveTitle(/AurenWorks Studio/);

  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/simple-test.png' });

  // Check if we can find any elements
  const body = await page.textContent('body');
  console.log('Page content:', body?.substring(0, 200));
});
