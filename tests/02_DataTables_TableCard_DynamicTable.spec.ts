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

test.describe(' Dynamic Table', () => {

    test('Read dynamic table values', async ({ page }) => {
        await verifyCardVisible(page, 'dynamic-table-card');

        // Example: Find the row where Fruit = "Apple"
        const rows = page.locator("[data-testid^='dyn-row']");
        const rowCount = await rows.count();

        let appleRowIndex = -1;
        for (let i = 0; i < rowCount; i++) {
            const fruitName = await page.locator(`[data-testid='dyn-cell-${i}-fruit']`).innerText();
            if (fruitName === 'Apple') {
                appleRowIndex = i;
                break;
            }
        }

        expect(appleRowIndex).not.toBe(-1);

        // Get stock and price for Apple
        const stock = await page.locator(`[data-testid='dyn-cell-${appleRowIndex}-stock']`).innerText();
        const price = await page.locator(`[data-testid='dyn-cell-${appleRowIndex}-price-₹-kg-']`).innerText();

        console.log(`Apple stock = ${stock}, price = ${price}`);

        // Assert stock is a number > 0
        expect(parseInt(stock, 10)).toBeGreaterThan(0);

        // Assert price starts with ₹
        expect(price).toMatch(/^₹\d+/);
    });
});