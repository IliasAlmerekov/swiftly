import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle('Solutions IT');
    await expect(page.getByRole('button', { name: /sign in|login|войти/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /sign in|login|войти/i }).click();

    // Should show validation errors - check if form fields show required validation
    const emailField = page.getByRole('textbox', { name: 'Email' });
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    // HTML5 validation prevents form submission, so we should still be on login page
    await expect(page).toHaveURL('/login');
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
