import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/Helpdesk|Login/i);
    await expect(page.getByRole('button', { name: /sign in|login|войти/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /sign in|login|войти/i }).click();

    // Should show validation errors
    await expect(page.locator('text=/required|обязательн/i').first()).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.getByRole('link', { name: /register|sign up|регистрация/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/register/);
    }
  });
});
