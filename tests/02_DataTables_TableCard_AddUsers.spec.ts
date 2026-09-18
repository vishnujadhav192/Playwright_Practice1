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


test.describe('Add users', () => {

    test('Add User with details', async ({ page }) => {

        const userData = {
            userName: "Ethan Hunt",
            userEmail: "ethan@dummy.com",
            userRole: "editor"
        };

        await verifyCardVisible(page, 'table-card');
        const addRow = page.getByTestId('add-row-btn');
        await addRow.click();

        const modal = page.locator('[data-testid="modal-title"]');
        await expect(modal).toBeVisible();

        // Fill form fields
        await page.fill('[data-testid="new-user-name"]', userData.userName);
        await page.fill('[data-testid="new-user-email"]', userData.userEmail);
        await page.selectOption('[data-testid="new-user-role"]', userData.userRole);

        // Confirm action
        await page.click('[data-testid="modal-confirm"]');

        // Assert modal closes
        await expect(modal).toBeHidden();

        //search newly added user.
        const tableCard = page.getByTestId('table-card'); // scope to avoid picking up other tables on page
        const searchInput = page.getByTestId('table-search');
        const tableRows = tableCard.locator('table tbody tr');

        // Search for a known user
        // await searchInput.fill(userData.userName);
        await searchInput.fill(userData.userEmail);

        const userRow1 = page.locator('tr')
            .filter({ hasText: userData.userName })
            .filter({ hasText: userData.userEmail });

        await expect(userRow1).toHaveCount(1);   // only one row matches both
        await expect(userRow1).toContainText(userData.userRole);
        await expect(userRow1).toContainText('active');
    })

    test('Add User without any details', async ({ page }) => {

        const userData = {
            userName: "New User",
            userEmail: "new@example.com",
            userRole: "admin"
        };

        await verifyCardVisible(page, 'table-card');
        const addRow = page.getByTestId('add-row-btn');
        await addRow.click();

        const modal = page.locator('[data-testid="modal-title"]');
        await expect(modal).toBeVisible();

        // // Fill form fields
        // await page.fill('[data-testid="new-user-name"]', userData.userName);
        // await page.fill('[data-testid="new-user-email"]', userData.userEmail);
        // await page.selectOption('[data-testid="new-user-role"]', userData.userRole);

        // Confirm action
        await page.click('[data-testid="modal-confirm"]');

        // Assert modal closes
        await expect(modal).toBeHidden();

        //search newly added user.
        const tableCard = page.getByTestId('table-card'); // scope to avoid picking up other tables on page
        const searchInput = page.getByTestId('table-search');
        const tableRows = tableCard.locator('table tbody tr');

        // Search for a known user
        // await searchInput.fill(userData.userName);
        await searchInput.fill(userData.userEmail);

        const userRow1 = page.locator('tr')
            .filter({ hasText: userData.userName })
            .filter({ hasText: userData.userEmail });

        await expect(userRow1).toHaveCount(1);   // only one row matches both
        await expect(userRow1).toContainText(userData.userRole);
        await expect(userRow1).toContainText('active');
    });

      test('Click add user button but dont add any record', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const tableRows = tableCard.locator('table tbody tr');
        const nextBtn = page.getByTestId('page-next');
        const rowsPerPage = page.getByTestId('rows-per-page');

        await rowsPerPage.selectOption('5');

        // ---- Count BEFORE adding user (jumps to page 1 internally) ----
        const { totalRows: countBefore } = await countAllRowsAcrossPages(page, tableRows, nextBtn);
        console.log(`Total records before adding user: ${countBefore}`);

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

        await page.getByTestId('modal-cancel').click();
        await expect(modal).toBeHidden();

        // Re-assert rows-per-page in case it reset after the mutation
        await rowsPerPage.selectOption('5');

        // ---- Count AFTER adding user (jumps to page 1 internally again) ----
        const { totalRows: countAfter } = await countAllRowsAcrossPages(page, tableRows, nextBtn);
        console.log(`Total records after adding user: ${countAfter}`);

        // ---- Final assertion ----
        expect(countAfter, 'Record count should not increase').toBe(countBefore);
    });
})
