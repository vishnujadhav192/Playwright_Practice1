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

async function countAllRowsAcrossPages(
    page: Page,
    tableRows: Locator,
    nextBtn: Locator
): Promise<{ totalRows: number; pageCount: number }> {
    // Jump directly to page 1 first, if a page-1 button exists
    const page1Btn = page.getByTestId('page-1');
    if (await page1Btn.isVisible()) {
        await page1Btn.click();
        await expect(tableRows.first()).toBeVisible();
    }

    let totalRows = 0;
    let pageCount = 0;

    while (true) {
        await expect(tableRows.first()).toBeVisible();
        totalRows += await tableRows.count();
        pageCount++;

        if (await nextBtn.isDisabled()) break;
        await nextBtn.click();
    }

    return { totalRows, pageCount };
}

async function getAllRolesAcrossPages(page: Page): Promise<string[]> {
    const roles: string[] = [];
    const nextBtn = page.getByTestId('page-next');

    // Always reset to page 1
    const firstPageBtn = page.getByTestId('page-1');
    if (await firstPageBtn.isVisible()) {
        await firstPageBtn.click();
    }

    while (true) {
        const roleCells = page.locator('[data-testid="table-body"] tr td:nth-child(5)');
        roles.push(...await roleCells.allTextContents());

        if (await nextBtn.isDisabled()) break;
        await nextBtn.click();
        await expect(roleCells.first()).toBeVisible();
    }

    return roles;
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

    test('ID column sorts numerically, not alphabetically', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');

        await tableCard.getByTestId('sort-id').click(); // ascending
        const idValues = await tableRows.locator('td:nth-child(2)').allTextContents();
        const idNumbers = idValues.map(Number);
        const sortedAscending = [...idNumbers].sort((a, b) => a - b);

        expect(idNumbers, 'IDs should be sorted numerically ascending').toEqual(sortedAscending);
    });

    test('Name column sorts alphabetically', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');

        await tableCard.getByTestId('sort-name').click(); // ascending
        const names = await tableRows.locator('td:nth-child(3)').allTextContents();
        const sortedNames = [...names].sort((a, b) => a.localeCompare(b));

        expect(names, 'Names should be sorted alphabetically ascending').toEqual(sortedNames);
    });

    //   test('Sortable columns actually reorder rows on click', async ({ page }) => {

    //     await verifyCardVisible(page, 'table-card');
    //     const tableCard = page.getByTestId('table-card');
    //     const tableRows = tableCard.locator('table tbody tr');

    //     // cellIndex maps to nth-child position in <tr>: 1=checkbox, 2=ID, 3=Name, 4=Email, 5=Role, 6=Status, 7=Actions
    //     const sortableColumns = [
    //       { testId: 'sort-id', cellIndex: 2 },
    //       { testId: 'sort-name', cellIndex: 3 },
    //       { testId: 'sort-email', cellIndex: 4 },
    //       { testId: 'sort-status', cellIndex: 6 },
    //     ];

    //     for (const col of sortableColumns) {
    //       const beforeValues = await tableRows.locator(`td:nth-child(${col.cellIndex})`).allTextContents();

    //       // Click to sort ascending
    //       await tableCard.getByTestId(col.testId).click();
    //       const afterAsc = await tableRows.locator(`td:nth-child(${col.cellIndex})`).allTextContents();
    //       expect(afterAsc, `Sorting by ${col.testId} should change row order`).not.toEqual(beforeValues);

    //       // Click again to sort descending
    //       await tableCard.getByTestId(col.testId).click();
    //       const afterDesc = await tableRows.locator(`td:nth-child(${col.cellIndex})`).allTextContents();
    //       expect(afterDesc, `Second click on ${col.testId} should toggle sort direction`).not.toEqual(afterAsc);
    //     }
    //   });
});
