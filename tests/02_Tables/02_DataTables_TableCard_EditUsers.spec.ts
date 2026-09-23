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

async function deleteUserById(page: Page, userId: number): Promise<boolean> {
    const tableRows = page.locator('[data-testid="table-body"] tr');
    const nextBtn = page.getByTestId('page-next');

    // Always reset to page 1
    const page1Btn = page.getByTestId('page-1');
    if (await page1Btn.isVisible()) {
        await page1Btn.click();
        await expect(tableRows.first()).toBeVisible();
    }

    while (true) {
        const row = page.getByTestId(`table-row-${userId}`);
        if (await row.isVisible()) {
            // Found the row, delete it
            await page.getByTestId(`delete-${userId}`).click();
            await expect(row).toHaveCount(0);
            return true;
        }

        // If not found and next page exists, go forward
        if (await nextBtn.isDisabled()) break;
        await nextBtn.click();
        await expect(tableRows.first()).toBeVisible();
    }

    return false; // record not found
}

// test.afterEach(async ({ page }) => {
//     //await page.close();
// });


test.describe('Edit / Delete users', () => {

    test('Delete user', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const deleteRow = page.getByTestId('delete-1');
        await deleteRow.click();

        // wait for row to disappear
        await expect(page.getByTestId('table-row-1')).toHaveCount(0);

        const deletedRow = page.locator('[data-testid="table-body"] tr').filter({ hasText: 'Alice Johnson' });
        await expect(deletedRow).toHaveCount(0);
        await expect(page.locator('[data-testid="table-body"]')).not.toContainText('alice@example.com');

        //await page.getByTestId('delete-1').click();
        // const row = page.locator('[data-testid="table-body"] tr').filter({ hasText: 'Alice Johnson' });
        // await row.getByTestId('delete-1').click();
    })

    test('Check record count after delete', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');
        const nextBtn = page.getByTestId('page-next');
        const rowsPerPage = page.getByTestId('rows-per-page');

        await rowsPerPage.selectOption('5');

        // ---- Count BEFORE deleting user (jumps to page 1 internally) ----
        const { totalRows: countBefore } = await countAllRowsAcrossPages(page, tableRows, nextBtn);
        console.log(`Total records before adding user: ${countBefore}`);

        const deleted = await deleteUserById(page, 8);
        expect(deleted).toBe(true);

        // wait for row to disappear
        await expect(page.getByTestId('table-row-8')).toHaveCount(0);

        // Re-assert rows-per-page in case it reset after the mutation
        await rowsPerPage.selectOption('5');

        // ---- Count AFTER deleting user (jumps to page 1 internally again) ----
        const { totalRows: countAfter } = await countAllRowsAcrossPages(page, tableRows, nextBtn);
        console.log(`Total records after adding user: ${countAfter}`);

        // ---- Final assertion ----
        expect(countAfter, 'Record count should not increase').toBe(countBefore - 1);
    });

    test('Check record count after edit', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');
        const nextBtn = page.getByTestId('page-next');
        const rowsPerPage = page.getByTestId('rows-per-page');

        await rowsPerPage.selectOption('5');

        // ---- Count BEFORE editing user (jumps to page 1 internally) ----
        const { totalRows: countBefore } = await countAllRowsAcrossPages(page, tableRows, nextBtn);
        console.log(`Total records before editing user: ${countBefore}`);

        const editRow = page.getByTestId('edit-14');
        await editRow.click();

        await page.getByTestId('edit-name-input').fill("XYZ");
        await page.getByTestId('edit-email-input').fill("XYZ@dummy.com");

        await page.getByTestId('modal-confirm').click();

        // Re-assert rows-per-page in case it reset after the mutation
        await rowsPerPage.selectOption('5');

        // ---- Count AFTER editing user (jumps to page 1 internally again) ----
        const { totalRows: countAfter } = await countAllRowsAcrossPages(page, tableRows, nextBtn);
        console.log(`Total records after editing user: ${countAfter}`);

        // ---- Final assertion ----
        expect(countAfter, 'Record count should not increase').toBe(countBefore);
    });

    test('Edit record but dont save', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');
        const nextBtn = page.getByTestId('page-next');
        const rowsPerPage = page.getByTestId('rows-per-page');

        await rowsPerPage.selectOption('5');

        // ---- Count BEFORE editing user (jumps to page 1 internally) ----
        const { totalRows: countBefore } = await countAllRowsAcrossPages(page, tableRows, nextBtn);
        console.log(`Total records before editing user: ${countBefore}`);

        const editRow = page.getByTestId('edit-14');
        await editRow.click();

        await page.getByTestId('edit-name-input').fill("XYZ");
        await page.getByTestId('edit-email-input').fill("XYZ@dummy.com");

        await page.getByTestId('modal-cancel').click();

        // Re-assert rows-per-page in case it reset after the mutation
        await rowsPerPage.selectOption('5');

        // ---- Count AFTER editing user (jumps to page 1 internally again) ----
        const { totalRows: countAfter } = await countAllRowsAcrossPages(page, tableRows, nextBtn);
        console.log(`Total records after editing user: ${countAfter}`);

        // ---- Final assertion ----
        expect(countAfter, 'Record count should not increase').toBe(countBefore);
    });

    test('Select all rows on current page', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        // Click the select-all checkbox
        const selectAll = page.getByTestId('select-all');
        await selectAll.check();

        // Assert all row checkboxes are checked
        const rowCheckboxes = page.locator('[data-testid^="row-check-"]');
        const count = await rowCheckboxes.count();

        for (let i = 0; i < count; i++) {
            await expect(rowCheckboxes.nth(i)).toBeChecked();
        }
    });
})