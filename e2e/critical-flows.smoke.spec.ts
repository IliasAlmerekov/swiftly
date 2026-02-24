import { expect, test } from '@playwright/test';

import { loginAs, setupMockApi } from './support/mock-api';

test.describe('Critical flows smoke', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page);
  });

  test('happy path: user authenticates and creates ticket', async ({ page }) => {
    await loginAs(page, {
      email: 'lena.hoffmann@swiftly.com',
      password: 'pass123',
    });

    await page.goto('/dashboard?tab=create-ticket');
    await expect(page.getByRole('heading', { name: 'Create New Ticket' })).toBeVisible();

    const titleInput = page.locator('#title');
    if (!(await titleInput.isVisible())) {
      const aiOverlayButton = page.getByRole('button', { name: /create ticket|ticket erstellen/i });
      await expect(aiOverlayButton).toBeVisible();
      await aiOverlayButton.click();
    }

    await expect(titleInput).toBeVisible();
    await titleInput.fill('Cannot connect to VPN');
    await page
      .locator('#description')
      .fill('VPN disconnects every few minutes while working remotely.');
    await page.getByRole('button', { name: 'Create Ticket' }).click();

    await expect(page.getByRole('heading', { name: 'Ticket created successfully!' })).toBeVisible();
  });

  test('happy path: support changes ticket status', async ({ page }) => {
    await loginAs(page, {
      email: 'support.agent@swiftly.com',
      password: 'pass123',
    });

    await page.goto('/tickets/ticket-100?tab=tickets');
    await expect(page.getByText('VPN connection keeps timing out')).toBeVisible();

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Resolved' }).click();
    await expect(page.getByRole('combobox').first()).toContainText('Resolved');
  });

  test('happy path: admin can open admin and analytics tabs', async ({ page }) => {
    await loginAs(page, {
      email: 'ilias.almerekov@swiftly.com',
      password: 'pass123',
    });

    await page.getByRole('button', { name: 'Admin Dashboard' }).click();
    await expect(page.getByText('Admin Dashboard')).toBeVisible();

    await page.getByRole('button', { name: 'Analytics' }).click();
    await expect(page.getByText('Analytics')).toBeVisible();
  });
});
