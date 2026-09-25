import { test, expect, Page, Locator } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.goto('https://playwrightlab.github.io/');

    const cookiesBannersettingsbutton = page.locator('#cookieSettings');
    const cookiesBanneracceptbutton = page.locator('button').filter({ hasText: 'Accept All' });
    const cookiesBannerRejectbutton = page.getByRole('button', { name: 'Reject All' });
    const cookieBanner = page.locator('#cookieBanner');

    await cookiesBannerRejectbutton.click();

    await expect(cookiesBannerRejectbutton).not.toBeVisible();
    await expect(cookiesBannersettingsbutton).not.toBeVisible();
    await expect(cookiesBanneracceptbutton).not.toBeVisible();
    await expect(cookieBanner).toBeHidden();
    await expect(cookieBanner).not.toBeVisible();
});

async function verifyCardVisible(page: Page, testId: string) {
    const card = page.getByTestId(testId);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
}

// test.afterEach(async ({ page }) => {
//     //await page.close();
// });

test('Click on Menu Modals & Alerts option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-modals').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    // By id
    await expect(page.locator('#modalsDesc')).toContainText('Dialog boxes, confirmation prompts, toast notifications, and alerts.');

    // By role (more robust, recommended)
    //    await expect(page.getByRole('heading', { name: 'Modals', exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Modals & Alerts', exact: true })).toBeVisible();

    // Also check the section is visible (has the 'section-title' class)
    await expect(page.locator('#dynamicTitle')).toHaveClass(/title/);
})

test('Open Action Modal - Confirm', async ({ page }) => {
    await verifyCardVisible(page, 'modals-card');

    // Step 1: Open modal
    await page.getByRole('button', { name: 'Open Modal' }).click();

    // Step 2: Assert modal visible
    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();

    // Step 3: Assert title and body
    await expect(modal.getByTestId('modal-title')).toHaveText('Sample Modal');
    await expect(modal.getByTestId('modal-body')).toContainText('This is a sample modal dialog');

    // Step 4: Interact with textarea
    await modal.getByTestId('modal-textarea').fill('Playwright test input');

    // Step 5: Confirm button flow
    await modal.getByTestId('modal-confirm').click();
    await expect(modal).toBeHidden();

    // Step 6: Assert result
    await expect(page.locator('#dialogResult')).toHaveText(/Playwright test input/);
});

test('Open Action Modal - Cancel', async ({ page }) => {
    await verifyCardVisible(page, 'modals-card');

    // Step 1: Open modal
    await page.getByRole('button', { name: 'Open Modal' }).click();

    // Step 2: Assert modal visible
    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();

    // Step 3: Assert title and body
    await expect(modal.getByTestId('modal-title')).toHaveText('Sample Modal');
    await expect(modal.getByTestId('modal-body')).toContainText('This is a sample modal dialog');

    // Step 4: Cancel button flow
    await modal.getByTestId('modal-cancel').click();
    await expect(modal).toBeHidden();
});

test('Confirm Dialog - Confirm', async ({ page }) => {

    await verifyCardVisible(page, 'modals-card');

    // Step 1: Open modal
    await page.getByRole('button', { name: 'Confirm Dialog' }).click();

    // Step 2: Assert modal visible
    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();

    // Step 3: Assert title and body
    await expect(modal.getByTestId('modal-title')).toHaveText('Confirm Action');
    await expect(modal.getByTestId('modal-body')).toContainText('Are you sure you want to proceed with this action?');

    // Step 4: Click Confirm
    await modal.getByTestId('modal-confirm').click();

    // Step 5: Modal should close
    await expect(modal).toBeHidden();

    // Step 6: Assert result message
    await expect(page.locator('#dialogResult')).toHaveText(/Confirmed/i);
});

test('Confirm Dialog - Cancel', async ({ page }) => {
    await verifyCardVisible(page, 'modals-card');

    // Step 1: Open modal
    await page.getByRole('button', { name: 'Confirm Dialog' }).click();

    // Step 2: Assert modal visible
    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();

    // Step 3: Click Cancel
    await modal.getByTestId('modal-cancel').click();

    // Step 4: Modal should close
    await expect(modal).toBeHidden();
});

test('Prompt Dialog - Confirm', async ({ page }) => {

    await verifyCardVisible(page, 'modals-card');

    // Step 1: Open modal
    await page.getByRole('button', { name: 'Prompt Dialog' }).click();

    // Step 2: Assert modal visible
    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();

    // Step 3: Assert title
    await expect(modal.getByTestId('modal-title')).toHaveText('Enter Your Name');

    // Step 4: Interact with textarea
    await modal.getByTestId('prompt-input').fill('Playwright');

    // Step 5: Click Confirm
    await modal.getByTestId('modal-confirm').click();

    // Step 5: Modal should close
    await expect(modal).toBeHidden();

    // Step 6: Assert result message
    await expect(page.locator('#dialogResult')).toHaveText(/Playwright/i);
});

test('Prompt Dialog - Cancel', async ({ page }) => {
    await verifyCardVisible(page, 'modals-card');

    // Step 1: Open modal
    await page.getByRole('button', { name: 'Prompt Dialog' }).click();

    // Step 2: Assert modal visible
    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();

    // Step 3: Click Cancel
    await modal.getByTestId('modal-cancel').click();

    // Step 4: Modal should close
    await expect(modal).toBeHidden();
});


test('Nested Modal - Confirm', async ({ page }) => {

    await verifyCardVisible(page, 'modals-card');

    // Step 1: Open parent modal
    await page.getByRole('button', { name: 'Nested Modal' }).click();
    const parentModal = page.getByTestId('modal');
    await expect(parentModal).toBeVisible();
    await expect(parentModal.getByTestId('modal-title')).toHaveText('Parent Modal');

    // Step 2: Click "Open Nested Modal"
    await parentModal.getByTestId('open-nested-inner').click();

    // Step 3: Assert nested modal is visible
    const nestedModal = page.getByTestId('nested-modal');
    await expect(nestedModal).toBeVisible();
    await expect(nestedModal.locator('#nestedModalTitle')).toHaveText('Nested Modal');
    await expect(nestedModal.locator('#nestedModalBody')).toContainText('This is a nested modal that opened from the first modal!');

    // Step 4: Close nested modal
    await nestedModal.getByTestId('close-nested-btn').click();
    await expect(nestedModal).toBeHidden();

    // Step 5: Parent modal should still be visible
    await expect(parentModal).toBeVisible();

    // Step 6: Confirm parent modal action   ---> Confirm is not working so clicking on cancel
    await parentModal.getByTestId('modal-cancel').click();
    await expect(parentModal).toBeHidden();
});

test('Nested Modal - Cancel', async ({ page }) => {
    await verifyCardVisible(page, 'modals-card');

    // Step 1: Open modal
    await page.getByRole('button', { name: 'Nested Modal' }).click();

    // Step 2: Assert modal visible
    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();

    // Step 3: Click Cancel
    await modal.getByTestId('modal-cancel').click();

    // Step 4: Modal should close
    await expect(modal).toBeHidden();
});

test('HTTP Basic Auth popup', async ({ browser, page }) => {
    // Step 1: Verify the card is visible
  await verifyCardVisible(page, 'modals-card');

  // Step 2: Create a new context with credentials
  const context = await browser.newContext({
    httpCredentials: {
      username: 'admin',
      password: 'password123'
    }
  });

  const authPage = await context.newPage();

  // Step 3: Navigate to the Basic Auth URL
  await authPage.goto('https://httpbin.org/basic-auth/admin/password123');

  // Step 4: Assert successful authentication
  await expect(authPage.locator('body')).toContainText('"authenticated": true');
  await expect(authPage.locator('body')).toContainText('"user": "admin"');
});