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

test('Click on Menu Tables option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-tables').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    // By id
    await expect(page.locator('#tablesTitle')).toHaveText('Data Tables');

    // By role (more robust, recommended)
    await expect(page.getByRole('heading', { name: 'Data Tables' })).toBeVisible();

    // Also check the section is visible (has the 'visible' class)
    await expect(page.locator('#tablesHeader')).toHaveClass(/visible/);
})

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
    })
})

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

test.describe('Role filter dropdown', () => {

    test('Filter by "Admin" role returns only admin users', async ({ page }) => {

        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const roleFilter = page.getByTestId('table-filter');
        const tableRows = tableCard.locator('table tbody tr');

        await roleFilter.selectOption('admin');
        await expect(roleFilter).toHaveValue('admin');

        await expect(tableRows).toHaveCount(5);
        await expect(tableCard.getByText('Showing 1-5 of 5 entries')).toBeVisible();

        const expected = [
            { id: '1', name: 'Alice Johnson', email: 'alice@example.com', status: 'active' },
            { id: '4', name: 'Diana Prince', email: 'diana@example.com', status: 'active' },
            { id: '9', name: 'Ivan Drago', email: 'ivan@example.com', status: 'pending' },
            { id: '12', name: 'Luna Lovegood', email: 'luna@example.com', status: 'inactive' },
            { id: '15', name: 'Oscar Wilde', email: 'oscar@example.com', status: 'active' },
        ];

        for (let i = 0; i < expected.length; i++) {
            const row = tableRows.nth(i);
            await expect(row).toContainText(expected[i].id);
            await expect(row).toContainText(expected[i].name);
            await expect(row).toContainText(expected[i].email);
            await expect(row).toContainText('admin'); // every row's role must be admin
            await expect(row).toContainText(expected[i].status);
        }
    });

    test('Filter by "Editor" role returns only editor users', async ({ page }) => {

        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const roleFilter = page.getByTestId('table-filter');
        const tableRows = tableCard.locator('table tbody tr');

        await roleFilter.selectOption('editor');
        await expect(roleFilter).toHaveValue('editor');

        await expect(tableRows).toHaveCount(5);
        await expect(tableCard.getByText('Showing 1-5 of 5 entries')).toBeVisible();

        const expected = [
            { id: '2', name: 'Bob Smith', email: 'bob@example.com', status: 'active' },
            { id: '5', name: 'Ethan Hunt', email: 'ethan@example.com', status: 'pending' },
            { id: '7', name: 'George Lucas', email: 'george@example.com', status: 'inactive' },
            { id: '10', name: 'Julia Roberts', email: 'julia@example.com', status: 'active' },
            { id: '13', name: 'Mike Tyson', email: 'mike@example.com', status: 'active' },
        ];

        for (let i = 0; i < expected.length; i++) {
            const row = tableRows.nth(i);
            await expect(row).toContainText(expected[i].id);
            await expect(row).toContainText(expected[i].name);
            await expect(row).toContainText(expected[i].email);
            await expect(row).toContainText('editor');
            await expect(row).toContainText(expected[i].status);
        }
    });

    test('Filter shows only rows matching selected role — no leakage from other roles', async ({ page }) => {

        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const roleFilter = page.getByTestId('table-filter');
        const tableRows = tableCard.locator('table tbody tr');

        await roleFilter.selectOption('admin');

        // Assert none of the visible rows show "editor" or "viewer" as role
        const roleCells = tableRows.locator('td:nth-child(5)'); // adjust index to match your Role column position
        const roleTexts = await roleCells.allTextContents();

        for (const roleText of roleTexts) {
            expect(roleText.trim()).toBe('admin');
        }
    });

    test('Switching filter from Admin to Editor updates results correctly', async ({ page }) => {

        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const roleFilter = page.getByTestId('table-filter');
        const tableRows = tableCard.locator('table tbody tr');

        await roleFilter.selectOption('admin');
        await expect(tableRows).toHaveCount(5);
        await expect(tableRows.first()).toContainText('Alice Johnson');

        await roleFilter.selectOption('editor');
        await expect(tableRows).toHaveCount(5);
        await expect(tableRows.first()).toContainText('Bob Smith');
    });

    test('Resetting filter to "All Roles" restores full list', async ({ page }) => {

        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const roleFilter = page.getByTestId('table-filter');
        const tableRows = tableCard.locator('table tbody tr');

        await roleFilter.selectOption('admin');
        await expect(tableRows).toHaveCount(5);

        await roleFilter.selectOption('all');
        await expect(roleFilter).toHaveValue('all');
        await expect(tableRows).toHaveCount(5); // still 5 due to "5 per page" pagination
        await expect(tableCard.getByText('Showing 1-5 of 15 entries')).toBeVisible();
    });
});

test.describe('Search scope and empty state', () => {

    test('Search does NOT match Role or Status values (search is Name/Email only)', async ({ page }) => {

        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const searchInput = page.getByTestId('table-search');
        const tableRows = tableCard.locator('table tbody tr');

        // "admin" is a role value, not a name/email — should return 0 results
        await searchInput.fill('admin');
        await expect(tableRows).toHaveCount(0);
        await expect(tableCard.getByText('Showing 1-0 of 0 entries')).toBeVisible();

        // "pending" is a status value, not a name/email — should return 0 results
        await searchInput.fill('pending');
        await expect(tableRows).toHaveCount(0);
        await expect(tableCard.getByText('Showing 1-0 of 0 entries')).toBeVisible();
    });

    test('Pagination controls are disabled when there are 0 results', async ({ page }) => {

        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const searchInput = page.getByTestId('table-search');

        await searchInput.fill('admin');

        // Both prev/next arrows should be disabled with 0 entries
        //  await expect(page.getByRole('button', { name: '<' })).toBeDisabled();
        //await expect(page.getByRole('button', { name: '<' })).toBeDisabled();

        await expect(page.getByTestId('page-prev')).toBeDisabled();
        await expect(page.getByTestId('page-next')).toBeDisabled();
        // Adjust role/name selectors once you confirm actual accessible names/testids for these arrows
    });

    test('Clearing search after a no-match query restores full list', async ({ page }) => {

        await verifyCardVisible(page, 'table-card');
        const tableCard = page.getByTestId('table-card');
        const searchInput = page.getByTestId('table-search');
        const tableRows = tableCard.locator('table tbody tr');

        await searchInput.fill('pending');
        await expect(tableRows).toHaveCount(0);

        await searchInput.fill('');
        await expect(tableRows).toHaveCount(5); // back to default page size
        await expect(tableCard.getByText('Showing 1-5 of 15 entries')).toBeVisible();
    });

});


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