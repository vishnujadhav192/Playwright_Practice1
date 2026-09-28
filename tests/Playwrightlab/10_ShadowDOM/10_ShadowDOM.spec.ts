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

test('Click on Menu Shadow option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-shadow').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    await verifyCardVisible(page, 'shadow-dom-card');

    // By id
    await expect(page.locator('#shadowDesc')).toContainText('Elements encapsulated within Shadow DOM for advanced testing.');

    // By role (more robust, recommended)
    //    await expect(page.getByRole('heading', { name: 'Modals', exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Shadow DOM', exact: true })).toBeVisible();

    // Also check the section is visible (has the 'section-title' class)
    await expect(page.locator('#shadowTitle')).toHaveClass(/title/);
})

test('Shadow DOM Elements', async ({ page }) => {

    await verifyCardVisible(page, 'shadow-dom-card');

    // Locate the shadow host
    const shadowHost = page.getByTestId('shadow-host');

    // Example: assert that shadow DOM content exists
    await expect(shadowHost.locator('p')).toHaveText('These elements are encapsulated within a Shadow DOM boundary.');

    await expect(page.locator('.shadow-container h4')).toHaveText('Inside Shadow DOM');

    await expect(page.locator('.shadow-container p')).toContainText('encapsulated within a Shadow DOM boundary.');

    const shadowInput = page.getByTestId('shadow-input');
    const shadowButton = page.getByTestId('shadow-button');
    const shadowResult = page.getByTestId('shadow-result');

    await expect(shadowInput).toHaveAttribute('placeholder', 'Type inside shadow DOM...');

    await shadowInput.fill('India');
    await shadowButton.click();

    await expect(shadowInput).toHaveValue('India');
    await expect(shadowButton).toHaveText('Click Me');
    await expect(shadowButton).toBeEnabled();
    await expect(shadowResult).toHaveText('You typed: "India"');
});

test('Nested Shadow DOM', async ({ page }) => {

    await verifyCardVisible(page, 'web-component-card');

    await expect(page.locator('.outer h4')).toHaveText('Outer Shadow DOM');
    await expect(page.locator('.outer p')).toContainText('nested shadow DOM inside it.');

    // Button inside inner shadow DOM
    const innerButton = page.getByTestId('inner-shadow-button');
    await expect(innerButton).toHaveText('Click Inner Button');
    await expect(innerButton).toBeEnabled();

    await innerButton.click();

    // Result container
    const innerResult = page.getByTestId('inner-shadow-result');
    await expect(innerResult).toContainText('Inner button clicked');
    await expect(innerResult).toBeVisible();
});