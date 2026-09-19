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

test.describe('Inline Editable Table', () => {

    test('Update MacBook Pro price', async ({ page }) => {

        await verifyCardVisible(page, 'editable-table-card');

        // Locate the price cell for MacBook Pro
        const priceCell = page.locator("[data-testid='edit-price-1']");
        const qtyCell = page.locator("[data-testid='edit-qty-1']");
        const totalCell = page.locator("[data-testid='edit-total-1']");
        const grandTotal = page.locator("[data-testid='grand-total']");

        // Update price
        await priceCell.click();

        await priceCell.fill('5000');

        // Get quantity

        const qtyValue = await qtyCell.innerText();

        await totalCell.click();

        // Assert row total updated correctly
        await expect(totalCell).toHaveText('$5,000');

        // Assert grand total updated
        await expect(grandTotal).toHaveText('$7,947');
    });

    test('Update iPhone 15 Pro price and quantity', async ({ page }) => {

        await verifyCardVisible(page, 'editable-table-card');

        // Locate the price cell for iPhone 15 Pro
        const priceCell = page.locator("[data-testid='edit-price-2']");
        const qtyCell = page.locator("[data-testid='edit-qty-2']");
        const totalCell = page.locator("[data-testid='edit-total-2']");
        const grandTotal = page.locator("[data-testid='grand-total']");

        // Update price
        await priceCell.click();
        //await page.keyboard.press('Control+A'); // select all
        //await page.keyboard.type('1299');       // new price

        await priceCell.fill('1299');

        // Update quantity
        await qtyCell.click();
        //await page.keyboard.press('Control+A');
        //await page.keyboard.type('3');          // new quantity

        await qtyCell.fill('3');
        await totalCell.click();

        // Assert row total updated correctly
        await expect(totalCell).toHaveText('$3,897');

        // Assert grand total updated
        await expect(grandTotal).toHaveText('$6,945');
    });

    test('Update AirPods Max Quantity', async ({ page }) => {

        await verifyCardVisible(page, 'editable-table-card');

        // Locate the price cell for AirPods Max
        const priceCell = page.locator("[data-testid='edit-price-3']");
        const qtyCell = page.locator("[data-testid='edit-qty-3']");
        const totalCell = page.locator("[data-testid='edit-total-3']");
        const grandTotal = page.locator("[data-testid='grand-total']");

        // Get price
        const priceValue = await priceCell.innerText();

        // Update quantity
        await qtyCell.click();

        await qtyCell.fill('10');

        await totalCell.click();

        // Assert row total updated correctly
        await expect(totalCell).toHaveText('$24,990');

        // Assert grand total updated
        await expect(grandTotal).toHaveText('$27,937');
    });

    test('Update all details', async ({ page }) => {

        await verifyCardVisible(page, 'editable-table-card');

        // Locate the price cell for iPhone 15 Pro

        const nameCell = page.locator("[data-testid='edit-product-2']");
        const priceCell = page.locator("[data-testid='edit-price-2']");
        const qtyCell = page.locator("[data-testid='edit-qty-2']");
        const totalCell = page.locator("[data-testid='edit-total-2']");
        const grandTotal = page.locator("[data-testid='grand-total']");

        //update name
        await nameCell.click();
        await nameCell.fill('Product1');

        // Update price
        await priceCell.click();
        await priceCell.fill('1299');

        // Update quantity
        await qtyCell.click();
        await qtyCell.fill('3');

        await totalCell.click();

        // Assert row total updated correctly
        await expect(totalCell).toHaveText('$3,897');

        // Assert grand total updated
        await expect(grandTotal).toHaveText('$6,945');
    });
});