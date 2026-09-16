import { test, expect } from '@playwright/test'

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

    const customDropDownCard = page.getByTestId('custom-dropdown-card');
    await customDropDownCard.scrollIntoViewIfNeeded();
    await expect(customDropDownCard).toBeVisible();
});

// test.afterEach(async ({ page }) => {
//     //await page.close();
// });

test.describe('Dropdown', () => {

    test('Select value from custom dropdown', async ({ page }) => {

        // Click the dropdown trigger to open the menu
        // await page.click('#customDropdownTrigger');

        const dropdownTrigger = page.locator('#customDropdownTrigger');
        await dropdownTrigger.click();

        // Select the "High" option by its test id
        //await page.click('[data-testid="custom-opt-high"]');
        
        const customDropdownMenu = page.locator('[data-testid="custom-opt-high"]');
        await customDropdownMenu.click();

        // Assert that the value has changed
        const selectedValue = await page.textContent('#customDropdownValue');
        expect(selectedValue).toBe('High');

        // Or check the result display
        const resultText = await page.textContent('#customDropdownResult');
        expect(resultText).toContain('high');
    });
});