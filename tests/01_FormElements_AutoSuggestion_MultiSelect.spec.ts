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


test.describe('Multi-Select', () => {

    test('Selecting single Framework by value', async ({ page }) => {
        const multiSelectCard = page.getByTestId('multiselect-card');
        await multiSelectCard.scrollIntoViewIfNeeded();
        await expect(multiSelectCard).toBeVisible();

        const multiSelect = page.locator('[data-testid="multi-select"]');

        await expect(multiSelect).toBeVisible();

        // Select just React
        await multiSelect.selectOption('react');

        // Assert only React is selected
        await expect(multiSelect).toHaveValue('react');

        // Alternative: using toHaveValues (still works for single selection)
        await expect(multiSelect).toHaveValues(['react']);

        // Assert that the result display shows "Selected: React"
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: React');
    });

    test('Selecting multiple Frameworks by label, value, index', async ({ page }) => {

        const multiSelectCard = page.getByTestId('multiselect-card');
        await multiSelectCard.scrollIntoViewIfNeeded();
        await expect(multiSelectCard).toBeVisible();

        const multiSelect = page.locator('[data-testid="multi-select"]');

        await expect(multiSelect).toBeVisible();

        // Select multiple options by labels
        await multiSelect.selectOption([{ label: 'Astro' }, { label: 'Angular' }, { label: 'Remix' }]);
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: Angular, Remix, Astro');

        // Select multiple options by values
        await multiSelect.selectOption([{ value: 'nuxt' }, { value: 'vue' }, { value: 'nextjs' }]);
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: Vue.js, Next.js, Nuxt.js');

        // Select multiple options by index
        await multiSelect.selectOption([{ index: 0 }, { index: 2 }, { index: 3 }]);
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: React, Angular, Svelte');
    });

    test('select framework one by one using keyboard', async ({ page }) => {
        const multiSelectCard = page.getByTestId('multiselect-card');
        await multiSelectCard.scrollIntoViewIfNeeded();
        await expect(multiSelectCard).toBeVisible();

        const select = page.getByTestId('multi-select');
        await select.focus();

        await page.keyboard.press('Home');
        // await page.keyboard.press('Space'); //Not needed
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: React');

        await page.keyboard.press('ArrowDown');
        // await page.keyboard.press('Space'); //Not needed
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: Vue.js');

        await page.keyboard.press('ArrowDown');
        // await page.keyboard.press('Space'); //Not needed
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: Angular');

        await page.keyboard.press('ArrowDown');
        // await page.keyboard.press('Space'); //Not needed
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: Svelte');

        await page.keyboard.press('ArrowDown');
        // await page.keyboard.press('Space'); //Not needed
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: Next.js');

        await page.keyboard.press('ArrowDown');
        // await page.keyboard.press('Space'); //Not needed
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: Nuxt.js');

        await page.keyboard.press('ArrowDown');
        // await page.keyboard.press('Space'); //Not needed
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: Remix');

        await page.keyboard.press('ArrowDown');
        // await page.keyboard.press('Space'); //Not needed
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: Astro');

    });

    test('Select first framework option using keyboard', async ({ page }) => {
        const multiSelectCard = page.getByTestId('multiselect-card');
        await multiSelectCard.scrollIntoViewIfNeeded();
        await expect(multiSelectCard).toBeVisible();

        const select = page.getByTestId('multi-select');
        await select.focus();
        await page.keyboard.press('Home'); // focus React

        // Just press Space (no Ctrl) to select the first option
        await page.keyboard.press('Space');

        await expect(select).toHaveValues(['react']);
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: React');
    });

    test('Select last framework option using keyboard', async ({ page }) => {
        const multiSelectCard = page.getByTestId('multiselect-card');
        await multiSelectCard.scrollIntoViewIfNeeded();
        await expect(multiSelectCard).toBeVisible();

        const select = page.getByTestId('multi-select');
        await select.focus();
        await page.keyboard.press('End'); // focus Astro

        // Just press Space (no Ctrl) to select the first option
        await page.keyboard.press('Space');

        await expect(select).toHaveValues(['astro']);
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: Astro');
    });

    test('Select multiple framework option using keyboard', async ({ page }) => {
        const multiSelectCard = page.getByTestId('multiselect-card');
        await multiSelectCard.scrollIntoViewIfNeeded();
        await expect(multiSelectCard).toBeVisible();

        const select = page.getByTestId('multi-select');
        await select.focus();

        await select.press('Home');
        await select.press('Space');
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: React');

        await select.press('Control+ArrowDown');
        await select.press('Space');
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: React, Vue.js');

        await select.press('Control+ArrowDown');
        await select.press('Space');
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: React, Vue.js, Angular');

        await select.press('Control+ArrowDown');
        await select.press('Space');
        await expect(page.getByTestId('selected-frameworks')).toHaveText('Selected: React, Vue.js, Angular, Svelte');
    });

    test('Select single framework option using keyboard: dynamic approach 1', async ({ page }) => {
        const multiSelectCard = page.getByTestId('multiselect-card');
        await multiSelectCard.scrollIntoViewIfNeeded();
        await expect(multiSelectCard).toBeVisible();

        const select = page.getByTestId('multi-select');
        const summary = page.getByTestId('selected-frameworks');
        await select.focus();

        const options = await select.locator('option').all();

        // Start at the first option
        await page.keyboard.press('Home');
        await page.keyboard.press('Space'); // select first option

        // Assert only the current selection
        const firstLabel = (await options[0].textContent())?.trim() ?? '';
        await expect(summary).toHaveText(`Selected: ${firstLabel}`);

        // Loop through the rest, one at a time, asserting after each
        for (let i = 1; i < options.length; i++) {
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Space');

            const label = (await options[i].textContent())?.trim() ?? '';
            await expect(summary).toHaveText(`Selected: ${label}`);
        }
    });

    test('Select multiple frameworks option using keyboard: dynamic approach 1 ', async ({ page }) => {
        const multiSelectCard = page.getByTestId('multiselect-card');
        await multiSelectCard.scrollIntoViewIfNeeded();
        await expect(multiSelectCard).toBeVisible();

        const select = page.getByTestId('multi-select');
        await select.focus();

        const options = await select.locator('option').all();

        // Start at the first option
        await page.keyboard.press('Home');
        await page.keyboard.press('Space'); // select first option

        // Loop through the rest dynamically
        for (let i = 1; i < options.length; i++) {

            await select.press('Control+ArrowDown');
            await select.press('Space');
        }

        // Collect all values dynamically
        const values = await Promise.all(options.map(opt => opt.getAttribute('value')));

        // Assert all are selected
        await expect(select).toHaveValues(values);

        // Assert the result display text contains all labels
        const labels = await Promise.all(options.map(opt => opt.textContent()));
        await expect(page.getByTestId('selected-frameworks'))
            .toHaveText(`Selected: ${labels.join(', ')}`);
    });

    test('Select multiple frameworks option using keyboard: dynamic approach 2', async ({ page }) => {
        const multiSelectCard = page.getByTestId('multiselect-card');
        await multiSelectCard.scrollIntoViewIfNeeded();
        await expect(multiSelectCard).toBeVisible();

        const select = page.getByTestId('multi-select');
        const summary = page.getByTestId('selected-frameworks');
        await select.focus();

        const options = await select.locator('option').all();

        // Start at the first option
        await page.keyboard.press('Home');
        await page.keyboard.press('Space'); // select first option

        const selectedLabels: string[] = [];
        const firstLabel = (await options[0].textContent())?.trim() ?? '';
        selectedLabels.push(firstLabel);
        await expect(summary).toHaveText(`Selected: ${selectedLabels.join(', ')}`);

        // Loop through the rest, one at a time, asserting after each
        for (let i = 1; i < options.length; i++) {
            await select.press('Control+ArrowDown');
            await select.press('Space');

            const label = (await options[i].textContent())?.trim() ?? '';
            selectedLabels.push(label);

            await expect(summary).toHaveText(`Selected: ${selectedLabels.join(', ')}`);
        }
    });
});