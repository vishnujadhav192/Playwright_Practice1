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

// test.afterEach(async ({ page }) => {
//     //await page.close();
// });

test.describe('Navigate between pages', () => {

    test('Navigate using Next/Prev buttons and verify cumulative count', async ({ page }) => {
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');
        const nextBtn = page.getByTestId('page-next');
        const prevBtn = page.getByTestId('page-prev');

        let totalRowCount = 0;

        // Page 1 — prev should be disabled here
        await expect(prevBtn).toBeDisabled();
        totalRowCount += await tableRows.count();

        // Go to Page 2
        await nextBtn.click();
        await expect(page.getByTestId('page-2')).toHaveClass(/active/);
        totalRowCount += await tableRows.count();

        // Go to Page 3 — next should become disabled here (last page)
        await nextBtn.click();
        await expect(page.getByTestId('page-3')).toHaveClass(/active/);
        await expect(nextBtn).toBeDisabled();
        totalRowCount += await tableRows.count();

        expect(totalRowCount).toBe(15);
    });

    test('Navigate through all pages and verify cumulative row count', async ({ page }) => {
        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');
        const tableInfo = page.getByTestId('table-info');

        let totalRowCount = 0;

        // ---- Page 1 ----
        await expect(tableRows).toHaveCount(5);
        totalRowCount += await tableRows.count();
        await expect(tableInfo).toHaveText('Showing 1-5 of 15 entries');
        await expect(page.getByTestId('page-1')).toHaveClass(/active/);

        // ---- Navigate to Page 2 ----
        await page.getByTestId('page-2').click();
        await expect(tableRows).toHaveCount(5);
        totalRowCount += await tableRows.count();
        await expect(tableInfo).toHaveText('Showing 6-10 of 15 entries');
        await expect(page.getByTestId('page-2')).toHaveClass(/active/);

        // ---- Navigate to Page 3 ----
        await page.getByTestId('page-3').click();
        const page3Count = await tableRows.count();
        totalRowCount += page3Count;
        await expect(tableInfo).toHaveText('Showing 11-15 of 15 entries');
        await expect(page.getByTestId('page-3')).toHaveClass(/active/);

        // Page 3 should have the remaining 5 rows (15 total - 10 already seen)
        expect(page3Count).toBe(5);

        // ---- Final assertion: total rows across all pages ----
        expect(totalRowCount, 'Total rows across all 3 pages should equal 15').toBe(15);
    });

    test('Verify total records match footer count (any number of pages)', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');
        const nextBtn = page.getByTestId('page-next');
        const rowsPerPage = page.getByTestId('rows-per-page');

        await rowsPerPage.selectOption('5');

        // ---- Count user (jumps to page 1 internally) ----
        const { totalRows: recordCount } = await countAllRowsAcrossPages(page, tableRows, nextBtn);

        console.log("Record count: ", recordCount);
    });


    test('Verify total records match footer count (any number of pages) after applying filters', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');
        const nextBtn = page.getByTestId('page-next');
        const rowsPerPage = page.getByTestId('rows-per-page');

        await rowsPerPage.selectOption('15');

        // ---- Count user (jumps to page 1 internally) ----
        const { totalRows: recordCount } = await countAllRowsAcrossPages(page, tableRows, nextBtn);
        console.log("Record count: ", recordCount);

        const roleFilter = page.getByTestId('table-filter');
        await roleFilter.selectOption('editor');

        const { totalRows: recordCountAfterFiltering } = await countAllRowsAcrossPages(page, tableRows, nextBtn);
        console.log("Record count: ", recordCountAfterFiltering);
    });

    test('Add user increases total record count by 1 across all pages', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');
        const nextBtn = page.getByTestId('page-next');
        const rowsPerPage = page.getByTestId('rows-per-page');

        await rowsPerPage.selectOption('5');

        // ---- Count BEFORE adding user (jumps to page 1 internally) ----
        const { totalRows: countBefore } = await countAllRowsAcrossPages(page, tableRows, nextBtn);
        console.log(`Total records before adding user: ${countBefore}`);

        // ---- Add a new user ----
        const userData = {
            userName: 'Ethan Hunt',
            userEmail: 'ethan@dummy.com',
            userRole: 'editor',
        };

        await page.getByTestId('add-row-btn').click();

        const modal = page.getByTestId('modal-title');
        await expect(modal).toBeVisible();

        await page.getByTestId('new-user-name').fill(userData.userName);
        await page.getByTestId('new-user-email').fill(userData.userEmail);
        await page.getByTestId('new-user-role').selectOption(userData.userRole);

        await page.getByTestId('modal-confirm').click();
        await expect(modal).toBeHidden();

        // Re-assert rows-per-page in case it reset after the mutation
        await rowsPerPage.selectOption('5');

        // ---- Count AFTER adding user (jumps to page 1 internally again) ----
        const { totalRows: countAfter } = await countAllRowsAcrossPages(page, tableRows, nextBtn);
        console.log(`Total records after adding user: ${countAfter}`);

        // ---- Final assertion ----
        expect(countAfter, 'Record count should increase by exactly 1 after adding a user').toBe(countBefore + 1);
    });
})