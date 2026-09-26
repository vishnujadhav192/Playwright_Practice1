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

test('Click on Menu Wizard option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-wizard').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    // By id
    await expect(page.locator('#wizardDesc')).toContainText('Navigate through a multi-step form with validation at each step.');

    // By role (more robust, recommended)
    await expect(page.getByRole('heading', { name: 'Multi-Step Wizard', exact: true })).toBeVisible();

    // Also check the section is visible (has the 'section-title' class)
    await expect(page.locator('#wizardTitle')).toHaveClass(/section-title/);
})

test.describe('Multi-Step Wizard', () => {

    test('should complete wizard successfully', async ({ page }) => {
        await verifyCardVisible(page, 'wizard-card');

        // Step 1: Personal Information
        await page.fill('[data-testid="wiz-firstname"]', 'John');
        await page.fill('[data-testid="wiz-lastname"]', 'Doe');
        await page.fill('[data-testid="wiz-email"]', 'john@example.com');
        await page.click('[data-testid="wiz-next"]');

        // Validate Step 2 is active
        await expect(page.locator('[data-testid="wizard-panel-2"]')).toHaveClass(/active/);

        // Step 2: Address
        await page.fill('[data-testid="wiz-street"]', '123 Main St');
        await page.fill('[data-testid="wiz-city"]', 'New York');
        await page.fill('[data-testid="wiz-zip"]', '10001');
        await page.click('[data-testid="wiz-next"]');

        // Step 3: Payment
        await page.fill('[data-testid="wiz-cardnum"]', '4111111111111111');
        await page.fill('[data-testid="wiz-expiry"]', '12/30');
        await page.fill('[data-testid="wiz-cvv"]', '123');
        await page.click('[data-testid="wiz-next"]');

        // Step 4: Review
        await page.check('[data-testid="wiz-agree"]');
        await page.click('[data-testid="wiz-next"]');

        // Success Panel
        await expect(page.locator('[data-testid="wizard-success"]')).toBeVisible();
        await expect(page.locator('[data-testid="wizard-success"] h3')).toHaveText('Order Submitted!');
    });

    test('should show validation error if required fields are empty', async ({ page }) => {
        await verifyCardVisible(page, 'wizard-card');
        // Try moving forward without filling Step 1
        await page.click('[data-testid="wiz-next"]');

        // Expect error message
        await expect(page.locator('[data-testid="wiz-error-1"]')).toBeVisible();
        await expect(page.locator('[data-testid="wiz-error-1"]')).toContainText('required');
    });
});