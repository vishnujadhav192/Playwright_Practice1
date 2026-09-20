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

test('Click on Menu Tables option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-interactions').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    // By id
    await expect(page.locator('#interactionsHeader')).toContainText('Interactions');

    // By role (more robust, recommended)
    await expect(page.getByRole('heading', { name: 'Interactions' })).toBeVisible();

    // Also check the section is visible (has the 'visible' class)
    await expect(page.locator('#interactionsHeader')).toHaveClass(/visible/);
})

test.describe('Drag and Drop', () => {

    test('Drop here to remove', async ({ page }) => {

        await verifyCardVisible(page, 'dnd-card');

        // Locate the draggable item (e.g., "Write code")
        const source = page.locator('[data-testid="dnd-item-2"]');

        // Locate the drop zone (e.g., "Drop here to remove")
        const target = page.locator('[data-testid="drop-zone"]');

        // Perform drag and drop
        await source.dragTo(target);

        // Assertion: check that the item is removed from the list
        await expect(page.locator('[data-testid="dnd-item-2"]')).toHaveCount(0);
    });

    test('drag and drop all items', async ({ page }) => {

        await verifyCardVisible(page, 'dnd-card');
        const dropZone = page.locator('[data-testid="drop-zone"]');

        // Keep dragging until no items remain
        while (await page.locator('.dnd-item').count() > 0) {
            const firstItem = page.locator('.dnd-item').first();
            await firstItem.dragTo(dropZone);
        }

        // Final assertion
        await expect(page.locator('.dnd-item')).toHaveCount(0);
    });

    test('drag and drop to reorder items', async ({ page }) => {

        await verifyCardVisible(page, 'dnd-card');

        const textsBefore = (await page.locator('.dnd-item').allTextContents()).map(t => t.trim());

        console.log(textsBefore)

        console.log("Index of Write code", textsBefore.indexOf('Write code'))
        console.log("Index of Deploy", textsBefore.indexOf('Deploy'))

        const source = page.locator('[data-testid="dnd-item-5"]'); // Deploy
        const target = page.locator('[data-testid="dnd-item-2"]'); // Write code

        await source.dragTo(target);

        // Get trimmed texts
        const textsAfter = (await page.locator('.dnd-item').allTextContents()).map(t => t.trim());

        console.log(textsAfter)

        console.log("Index of Write code", textsAfter.indexOf('Write code'))
        console.log("Index of Deploy", textsAfter.indexOf('Deploy'))

        // Assertions
        expect(textsAfter).toContain('Deploy');
        const deployIndex = textsAfter.indexOf('Deploy');
        const writeCodeIndex = textsAfter.indexOf('Write code');
        expect(deployIndex).toBeLessThan(writeCodeIndex); // Deploy should now be before Run tests
    });

    test('drag and drop reorder without loss or duplication', async ({ page }) => {
        await verifyCardVisible(page, 'dnd-card');

        const source = page.locator('[data-testid="dnd-item-5"]'); // Deploy
        const target = page.locator('[data-testid="dnd-item-4"]'); // Run tests

        await source.dragTo(target);

        // Get trimmed texts after reorder
        const texts = (await page.locator('.dnd-item').allTextContents()).map(t => t.trim());

        // 1️⃣ Assert no items are lost
        expect(texts.length).toBe(5);

        // 2️⃣ Assert no duplicates (Set size == array length)
        const unique = new Set(texts);
        expect(unique.size).toBe(texts.length);

        // 3️⃣ Assert expected before/after order
        const deployIndex = texts.indexOf('Deploy');
        const runTestsIndex = texts.indexOf('Run tests');
        expect(deployIndex).toBeLessThan(runTestsIndex);

        // 4️⃣ Assert the whole list still contains all original items
        const expectedItems = [
            'Check emails',
            'Write code',
            'Review PRs',
            'Run tests',
            'Deploy'
        ];
        expectedItems.forEach(item => expect(texts).toContain(item));
    });
});