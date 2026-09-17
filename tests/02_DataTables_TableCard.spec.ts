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