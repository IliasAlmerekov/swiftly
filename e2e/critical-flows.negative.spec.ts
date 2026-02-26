import { expect, test } from '@playwright/test';

import { loginAs, setupMockApi } from './support/mock-api';

test.describe('Critical flows negative', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page);
  });

  test('access denied: user cannot open another user profile', async ({ page }) => {
    await loginAs(page, {
      email: 'lena.hoffmann@swiftly.com',
      password: 'pass123',
    });

    await page.goto('/users/support-100');
    await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
  });

  test('validation: create ticket form blocks empty required fields', async ({ page }) => {
    await loginAs(page, {
      email: 'support.agent@swiftly.com',
      password: 'pass123',
    });

    await page.goto('/dashboard?tab=create-ticket');
    await expect(
      page.getByRole('heading', { name: /Create New (Support )?Ticket/i }),
    ).toBeVisible();

    await page.locator('form').getByRole('button', { name: 'Create Ticket' }).click();

    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Description is required')).toBeVisible();
  });
});
