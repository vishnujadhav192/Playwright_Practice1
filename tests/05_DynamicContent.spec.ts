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

test('Click on Menu Dynamic Content option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-dynamic').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    // By id
    await expect(page.locator('#dynamicDesc')).toContainText('Practice waiting for elements, handling loading states, and dynamic DOM changes.');

    // By role (more robust, recommended)
    await expect(page.getByRole('heading', { name: 'Dynamic Content', exact: true })).toBeVisible();

    // Also check the section is visible (has the 'section-title' class)
    await expect(page.locator('#dynamicTitle')).toHaveClass(/title/);
})

test('Delayed card loads content after 1s', async ({ page }) => {
    await verifyCardVisible(page, 'delayed-card');

    // Step 1: Check placeholder message
    await expect(page.locator('#delayedContent')).toContainText('Content will appear here...');

    // Step 2: Select 1 second delay
    await page.locator('#delayTime').selectOption('1');

    // Step 3: Click Load Content
    await page.locator('#loadDelayedBtn').click();

    // Step 4: Assert final loaded message and items
    const loadedData = page.locator('[data-testid="loaded-data"]');

    await expect(loadedData).toContainText('Content Loaded Successfully!');
    await expect(loadedData).toContainText('This content appeared after a 1 second delay.');
    await expect(loadedData).toContainText('Item 1: Playwright is awesome');
    await expect(loadedData).toContainText('Item 2: Testing is fun');
    await expect(loadedData).toContainText('Item 3: Automation saves time');

    // Timestamp check (optional, since it changes dynamically)
    // You can assert it contains "Timestamp:" without exact value
    await expect(loadedData).toContainText('Timestamp:');
});

test('Delayed card loads content after 5s', async ({ page }) => {
    await verifyCardVisible(page, 'delayed-card');

    // Step 1: Check placeholder message
    await expect(page.locator('#delayedContent')).toContainText('Content will appear here...');

    // Step 2: Select 5 seconds delay
    await page.locator('#delayTime').selectOption('5');

    // Step 3: Click Load Content
    await page.locator('#loadDelayedBtn').click();

    // Step 4: Assert final loaded message and items
    const loadedData = page.locator('[data-testid="loaded-data"]');

    await expect(loadedData).toContainText('Content Loaded Successfully!');
    await expect(loadedData).toContainText('This content appeared after a 5 second delay.');
    await expect(loadedData).toContainText('Item 1: Playwright is awesome');
    await expect(loadedData).toContainText('Item 2: Testing is fun');
    await expect(loadedData).toContainText('Item 3: Automation saves time');

    // Timestamp check (optional, since it changes dynamically)
    // You can assert it contains "Timestamp:" without exact value
    await expect(loadedData).toContainText('Timestamp:');
});

test('Visibility controls demo : Show/Hide/Toggle element', async ({ page }) => {
    await verifyCardVisible(page, 'delayed-card');

    // 1. Show / Hide / Toggle
    const visibleElement = page.locator('#visibleElement');
    await expect(visibleElement).toBeVisible();

    await page.locator('#hideBtn').click();
    await expect(visibleElement).toBeHidden();

    await page.locator('#showBtn').click();
    await expect(visibleElement).toBeVisible();

    await page.locator('#toggleVisBtn').click();
    await expect(visibleElement).toBeHidden();
});

test('Visibility controls demo : Add/Remove element', async ({ page }) => {
    await verifyCardVisible(page, 'delayed-card');

    // 2. Add / Remove dynamic element
    const dynamicContainer = page.locator('#dynamicElements');
    const dynamicElements = page.locator('.dynamic-el');

    // Add element twice
    await page.locator('#addElementBtn').click();
    await page.locator('#addElementBtn').click();

    // Assert two elements are present
    await expect(dynamicElements).toHaveCount(2);
    await expect(dynamicContainer).toContainText('Dynamic Element #1');
    await expect(dynamicContainer).toContainText('Dynamic Element #2');

    // Remove element once
    await page.locator('#removeElementBtn').click();

    // Assert only one element remains
    await expect(dynamicElements).toHaveCount(1);
    await expect(dynamicContainer).toContainText('Dynamic Element #1');
    await expect(dynamicContainer).not.toContainText('Dynamic Element #2');
});

test('Visibility controls demo : Enable/Disable input', async ({ page }) => {
    await verifyCardVisible(page, 'delayed-card');

    // 3. Disable / Enable input
    const input = page.getByPlaceholder('Type here...');             //page.locator('#toggleInput');
    await page.locator('#disableBtn').click();
    await expect(input).toBeDisabled();

    await page.locator('#enableBtn').click();
    await expect(input).toBeEnabled();

    await input.fill('AtoZ');
});

test('Visibility controls demo : Start / Stop Toggle', async ({ page }) => {
    await verifyCardVisible(page, 'delayed-card');

    // 4. Start / Stop toggle
    const toggleBtn = page.locator('#startStopBtn');
    const status = page.locator('#startStopStatus');

    // Initial state
    await expect(toggleBtn).toHaveText('Start');
    await expect(status).toHaveText('Status: Stopped');

    // Click to start
    await toggleBtn.click();
    await expect(toggleBtn).toHaveText('Stop');
    await expect(status).toHaveText('Status: Running');

    // Click to stop again
    await toggleBtn.click();
    await expect(toggleBtn).toHaveText('Start');
    await expect(status).toHaveText('Status: Stopped');
});