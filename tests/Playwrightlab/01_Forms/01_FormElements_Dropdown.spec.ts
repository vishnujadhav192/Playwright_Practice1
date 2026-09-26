import { test, expect, Page } from '@playwright/test'

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

test.describe('Dropdown', () => {

    test('Select value from custom dropdown', async ({ page }) => {

        // Click the dropdown trigger to open the menu
        // await page.click('#customDropdownTrigger');

        await verifyCardVisible(page, 'custom-dropdown-card');

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

    test('Select value from searchable dropdown', async ({ page }) => {

        await verifyCardVisible(page, 'searchable-dropdown-card');

        const dropdownSelect = page.getByTestId('searchable-dropdown-input');
        // await dropdownSelect.click();

        await dropdownSelect.fill('New')

        // Wait until "New York" becomes visible in the dropdown menu
        const newYorkOption = page.locator('[data-testid="city-new-york"]');
        await expect(newYorkOption).toBeVisible();

        // Click the option
        await newYorkOption.click();

        // Assert that the result display shows "New York"
        const result = page.locator('[data-testid="searchable-dropdown-result"]');
        await expect(result).toHaveText('Selected: new-york');
    });

    test('Searchable dropdown shows no results', async ({ page }) => {
        await verifyCardVisible(page, 'searchable-dropdown-card');

        const dropdownSelect = page.locator('[data-testid="searchable-dropdown-input"]');
        await dropdownSelect.fill('XYZ'); // some text that doesn't match any city

        // Locate the "No results found" element
        const noResults = page.locator('.no-results');

        // Assert that it is visible and has the correct text
        await expect(noResults).toBeVisible();
        await expect(noResults).toHaveText('No results found');
    });

    test('Select value from Grouped Options', async ({ page }) => {
        await verifyCardVisible(page, 'grouped-dropdown-card');

        const dropdown = page.locator('[data-testid="grouped-select"]');

        // Select by value
        await dropdown.selectOption({ value: 'suv' });

        // Assert that the result display updates correctly
        const result = page.locator('[data-testid="grouped-select-result"]');
        await expect(result).toHaveText('SUV');
    });

    test('Select value from Cascading Dropdowns', async ({ page }) => {
        await verifyCardVisible(page, 'cascading-dropdown-card');

        // Step 1: Select a continent
        const continentDropdown = page.locator('[data-testid="cascade-continent"]');
        await continentDropdown.selectOption({ value: 'asia' });

        // Step 2: Wait for country dropdown to be enabled and populated
        const countryDropdown = page.locator('[data-testid="cascade-country"]');
        await expect(countryDropdown).not.toBeDisabled();

        await countryDropdown.selectOption({ value: 'india' });

        // Step 3: Wait for city dropdown to be enabled and populated
        const cityDropdown = page.locator('[data-testid="cascade-city"]');
        await expect(cityDropdown).not.toBeDisabled();

        await cityDropdown.selectOption({ value: 'mumbai' });

        // Step 4: Assert the final result display
        const result = page.locator('[data-testid="cascade-result"]');
        await expect(result).toContainText('India');
        await expect(result).toHaveText('Selected: Asia → India → Mumbai');
    });

    test('Select value from Multi-Select Checkboxes', async ({ page }) => {
        await verifyCardVisible(page, 'checkbox-dropdown-card');

        // Step 1: Open the dropdown

        const checkboxDropdown = page.locator('[data-testid="checkbox-dropdown-trigger"]');
        await checkboxDropdown.click();

        await page.locator('[data-testid="topping-peppers"] input').check();

        // Step 2: Select multiple toppings
        await page.locator('[data-testid="topping-cheese"] input').check();
        await page.locator('[data-testid="topping-pepperoni"] input').check();
        await page.locator('[data-testid="topping-mushrooms"] input').check();

        await page.locator('[data-testid="topping-peppers"] input').uncheck();

        await checkboxDropdown.click();

        // Step 3: Assert the result display
        const result = page.locator('[data-testid="checkbox-dropdown-result"]');
        await expect(result).toHaveText('Selected: cheese, pepperoni, mushrooms');
    });

    test('Disable option in dropdown', async ({ page }) => {
        await verifyCardVisible(page, 'disabled-options-card');

        const dropdown = page.locator('[data-testid="disabled-options-select"]');

        // ✅ Select an enabled option
        await dropdown.selectOption({ value: 'enterprise' });

        const result = page.locator('[data-testid="disabled-options-result"]');
        await expect(result).toHaveText('Selected: Enterprise — $99/mo');
        await expect(result).toBeEnabled();

        // ❌ Verify disabled options cannot be selected
        const proOption = page.locator('[data-testid="plan-pro"]');
        await expect(proOption).toBeDisabled();

        const customOption = page.locator('[data-testid="plan-custom"]');
        await expect(customOption).toBeDisabled();
    });

    test('Select job title from focus-gated dropdown', async ({ page }) => {
        await verifyCardVisible(page, 'focus-dropdown-card');

        // Step 1: Open the dropdown (focus the element)
        const trigger = page.locator('[data-testid="focus-dropdown-input"]');
        await trigger.click();

        // Step 2: Select an option while dropdown is open
        let option = page.locator('[data-testid="focus-opt-qa-lead"]');
        await option.click();

        // Step 3: Assert the result display
        let result = page.locator('[data-testid="focus-dropdown-result"]');
        await expect(result).toHaveText('Selected: QA Lead');

        await trigger.click();

        option = page.locator('[data-testid="focus-opt-cto"]');
        await option.click();

        // Step 3: Assert the result display
        result = page.locator('[data-testid="focus-dropdown-result"]');
        await expect(result).toHaveText('Selected: CTO');

    });

    test('Select category from delayed (async) dropdown', async ({ page }) => {
        await verifyCardVisible(page, 'delayed-dropdown-card');

        const select = page.locator('[data-testid="delayed-select"]');

        const loadBtn = page.locator('[data-testid="load-delayed-dropdown-btn"]');
        const loader = page.locator('[data-testid="delayed-dropdown-loader"]');
        const result = page.locator('[data-testid="delayed-dropdown-result"]');

        // Initially the select should be disabled
        await expect(select).toBeDisabled();

        // Step 1: Click to trigger the async load
        await loadBtn.click();

        // Step 2 (optional): Assert loader appears while fetching
        await expect(loader).toBeVisible();

        // Step 3: Wait for the button to reflect the loaded state
        await expect(loadBtn).toBeDisabled();
        await expect(loadBtn).toHaveText('Options Loaded');

        // Step 4: Wait for select to become enabled and loader to hide
        await expect(select).toBeEnabled();
        await expect(loader).toBeHidden();

        // Step 5: Select an option
        await select.selectOption('electronics');

        // Step 6: Assert the result
        await expect(result).toHaveText('Selected: Electronics');
    });
});