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

test.describe('Context menu', () => {

    test('should display context menu on right-click', async ({ page }) => {
        await verifyCardVisible(page, 'context-menu-card');

        const contextArea = page.locator('#contextArea');
        const contextMenu = page.locator('#contextMenu');

        // Right-click inside the area
        await contextArea.click({ button: 'right' });

        // Verify menu becomes visible
        await expect(contextMenu).toBeVisible();
    });

    //Need to check how other test run can be done.
});

test.describe('Toggle Button Tests', () => {
    test('Bold button toggles active state', async ({ page }) => {
        await verifyCardVisible(page, 'context-menu-card');
        const boldBtn = page.locator('#toggleBold');

        // Initially not active
        await expect(boldBtn).not.toHaveClass(/active/);

        // Click to activate
        await boldBtn.click();
        await expect(boldBtn).toHaveClass(/active/);

        // Click again to deactivate
        await boldBtn.click();
        await expect(boldBtn).not.toHaveClass(/active/);
    });

    test('Italic button toggles active state', async ({ page }) => {
        await verifyCardVisible(page, 'context-menu-card');
        const italicBtn = page.locator('#toggleItalic');

        await expect(italicBtn).not.toHaveClass(/active/);
        await italicBtn.click();
        await expect(italicBtn).toHaveClass(/active/);
        await italicBtn.click();
        await expect(italicBtn).not.toHaveClass(/active/);
    });

    test('Underline button toggles active state', async ({ page }) => {
        await verifyCardVisible(page, 'context-menu-card');
        const underlineBtn = page.locator('#toggleUnderline');

        await expect(underlineBtn).not.toHaveClass(/active/);
        await underlineBtn.click();
        await expect(underlineBtn).toHaveClass(/active/);
        await underlineBtn.click();
        await expect(underlineBtn).not.toHaveClass(/active/);
    });
});

test.describe('Notification Switch Tests', () => {
    test('should be OFF by default', async ({ page }) => {
        await verifyCardVisible(page, 'context-menu-card');

        const notifToggle = page.locator('#notifToggle');
        const notifStatus = page.locator('#notifStatus');

        // Checkbox unchecked
        await expect(notifToggle).not.toBeChecked();

        // Status text OFF
        await expect(notifStatus).toHaveText('OFF');
    });

    test("toggles notifications off -> on -> off", async ({ page }) => {
        await verifyCardVisible(page, 'context-menu-card');

        // Check it again.
    });
});