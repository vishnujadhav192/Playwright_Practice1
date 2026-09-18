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

test.describe('Column sorting behavior', () => {

    test('Verify which columns have sortable markers', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');

        // Sortable columns
        await expect(tableCard.getByTestId('sort-id')).toHaveClass(/sortable/);
        await expect(tableCard.getByTestId('sort-name')).toHaveClass(/sortable/);
        await expect(tableCard.getByTestId('sort-email')).toHaveClass(/sortable/);
        await expect(tableCard.getByTestId('sort-status')).toHaveClass(/sortable/);

        // Non-sortable columns should NOT have the sortable class
        await expect(tableCard.getByTestId('col-role')).not.toHaveClass(/sortable/);
        await expect(tableCard.getByTestId('col-actions')).not.toHaveClass(/sortable/);
    });

    test('Non-sortable columns (Role, Actions) do not trigger sorting', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');

        const nonSortable = ['col-role', 'col-actions'];

        for (const testId of nonSortable) {
            const beforeValues = await tableRows.locator('td:nth-child(2)').allTextContents(); // reference: ID column order
            await tableCard.getByTestId(testId).click();
            const afterValues = await tableRows.locator('td:nth-child(2)').allTextContents();

            expect(afterValues, `Clicking ${testId} should not reorder rows`).toEqual(beforeValues);
        }
    });

    test('ID column sorts numerically ascending, not alphabetically', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');

        await tableCard.getByTestId('sort-id').click(); // ascending
        const idValues = await tableRows.locator('td:nth-child(2)').allTextContents();
        const idNumbers = idValues.map(Number);
        const sortedAscending = [...idNumbers].sort((a, b) => a - b);

        expect(idNumbers, 'IDs should be sorted numerically ascending').toEqual(sortedAscending);
    });

    test('ID column sorts numerically descending, not alphabetically', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');

        await tableCard.getByTestId('sort-id').click(); // descending
        await tableCard.getByTestId('sort-id').click(); // descending
        const idValues = await tableRows.locator('td:nth-child(2)').allTextContents();
        const idNumbers = idValues.map(Number);
        const sortedDescending = [...idNumbers].sort((a, b) => b - a);

        expect(idNumbers, 'IDs should be sorted numerically descending').toEqual(sortedDescending);
    });

    test('Name column sorts alphabetically in ascending order', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');

        await tableCard.getByTestId('sort-name').click(); // ascending
        const names = await tableRows.locator('td:nth-child(3)').allTextContents();
        const sortedNames = [...names].sort((a, b) => a.localeCompare(b));

        expect(names, 'Names should be sorted alphabetically ascending').toEqual(sortedNames);
    });

    test('Name column sorts alphabetically in descending order', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');

        await tableCard.getByTestId('sort-name').click(); // ascending
        await tableCard.getByTestId('sort-name').click(); //descending
        const names = await tableRows.locator('td:nth-child(3)').allTextContents();
        const sortedNames = [...names].sort((a, b) => b.localeCompare(a));

        expect(names, 'Names should be sorted alphabetically descending').toEqual(sortedNames);
    });

    test('Email column sorts alphabetically in ascending order', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');

        await tableCard.getByTestId('sort-email').click(); // ascending
        const emails = await tableRows.locator('td:nth-child(4)').allTextContents();
        const sortedEmails = [...emails].sort((a, b) => a.localeCompare(b));

        expect(emails, 'Names should be sorted alphabetically ascending').toEqual(sortedEmails);
    });

    test('Email column sorts alphabetically in descending order', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');

        await tableCard.getByTestId('sort-email').click(); // ascending
        await tableCard.getByTestId('sort-email').click(); // descending
        const emails = await tableRows.locator('td:nth-child(4)').allTextContents();
        const sortedEmails = [...emails].sort((a, b) => b.localeCompare(a));

        expect(emails, 'Names should be sorted alphabetically descending').toEqual(sortedEmails);
    });

    test('Status column sorts alphabetically in ascending order', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');

        await tableCard.getByTestId('sort-status').click(); // ascending
        const status1 = await tableRows.locator('td:nth-child(6)').allTextContents();
        const sortedStatus = [...status1].sort((a, b) => a.localeCompare(b));

        expect(status1, 'Names should be sorted alphabetically ascending').toEqual(sortedStatus);
    });

    test('Status column sorts alphabetically in descending order', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');

        await tableCard.getByTestId('sort-status').click(); // ascending
        await tableCard.getByTestId('sort-status').click(); // descending

        const status1 = await tableRows.locator('td:nth-child(6)').allTextContents();
        const sortedStatus = [...status1].sort((a, b) => b.localeCompare(a));

        expect(status1, 'Names should be sorted alphabetically descending').toEqual(sortedStatus);
    });
});