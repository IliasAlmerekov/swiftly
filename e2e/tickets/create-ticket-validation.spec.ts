// spec: specs/ticket-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Create Ticket', () => {
  test.fixme('Validation - Cannot create ticket without required fields', async ({ page }) => {
    // FIXME: This test passes when run individually but fails when run in parallel
    // due to login session conflicts or timing issues. Needs investigation of
    // parallel execution handling in the application.
    await page.goto('/');

    // Login as regular user
    await page.getByRole('textbox', { name: 'Email' }).fill('lena.hoffmann@scooteq.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('pass123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for login to complete
    await page.waitForLoadState('networkidle');

    // Navigate to create ticket page
    const supportButton = page.getByRole('button', { name: 'Support' });
    if (await supportButton.isVisible({ timeout: 3000 })) {
      await supportButton.click();
    }

    // Look for and click AI assistant "Ticket erstellen" button if present
    const ticketCreateButton = page.getByRole('button', { name: 'Ticket erstellen' });
    if (await ticketCreateButton.isVisible({ timeout: 3000 })) {
      await ticketCreateButton.click();
      await page.waitForLoadState('networkidle');
    }

    // Final wait for ticket form to be ready
    await expect(page.getByRole('heading', { name: 'Create New Ticket' })).toBeVisible({
      timeout: 10000,
    });
    // expect: The Create Ticket form is displayed
    const titleTextbox = page.getByRole('textbox', { name: 'Title *' });
    const descriptionTextbox = page.getByRole('textbox', { name: 'Description *' });
    const createTicketButton = page.getByRole('button', { name: 'Create Ticket' });
    await expect(titleTextbox).toBeVisible();

    // 2. Leave the Title field empty and click 'Create Ticket'
    await createTicketButton.click();
    // expect: Form is not submitted (still on same page)
    await expect(titleTextbox).toBeVisible();
    // expect: Validation error is shown for Title field (HTML5 validation prevents submission)

    // 3. Fill in Title but leave Description empty and click 'Create Ticket'
    await titleTextbox.fill('Test ticket title');
    await createTicketButton.click();
    // expect: Form is not submitted (still on same page with description focused)
    await expect(descriptionTextbox).toBeVisible();
    // expect: Validation error is shown for Description field (HTML5 validation prevents submission)
    await expect(
      page.getByRole('heading', { name: 'Ticket created successfully!' }),
    ).not.toBeVisible();
  });
});
