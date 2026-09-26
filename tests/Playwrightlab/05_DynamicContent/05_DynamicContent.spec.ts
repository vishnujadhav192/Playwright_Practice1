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
    await verifyCardVisible(page, 'visibility-card');

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
    await verifyCardVisible(page, 'visibility-card');

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
    await verifyCardVisible(page, 'visibility-card');

    // 3. Disable / Enable input
    const input = page.getByPlaceholder('Type here...');             //page.locator('#toggleInput');
    await page.locator('#disableBtn').click();
    await expect(input).toBeDisabled();

    await page.locator('#enableBtn').click();
    await expect(input).toBeEnabled();

    await input.fill('AtoZ');
});

test('Visibility controls demo : Start / Stop Toggle', async ({ page }) => {
    //await verifyCardVisible(page, 'delayed-card');
    await verifyCardVisible(page, 'visibility-card');

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

test('Visibility controls demo : Counter increments, decrements, and resets', async ({ page }) => {
    //await verifyCardVisible(page, 'delayed-card');
    await verifyCardVisible(page, 'counter-card');

    const counterValue = page.locator('#counterValue');

    // Initial value
    await expect(counterValue).toHaveText('0');

    // Increment twice
    await page.locator('#incrementBtn').click();
    await page.locator('#incrementBtn').click();
    await expect(counterValue).toHaveText('2');

    // Decrement once
    await page.locator('#decrementBtn').click();
    await expect(counterValue).toHaveText('1');

    // Reset
    await page.locator('#resetCounterBtn').click();
    await expect(counterValue).toHaveText('0');
});

test('Visibility controls demo : Timer starts, stops, and resets', async ({ page }) => {
    //await verifyCardVisible(page, 'delayed-card');
    await verifyCardVisible(page, 'counter-card');

    const timerDisplay = page.locator('#timerDisplay');

    // Initial state
    await expect(timerDisplay).toHaveText('00:00');

    // Start timer
    await page.locator('#startTimerBtn').click();
    await page.waitForTimeout(2000); // wait 2 seconds
    const runningValue = await timerDisplay.innerText();
    expect(runningValue).not.toBe('00:00'); // should have advanced

    // Stop timer
    await page.locator('#stopTimerBtn').click();
    const stoppedValue = await timerDisplay.innerText();
    await page.waitForTimeout(2000);
    await expect(timerDisplay).toHaveText(stoppedValue); // value should not change

    // Reset timer
    await page.locator('#resetTimerBtn').click();
    await expect(timerDisplay).toHaveText('00:00');
});

test('Visibility controls demo : Download Progress Indicators', async ({ page }) => {
    await verifyCardVisible(page, 'progress-card');

    const progressBar = page.locator('#progressBar');

    // Initial state
    await expect(progressBar).toHaveText('0%');
    await expect(progressBar).toHaveAttribute('style', /width: 0%/);

    // Start download
    await page.locator('#startProgressBtn').click();

    // Assert final state
    await expect(progressBar).toHaveText('100%', { timeout: 6000 });
    await expect(progressBar).toHaveAttribute('style', /width: 100%/);
});

test('Visibility controls demo : Circular spinner toggles', async ({ page }) => {
    await verifyCardVisible(page, 'progress-card');

    const spinner = page.locator('#spinner');
    const status = page.locator('#spinnerStatus');
    const toggleBtn = page.locator('#toggleSpinnerBtn');

    // Initial state: hidden spinner, "Click to load"
    await expect(spinner).toHaveClass(/hidden/);
    await expect(status).toHaveText('Click to load');

    // Toggle on: spinner visible, "Loading..."
    await toggleBtn.click();
    await expect(spinner).not.toHaveClass(/hidden/);
    await expect(status).toHaveText('Loading...');

    // Toggle off: spinner hidden again, back to "Click to load"
    await toggleBtn.click();
    await expect(spinner).toHaveClass(/hidden/);
    await expect(status).toHaveText('Click to load');
});

test('Visibility controls demo : Skeleton toggles to loaded content', async ({ page }) => {
    await verifyCardVisible(page, 'progress-card');

    const skeletonArea = page.locator('#skeletonArea');
    const loadedContent = page.locator('#loadedContent');
    const toggleBtn = page.locator('#toggleSkeletonBtn');

    // Initial state: skeleton visible, content hidden
    await expect(skeletonArea).toBeVisible();
    await expect(loadedContent).toHaveClass(/hidden/);

    // Toggle: skeleton hidden, content visible
    await toggleBtn.click();
    await expect(skeletonArea).toHaveClass(/hidden/);
    await expect(loadedContent).toBeVisible();
    await expect(loadedContent).toContainText('Jane Cooper');
    await expect(loadedContent).toContainText('Senior Developer at TechCorp');

    // Toggle back: skeleton visible again, content hidden
    await toggleBtn.click();
    await expect(skeletonArea).toBeVisible();
    await expect(loadedContent).toHaveClass(/hidden/);
});