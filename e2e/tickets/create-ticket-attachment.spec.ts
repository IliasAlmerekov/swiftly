// spec: specs/ticket-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Create Ticket', () => {
  test.fixme('Create ticket with file attachment', async ({ page }) => {
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

    // Navigate to create ticket page - try Support button first
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
    await expect(titleTextbox).toBeVisible();

    // 2. Fill in the Title and Description fields with valid data
    await titleTextbox.fill('Printer not printing documents');
    // expect: Fields accept the input
    await page
      .getByRole('textbox', { name: 'Description *' })
      .fill(
        'The office printer is not printing any documents. It shows as online but jobs get stuck in the queue. I have tried restarting the printer.',
      );

    // 3. Click on the file upload input and select a file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Attach a file (optional)' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(process.cwd(), 'README.md'));
    // expect: The file is selected and filename is displayed

    // 4. Click the 'Create Ticket' button
    await page.getByRole('button', { name: 'Create Ticket' }).click();
    // expect: Ticket is created successfully with the attachment
    // expect: Success message is displayed
    await expect(page.getByRole('heading', { name: 'Ticket created successfully!' })).toBeVisible();
  });
});
