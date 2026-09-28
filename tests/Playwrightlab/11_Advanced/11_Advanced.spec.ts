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

test('Click on Menu Advanced option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-advanced').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    await verifyCardVisible(page, 'scroll-card');

    // By id
    await expect(page.locator('#advancedDesc')).toContainText('Complex patterns for advanced automation practice.');

    // By role (more robust, recommended)
    //    await expect(page.getByRole('heading', { name: 'Modals', exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Advanced Scenarios', exact: true })).toBeVisible();

    // Also check the section is visible (has the 'section-title' class)
    await expect(page.locator('#advancedTitle')).toHaveClass(/title/);
})

test('Select Item 25 from dropdown', async ({ page }) => {
    await verifyCardVisible(page, 'scroll-card');

    const dropdown = page.locator('#scrollContainer');

    // Keep scrolling until Item #50 is visible
    while (true) {
        const item = page.locator('#scrollContainer >> text=Item #25');
        if (await item.count() > 0) {
            await item.scrollIntoViewIfNeeded();
            await expect(item).toBeVisible();
            break;
        }

        await dropdown.evaluate(el => {
            el.scrollTop = el.scrollHeight;
        });

        await page.waitForTimeout(100);
    }
});

test('Copy to clipboard', async ({ page }) => {
    await verifyCardVisible(page, 'clipboard-card');

    // Click the copy button
    await page.click('[data-testid="copy-btn"]');

    // Read clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('Hello Playwright!');
    await expect(page.locator('[data-testid="copy-status"]')).toHaveText('Copied!');
});

test('Keyboard Events 1', async ({ page }) => {
    await verifyCardVisible(page, 'clipboard-card');

    const input = page.locator('[data-testid="keyboard-input"]');
    const keyDisplay = page.locator('[data-testid="key-display"]');

    // Press Shift + A
    await input.focus();
    await page.keyboard.press('Shift+A');

    // Assert the key display text
    await expect(keyDisplay).not.toHaveText('Press any key...');

    await expect(keyDisplay).toHaveText(
        'Key: "A" | Code: "KeyA" | Shift: true | Ctrl: false | Alt: false'
    );
});

test('Keyboard Events 2', async ({ page }) => {
    await verifyCardVisible(page, 'clipboard-card');

    const input = page.locator('[data-testid="keyboard-input"]');
    const keyDisplay = page.locator('[data-testid="key-display"]');

    // Press Shift + 3 for #
    await input.focus();
    await page.keyboard.press('Shift+3');

    // Assert the key display text
    await expect(keyDisplay).not.toHaveText('Press any key...');

    await expect(keyDisplay).toHaveText(
        'Key: "3" | Code: "Digit3" | Shift: true | Ctrl: false | Alt: false'
    );
});

test('Paste into textarea', async ({ page }) => {
    await verifyCardVisible(page, 'clipboard-card');

    // Set clipboard content
    await page.evaluate(() => navigator.clipboard.writeText('Pasted via Playwright'));

    // Focus textarea and paste
    const textarea = page.locator('[data-testid="paste-area"]');
    await textarea.focus();
    await page.keyboard.press('Control+V'); // or 'Meta+V' on macOS

    await expect(textarea).toHaveValue('Pasted via Playwright');
});

test('Fetch API Data displays users', async ({ page }) => {
    await verifyCardVisible(page, 'geo-card');

    // Click the fetch button
    await page.click('[data-testid="fetch-data-btn"]');

    // Assert that the result contains expected JSON
    const apiResult = page.locator('[data-testid="api-result"]');

    // Check that "John Doe" appears in the JSON
    await expect(apiResult).toContainText('"name": "John Doe"');

    // Or check total count
    await expect(apiResult).toContainText('"total": 3');
});

test('Local Storage set and get', async ({ page }) => {
    await verifyCardVisible(page, 'geo-card');

    const localStorageKey = 'role';
    const localStorageValue = 'Tester';

    // Fill key/value
    await page.fill('[data-testid="storage-key"]', localStorageKey);
    await page.fill('[data-testid="storage-value"]', localStorageValue);

    // Click Set
    await page.click('[data-testid="set-storage-btn"]');

    // Click Get
    await page.click('[data-testid="get-storage-btn"]');

    // Assert result contains the key/value
    const storageResult = page.locator('[data-testid="storage-result"]');
    await expect(storageResult).toContainText(`${localStorageKey} = ${localStorageValue}`);

    // Click Clear All
    await page.click('[data-testid="clear-storage-btn"]');

    // Assert result text
    await expect(storageResult).toHaveText('All storage cleared');

    await page.click('[data-testid="get-storage-btn"]');
    await expect(storageResult).toContainText(`"${localStorageKey}" not found`);
});

test.describe(' Image Gallery with Lightbox', () => {
    test('Gallery items are visible', async ({ page }) => {
        await verifyCardVisible(page, 'gallery-card');

        const galleryGrid = page.locator('[data-testid="gallery-grid"]');
        await expect(galleryGrid).toBeVisible();

        // Check that all 6 items are present
        for (let i = 1; i <= 6; i++) {
            await expect(page.locator(`[data-testid="gallery-item-${i}"]`)).toBeVisible();
        }
    });

    test('Gallery item has image and caption', async ({ page }) => {
        await verifyCardVisible(page, 'gallery-card');
        const item = page.locator('[data-testid="gallery-item-2"]'); // Ocean
        await expect(item.locator('img')).toBeVisible();
        await expect(item).toContainText('Ocean');
    });

    test('Clicking gallery item opens lightbox', async ({ page }) => {
        await verifyCardVisible(page, 'gallery-card');
        const item = page.locator('[data-testid="gallery-item-3"]'); // Forest
        await item.click();

        const lightbox = page.locator('[data-testid="lightbox"]');
        await expect(lightbox).toBeVisible();

        // Assert the image alt attribute
        const lightboxImg = lightbox.locator('img');
        await expect(lightboxImg).toHaveAttribute('alt', 'Forest');
    });

    test('Lightbox navigation with Next button', async ({ page }) => {

        await verifyCardVisible(page, 'gallery-card');
        // Open the gallery item (Ocean in this case)
        const item = page.locator('[data-testid="gallery-item-2"]'); // Ocean
        await item.click();

        const lightbox = page.locator('[data-testid="lightbox"]');
        await expect(lightbox).toBeVisible();

        // Assert initial image alt
        const lightboxImg = lightbox.locator('img');
        await expect(lightboxImg).toHaveAttribute('alt', 'Ocean');

        // Click Next to move forward
        await page.click('[data-testid="lightbox-next"]');

        // Assert the image alt has changed (e.g. to "Forest" if that's next in sequence)
        await expect(lightboxImg).toHaveAttribute('alt', 'Forest');

        // Optionally, click Next again to cycle further
        await page.click('[data-testid="lightbox-next"]');
        await expect(lightboxImg).toHaveAttribute('alt', 'Desert');
    });

    test('Lightbox navigation with Prev button', async ({ page }) => {

        await verifyCardVisible(page, 'gallery-card');
        // Open the gallery item (Ocean in this case)
        const item = page.locator('[data-testid="gallery-item-2"]'); // Ocean
        await item.click();

        const lightbox = page.locator('[data-testid="lightbox"]');
        await expect(lightbox).toBeVisible();

        // Assert initial image alt
        const lightboxImg = lightbox.locator('img');
        await expect(lightboxImg).toHaveAttribute('alt', 'Ocean');

        // Click Next to move forward
        await page.click('[data-testid="lightbox-prev"]');

        // Assert the image alt has changed (e.g. to "Mountains" if that's Prev in sequence)
        await expect(lightboxImg).toHaveAttribute('alt', 'Mountains');
    });
});