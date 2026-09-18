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


test.describe('Search users', () => {

    test('Search users by partial name and verify valid result (1 record)', async ({ page }) => {

        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card'); // scope to avoid picking up other tables on page
        const searchInput = page.getByTestId('table-search');
        const tableRows = tableCard.locator('table tbody tr');

        // Search for a known user
        await searchInput.fill('Alice');

        // Verify at least one row is returned and it contains the searched text
        await expect(tableRows).toHaveCount(1);
        await expect(tableRows.first()).toContainText('Alice Johnson');
        await expect(tableRows.first()).toContainText('alice@example.com');
    });

    test('Search users by partial name (Case-insensitive) and verify valid result (1 record)', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const searchInput = page.getByTestId('table-search');
        const tableRows = tableCard.locator('table tbody tr');

        await searchInput.fill('bob');
        // Case-insensitive check — confirm partial/lowercase input still matches
        await expect(tableRows).toHaveCount(1);
        await expect(tableRows.first()).toContainText('Bob Smith');
    });

    test('Search with no matches shows empty state', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const searchInput = page.getByTestId('table-search');
        const tableRows = tableCard.locator('table tbody tr');

        await searchInput.fill('zzznonexistentuser');
        await expect(tableRows).toHaveCount(0);
        // If there's an empty-state message, assert that too:
        // await expect(tableCard.getByText(/no.*(results|users|records)/i)).toBeVisible();
    });

    test('Search users by exact email and verify valid result (1 record)', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const searchInput = page.getByTestId('table-search');
        const tableRows = tableCard.locator('table tbody tr');

        await searchInput.fill('charlie@example.com');
        await expect(tableRows).toHaveCount(1);
        await expect(tableRows.first()).toContainText('Charlie Brown');
    });

    test('Clear "Search users..." after searching user', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const searchInput = page.getByTestId('table-search');
        const tableRows = tableCard.locator('table tbody tr');

        await searchInput.fill('Alice');
        await expect(tableRows).toHaveCount(1);

        await searchInput.fill('');
        await expect(tableRows).toHaveCount(5); // back to default page size
    });

    test('Search users by name and verify valid results : 2 records', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card'); // scope to avoid picking up other tables on page
        const searchInput = page.getByTestId('table-search');
        const tableRows = tableCard.locator('table tbody tr');

        // Search for a known user
        await searchInput.fill('son');

        // Verify exactly 2 rows returned
        await expect(tableRows).toHaveCount(2);

        // Verify "Showing 1-2 of 2 entries" text
        await expect(tableCard.getByText('Showing 1-2 of 2 entries')).toBeVisible();

        // Row 1: Alice Johnson
        const row1 = tableRows.nth(0);
        await expect(row1).toContainText('1');
        await expect(row1).toContainText('Alice Johnson');
        await expect(row1).toContainText('alice@example.com');
        await expect(row1).toContainText('admin');
        await expect(row1).toContainText('active');

        // Row 2: Mike Tyson
        const row2 = tableRows.nth(1);
        await expect(row2).toContainText('13');
        await expect(row2).toContainText('Mike Tyson');
        await expect(row2).toContainText('mike@example.com');
        await expect(row2).toContainText('editor');
        await expect(row2).toContainText('active');
    });

    test('Search users by name and verify valid results : 2 records (A cleaner, more maintainable way)', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const searchInput = page.getByTestId('table-search');
        const tableRows = tableCard.locator('table tbody tr');

        await searchInput.fill('son');
        await expect(tableRows).toHaveCount(2);

        const expected = [
            { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', status: 'active' },
            { id: '13', name: 'Mike Tyson', email: 'mike@example.com', role: 'editor', status: 'active' },
        ];

        for (let i = 0; i < expected.length; i++) {
            const row = tableRows.nth(i);
            const cells = row.locator('td');
            await expect(cells.nth(1)).toHaveText(expected[i].id);     // adjust index per your columns
            await expect(cells.nth(2)).toHaveText(expected[i].name);
            await expect(cells.nth(3)).toHaveText(expected[i].email);
            await expect(cells.nth(4)).toContainText(expected[i].role);
            await expect(cells.nth(5)).toContainText(expected[i].status);
        }
    });

    test('Search users by email and verify valid results : 3 records (A cleaner, more maintainable way)', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const searchInput = page.getByTestId('table-search');
        const tableRows = tableCard.locator('table tbody tr');

        await searchInput.fill('n@example.com');
        await expect(tableRows).toHaveCount(3);

        // same order as per UI

        const expected = [
            { id: '5', name: 'Ethan Hunt', email: 'ethan@example.com', role: 'editor', status: 'pending' },
            { id: '9', name: 'Ivan Drago', email: 'ivan@example.com', role: 'admin', status: 'pending' },
            { id: '11', name: 'Kevin Hart', email: 'kevin@example.com', role: 'viewer', status: 'active' },
        ];

        for (let i = 0; i < expected.length; i++) {
            const row = tableRows.nth(i);
            const cells = row.locator('td');
            await expect(cells.nth(1)).toHaveText(expected[i].id);     // adjust index per your columns
            await expect(cells.nth(2)).toHaveText(expected[i].name);
            await expect(cells.nth(3)).toHaveText(expected[i].email);
            await expect(cells.nth(4)).toContainText(expected[i].role);
            await expect(cells.nth(5)).toContainText(expected[i].status);
        }
    });

    test('Change rows per page and verify table updates', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');
        //await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
        // const rowsPerPage = page.locator('[data-testid="rows-per-page"]');

        const tableCard = page.getByTestId('table-card'); // or whatever wraps the table
        const tableRows = tableCard.locator('table tbody tr');

        const rowsPerPage = page.getByTestId('rows-per-page');

        await expect(rowsPerPage).toHaveValue('5');
        await expect(tableRows).toHaveCount(5);

        await rowsPerPage.selectOption('10');
        await expect(rowsPerPage).toHaveValue('10');
        await expect(tableRows).toHaveCount(10);

        await rowsPerPage.selectOption('15');
        await expect(rowsPerPage).toHaveValue('15');
        await expect(tableRows).toHaveCount(15);
    });
});
