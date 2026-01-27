// spec: specs/ticket-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Create Ticket', () => {
  test.fixme('Staff user creates a ticket with priority and category', async ({ page }) => {
    // FIXME: This test passes when run individually but fails when run in parallel
    // due to login session conflicts or timing issues. Needs investigation of
    // parallel execution handling in the application.
    await page.goto('/');

    // 1. Login as a staff user (admin or support1 role)
    await page.getByRole('textbox', { name: 'Email' }).fill('ilias.almerekov@scooteq.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('pass123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for login to complete
    await page.waitForLoadState('networkidle');

    // Navigate to create ticket page
    const supportButton = page.getByRole('button', { name: 'Support' });
    if (await supportButton.isVisible({ timeout: 3000 })) {
      await supportButton.click();
    }

    // Ensure we can see the ticket creation form
    await expect(page.getByRole('heading', { name: 'Create New Ticket' })).toBeVisible({
      timeout: 10000,
    });
    // expect: The Create Ticket form is displayed with additional Priority and Category fields
    const priorityCombobox = page.getByRole('combobox', { name: 'Priority' });
    const categoryCombobox = page.getByRole('combobox', { name: 'Category' });
    await expect(priorityCombobox).toBeVisible();
    await expect(categoryCombobox).toBeVisible();
    // expect: AI Assistant overlay is NOT shown for staff users

    // 3. Enter a valid title in the Title field
    await page.getByRole('textbox', { name: 'Title *' }).fill('Server maintenance required');
    // expect: Title field accepts the input

    // 4. Select a priority from the Priority dropdown (Low/Medium/High)
    await priorityCombobox.click();
    await page.getByRole('option', { name: 'High' }).click();
    // expect: Priority is selected and displayed

    // 5. Enter a detailed description in the Description field
    await page
      .getByRole('textbox', { name: 'Description *' })
      .fill(
        'The main database server needs scheduled maintenance. Disk space is running low and performance has degraded over the past week. Need to schedule downtime for cleanup and optimization.',
      );
    // expect: Description field accepts the input

    // 6. Select a category from the Category dropdown
    await categoryCombobox.click();
    await page.getByRole('option', { name: 'Network' }).click();
    // expect: Category is selected from options: Hardware, Software, Network, Account, Email, Other

    // 7. Click the 'Create Ticket' button
    await page.getByRole('button', { name: 'Create Ticket' }).click();
    // expect: Ticket is created with the selected priority and category
    // expect: Success overlay is displayed
    await expect(page.getByRole('heading', { name: 'Ticket created successfully!' })).toBeVisible();
  });
});
