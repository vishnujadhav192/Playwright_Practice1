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

test('Notifications - Success Toast', async ({ page }) => {
    await verifyCardVisible(page, 'toasts-card');

    await page.getByTestId('toast-success').click();
    await expect(page.getByTestId('alert-success')).toBeVisible();
    await expect(page.getByTestId('alert-success')).toContainText('Success! Operation completed.');

});

test('Notifications - Error Toast', async ({ page }) => {
    await verifyCardVisible(page, 'toasts-card');

    await page.getByTestId('toast-error').click();
    await expect(page.getByTestId('alert-error')).toBeVisible();
    await expect(page.getByTestId('alert-error')).toContainText('Error! Something went wrong.');
});

test('Notifications - Warning Toast', async ({ page }) => {
    await verifyCardVisible(page, 'toasts-card');

    await page.getByTestId('toast-warning').click();
    await expect(page.getByTestId('alert-warning')).toBeVisible();
    await expect(page.getByTestId('alert-warning')).toContainText('Warning! Please check your input.');
});

test('Notifications - Info Toast', async ({ page }) => {
    await verifyCardVisible(page, 'toasts-card');

    await page.getByTestId('toast-info').click();
    await expect(page.getByTestId('alert-info')).toBeVisible();
    await expect(page.getByTestId('alert-info')).toContainText('Info: System will restart at midnight.');
});

test.describe('Native Dialogs', () => {

    test('Alert dialog', async ({ page }) => {
        await verifyCardVisible(page, 'toasts-card');
        page.once('dialog', async dialog => {
            expect(dialog.message()).toContain('This is a native alert dialog!'); // adjust if message text is known
            await dialog.accept();
        });
        await page.getByTestId('native-alert').click();
        await expect(page.getByTestId('native-result')).toContainText('Alert was dismissed');
    });

    test('Confirm dialog - accept(ok)', async ({ page }) => {
        await verifyCardVisible(page, 'toasts-card');
        page.once('dialog', async dialog => {
            expect(dialog.message()).toContain('Do you want to continue?');
            await dialog.accept(); // or dialog.dismiss()
        });
        await page.getByTestId('native-confirm').click();
        await expect(page.getByTestId('native-result')).toContainText('Confirm result: true');
    });

    test('Confirm dialog - dismiss(Cancel)', async ({ page }) => {
        await verifyCardVisible(page, 'toasts-card');
        page.once('dialog', async dialog => {
            expect(dialog.message()).toContain('Do you want to continue?');
            await dialog.dismiss(); // or dialog.dismiss()
        });
        await page.getByTestId('native-confirm').click();
        await expect(page.getByTestId('native-result')).toContainText('Confirm result: false');
    });

    test('Prompt dialog - accept(ok)', async ({ page }) => {
        await verifyCardVisible(page, 'toasts-card');
        page.once('dialog', async dialog => {
            expect(dialog.message()).toContain('What is your name?');
            await dialog.accept('Playwright input');
        });
        await page.getByTestId('native-prompt').click();
        await expect(page.getByTestId('native-result')).toContainText('Playwright input');
    });

    test('Prompt dialog - dismiss(Cancel)', async ({ page }) => {
        await verifyCardVisible(page, 'toasts-card');
        page.once('dialog', async dialog => {
            expect(dialog.message()).toContain('What is your name?');
            await dialog.dismiss();
        });
        await page.getByTestId('native-prompt').click();
        await expect(page.getByTestId('native-result')).toContainText('Prompt result: "null"');
    });
});

test.describe('Inline Alerts', () => {

  test('Success alert visible', async ({ page }) => {
     await verifyCardVisible(page, 'toasts-card');
    await expect(page.getByTestId('alert-success')).toBeVisible();
    await expect(page.getByTestId('alert-success')).toContainText('Success! Operation completed.');
  });

  test('Error alert visible', async ({ page }) => {
     await verifyCardVisible(page, 'toasts-card');
    await expect(page.getByTestId('alert-error')).toBeVisible();
    await expect(page.getByTestId('alert-error')).toContainText('Error! Something went wrong.');
  });

  test('Warning alert visible', async ({ page }) => {
     await verifyCardVisible(page, 'toasts-card');
    await expect(page.getByTestId('alert-warning')).toBeVisible();
    await expect(page.getByTestId('alert-warning')).toContainText('Warning! Please check your input.');
  });

  test('Info alert visible', async ({ page }) => {
     await verifyCardVisible(page, 'toasts-card');
    await expect(page.getByTestId('alert-info')).toBeVisible();
    await expect(page.getByTestId('alert-info')).toContainText('Info: System will restart at midnight.');
  });
});