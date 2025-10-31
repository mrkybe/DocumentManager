import { test, expect } from '@playwright/test';

test('Document Management App loads successfully', async ({ page }) => {
  await page.goto('/');
  
  // Check if the app loads with correct title
  await expect(page).toHaveTitle(/React App/);
  
  // Wait for the document app to load
  await page.waitForLoadState('networkidle');
  
  // Check for the document management content
  await expect(page.locator('h1')).toContainText('Document Management System');
  
  // Verify key UI elements are present
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="add-document-btn"]')).toBeVisible();
  
  // Verify documents load
  await expect(page.locator('[data-testid="document-item"]').first()).toBeVisible({ timeout: 10000 });
  
  // Check that we have the expected number of initial documents
  const documentCount = await page.locator('[data-testid="document-item"]').count();
  expect(documentCount).toBe(10);
  
  // Verify dark mode styling is applied
  const appElement = page.locator('.document-app');
  await expect(appElement).toHaveCSS('background-color', 'rgb(13, 17, 23)');
});