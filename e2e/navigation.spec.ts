import { test, expect } from '@playwright/test';
import { setupMockApi } from './support/mock-api';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should load the app without errors', async ({ page }) => {
    // Check no console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(page.locator('#email')).toBeVisible();

    // Filter out expected errors (like network errors in dev)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('net::') &&
        !e.includes('Failed to fetch') &&
        !e.includes('status of 401') &&
        !e.includes('context: GET /users/profile') &&
        !e.includes('code: UNAUTHORIZED'),
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('shows not found page for unknown routes', async ({ page }) => {
    await page.goto('/non-existing-route');

    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page).toHaveURL(/\/non-existing-route$/);
  });
});
