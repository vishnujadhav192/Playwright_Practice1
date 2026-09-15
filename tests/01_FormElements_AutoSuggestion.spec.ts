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

    const autoCompleteCard = page.getByTestId('autocomplete-card');
    await autoCompleteCard.scrollIntoViewIfNeeded();
    await expect(autoCompleteCard).toBeVisible();
});

// test.afterEach(async ({ page }) => {
//     //await page.close();
// });

test.describe('Auto Suggest', () => {

    test('should show suggestions and allow selection', async ({ page }) => {

        const autoCompleteInput = page.locator('[data-testid="autocomplete-input"]');

        await autoCompleteInput.fill('A');

        const suggestions = page.locator('#autocompleteList div');
        await expect(suggestions).toHaveCount(6); // JavaScript, Java, Scala, Dart, Haskell, Lua

        await expect(suggestions).toContainText([
            'JavaScript',
            'Java',
            'Scala',
            'Dart',
            'Haskell',
            'Lua'
        ]);

        // Click on JavaScript suggestion
        //await page.getByRole('option', { name: 'Haskell' }).click();

        //await page.getByTestId('autocomplete-option-haskell').click();
        await suggestions.filter({ hasText: 'Haskell' }).click();

        // Verify selected tag appears
        const selectedTags = page.getByTestId('selected-tags');
        await expect(selectedTags).toContainText('Haskell');
    });

    test('Auto suggest hides selected option', async ({ page }) => {

        const autoCompleteInput = page.locator('[data-testid="autocomplete-input"]');

        await autoCompleteInput.fill('A');

        const suggestions = page.locator('#autocompleteList div');
        await expect(suggestions).toHaveCount(6); // JavaScript, Java, Scala, Dart, Haskell, Lua

        await expect(suggestions).toContainText([
            'JavaScript',
            'Java',
            'Scala',
            'Dart',
            'Haskell',
            'Lua'
        ]);

        // Click on JavaScript suggestion
        //await page.getByRole('option', { name: 'Haskell' }).click();

        //await page.getByTestId('autocomplete-option-haskell').click();
        await suggestions.filter({ hasText: 'Haskell' }).click();

        // Verify selected tag appears
        const selectedTags = page.getByTestId('selected-tags');
        await expect(selectedTags).toContainText('Haskell');

        await autoCompleteInput.fill('Haskell');

        // Assert "No results found" message appears
        await expect(page.locator('.autocomplete-no-results')).toHaveText('No results found');

        // Assert Haskell option is not present anymore
        await expect(page.getByRole('option', { name: 'Haskell' })).toHaveCount(0);
        await expect(page.getByTestId('autocomplete-option-haskell')).toBeHidden();
    });

    test('Auto suggest shows No results on unmatched input at first place', async ({ page }) => {

        const autoCompleteInput = page.locator('[data-testid="autocomplete-input"]');

        await autoCompleteInput.fill('Q');

        // Assert "No results found" message appears
        await expect(page.locator('.autocomplete-no-results')).toHaveText('No results found');

        // Assert that no options are rendered
        await expect(page.locator('#autocompleteList div[role="option"]')).toHaveCount(0);
    });
});