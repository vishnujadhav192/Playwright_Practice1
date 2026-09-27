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

test('Click on Menu Frames option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-frames').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    await verifyCardVisible(page, 'iframe-card');

    // By id
    await expect(page.locator('#framesDesc')).toContainText('Practice with iframes, new windows, and cross-frame interactions.');

    // By role (more robust, recommended)
    //    await expect(page.getByRole('heading', { name: 'Modals', exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Frames & Windows', exact: true })).toBeVisible();

    // Also check the section is visible (has the 'section-title' class)
    await expect(page.locator('#framesTitle')).toHaveClass(/title/);
})

test('Practice iFrame interaction - Submit', async ({ page }) => {

    await verifyCardVisible(page, 'iframe-card');

    // Target the iframe by test id
    const frame = page.frameLocator('[data-testid="practice-iframe"]');

    // Assert the heading inside the iframe
    await expect(frame.locator('[data-testid="iframe-title"]')).toHaveText('iFrame Form');

    // Check description text
    await expect(frame.locator('#iframeDescription')).toContainText('This content is inside an iFrame');

    const inputName = 'Amit';
    const textarea = 'Testing iframe form';
    const priorityValue = 'critical';//'high';

    // Fill the form
    await frame.locator('[data-testid="iframe-input-name"]').fill(inputName);
    await frame.locator('[data-testid="iframe-textarea"]').fill(textarea);
    await frame.locator('[data-testid="iframe-select"]').selectOption(priorityValue);
    await frame.locator('[data-testid="iframe-checkbox"]').check();

    // Submit
    await frame.locator('[data-testid="iframe-submit"]').click();

    const checkbox = frame.locator('[data-testid="iframe-checkbox"]');
    const urgentCheckbox = await checkbox.isChecked();

    // Verify result
    await expect(frame.locator('[data-testid="iframe-result"]')).toContainText(
        `Submitted! Name: ${inputName}, Priority: ${priorityValue}, Urgent: ${urgentCheckbox}, Message: "${textarea}"`);
});

test('Practice iFrame interaction - Reset', async ({ page }) => {

    await verifyCardVisible(page, 'iframe-card');

    // Target the iframe by test id
    const frame = page.frameLocator('[data-testid="practice-iframe"]');

    // Assert the heading inside the iframe
    await expect(frame.locator('[data-testid="iframe-title"]')).toHaveText('iFrame Form');

    // Check description text
    await expect(frame.locator('#iframeDescription')).toContainText('This content is inside an iFrame');

    const nameInput = frame.locator('[data-testid="iframe-input-name"]');
    const messageInput = frame.locator('[data-testid="iframe-textarea"]');
    const priorityInput = frame.locator('[data-testid="iframe-select"]');
    const urgentCheckboxInput = frame.locator('[data-testid="iframe-checkbox"]');
    const resetBtn = frame.locator('[data-testid="iframe-reset"]');
    const resultBox = frame.locator('[data-testid="iframe-result"]');

    const inputName = 'Amit';
    const textarea = 'Testing iframe form';
    const priorityValue = 'critical';//'high';

    // Fill the form
    await nameInput.fill(inputName);
    await messageInput.fill(textarea);
    await priorityInput.selectOption(priorityValue);
    await urgentCheckboxInput.check();

    // Submit
    await frame.locator('[data-testid="iframe-reset"]').click();

    // ✅ Assert input fields are cleared
    await expect(nameInput).toHaveValue('');
    await expect(messageInput).toHaveValue('');
    await expect(priorityInput).toHaveValue('medium');
    await expect(urgentCheckboxInput).not.toBeChecked();
    await expect(resultBox).not.toBeVisible();

    // Alternative: check length
    expect((await nameInput.inputValue()).length).toBe(0);
    expect((await messageInput.inputValue()).length).toBe(0);
    await expect(priorityInput).toHaveText(/Medium/);
});

test('Nested frames interaction - Submit', async ({ page }) => {

    await verifyCardVisible(page, 'nested-frames-card');

    // Target the outer iframe
    const outerFrame = page.frameLocator('[data-testid="nested-frames-iframe"]');

    // Assert outer frame label
    await expect(outerFrame.locator('#outerFrameLabel')).toHaveText('Outer frame');

    // Step into the inner frame (iframe-content.html)
    const innerFrame = outerFrame.frameLocator('[data-testid="inner-frame"]');

    // Assert heading inside inner frame
    await expect(innerFrame.locator('[data-testid="iframe-title"]')).toHaveText('iFrame Form');


    const inputName = 'Amit';
    const textarea = 'Testing iframe form';
    const priorityValue = 'critical';//'high';

    // Fill the form
    await innerFrame.locator('[data-testid="iframe-input-name"]').fill(inputName);
    await innerFrame.locator('[data-testid="iframe-textarea"]').fill(textarea);
    await innerFrame.locator('[data-testid="iframe-select"]').selectOption(priorityValue);
    await innerFrame.locator('[data-testid="iframe-checkbox"]').check();

    // Submit
    await innerFrame.locator('[data-testid="iframe-submit"]').click();

    const checkbox = innerFrame.locator('[data-testid="iframe-checkbox"]');
    const urgentCheckbox = await checkbox.isChecked();

    // Verify result
    await expect(innerFrame.locator('[data-testid="iframe-result"]')).toContainText(
        `Submitted! Name: ${inputName}, Priority: ${priorityValue}, Urgent: ${urgentCheckbox}, Message: "${textarea}"`);

});

test('Nested frames interaction - Reset', async ({ page }) => {

    await verifyCardVisible(page, 'nested-frames-card');

    // Target the outer iframe
    const outerFrame = page.frameLocator('[data-testid="nested-frames-iframe"]');

    // Assert outer frame label
    await expect(outerFrame.locator('#outerFrameLabel')).toHaveText('Outer frame');

    // Step into the inner frame (iframe-content.html)
    const innerFrame = outerFrame.frameLocator('[data-testid="inner-frame"]');

    // Assert heading inside inner frame
    await expect(innerFrame.locator('[data-testid="iframe-title"]')).toHaveText('iFrame Form');

    const nameInput = innerFrame.locator('[data-testid="iframe-input-name"]');
    const messageInput = innerFrame.locator('[data-testid="iframe-textarea"]');
    const priorityInput = innerFrame.locator('[data-testid="iframe-select"]');
    const urgentCheckboxInput = innerFrame.locator('[data-testid="iframe-checkbox"]');
    const resetBtn = innerFrame.locator('[data-testid="iframe-reset"]');
    const resultBox = innerFrame.locator('[data-testid="iframe-result"]');

    const inputName = 'Amit';
    const textarea = 'Testing iframe form';
    const priorityValue = 'critical';//'high';

    // Fill the form
    await nameInput.fill(inputName);
    await messageInput.fill(textarea);
    await priorityInput.selectOption(priorityValue);
    await urgentCheckboxInput.check();

    // Submit
    await innerFrame.locator('[data-testid="iframe-reset"]').click();

    // ✅ Assert input fields are cleared
    await expect(nameInput).toHaveValue('');
    await expect(messageInput).toHaveValue('');
    await expect(priorityInput).toHaveValue('medium');
    await expect(urgentCheckboxInput).not.toBeChecked();
    await expect(resultBox).not.toBeVisible();

    // Alternative: check length
    expect((await nameInput.inputValue()).length).toBe(0);
    expect((await messageInput.inputValue()).length).toBe(0);
    await expect(priorityInput).toHaveText(/Medium/);
});

test('External iframe presence', async ({ page }) => {
    await verifyCardVisible(page, 'external-iframe-card');

    const externalFrame = page.locator('[data-testid="external-iframe"]');

    // ✅ Assert iframe is present
    await expect(externalFrame).toBeVisible();

    // ✅ Assert iframe has correct src
    await expect(externalFrame).toHaveAttribute('src', 'https://playwright.dev/');

    // ✅ Assert iframe has correct title
    await expect(externalFrame).toHaveAttribute('title', 'External website iFrame');
});

test('Handle new tab', async ({ page, context }) => {
    await verifyCardVisible(page, 'window-card');

    // Wait for new page event
    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        page.click('[data-testid="new-tab-btn"]')
    ]);

    await newPage.waitForLoadState();
    await expect(newPage).toHaveTitle(/PlayLab — Login/);
});

test('Handle popup window', async ({ page, context }) => {
    await verifyCardVisible(page, 'window-card');

    const [popup] = await Promise.all([
        context.waitForEvent('page'),
        page.click('[data-testid="popup-btn"]')
    ]);

    await popup.waitForLoadState();
    await expect(popup).toHaveURL('https://playwrightlab.github.io/login.html');
});

test('Trigger print dialog', async ({ page }) => {
    await verifyCardVisible(page, 'window-card');

    // Intercept print call
    page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('beforeunload'); // or confirm depending on implementation
        await dialog.dismiss();
    });

});