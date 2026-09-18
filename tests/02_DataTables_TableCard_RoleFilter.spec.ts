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

    test('Filter by roles and verify all records are filter correctly', async ({ page }) => {
        await verifyCardVisible(page, 'table-card');

        const tableCard = page.getByTestId('table-card');
        const roleFilter = page.getByTestId('table-filter');
        const tableRows = tableCard.locator('table tbody tr');

        const addRow = page.getByTestId('add-row-btn');
        await addRow.click();
        const modal = page.locator('[data-testid="modal-title"]');
        await expect(modal).toBeVisible();
        await page.selectOption('[data-testid="new-user-role"]', 'admin');
        await page.click('[data-testid="modal-confirm"]');

        await addRow.click();
        await expect(modal).toBeVisible();
        await page.selectOption('[data-testid="new-user-role"]', 'editor');
        await page.click('[data-testid="modal-confirm"]');

        await addRow.click();
        await expect(modal).toBeVisible();
        await page.selectOption('[data-testid="new-user-role"]', 'editor');
        await page.click('[data-testid="modal-confirm"]');

        await addRow.click();
        await expect(modal).toBeVisible();
        await page.selectOption('[data-testid="new-user-role"]', 'viewer');
        await page.click('[data-testid="modal-confirm"]');

        await addRow.click();
        await expect(modal).toBeVisible();
        await page.selectOption('[data-testid="new-user-role"]', 'viewer');
        await page.click('[data-testid="modal-confirm"]');

        await addRow.click();
        await expect(modal).toBeVisible();
        await page.selectOption('[data-testid="new-user-role"]', 'viewer');
        await page.click('[data-testid="modal-confirm"]');

        await addRow.click();
        await expect(modal).toBeVisible();
        await page.selectOption('[data-testid="new-user-role"]', 'viewer');
        await page.click('[data-testid="modal-confirm"]');

        await addRow.click();
        await expect(modal).toBeVisible();
        await page.selectOption('[data-testid="new-user-role"]', 'viewer');
        await page.click('[data-testid="modal-confirm"]');

        await addRow.click();
        await expect(modal).toBeVisible();
        await page.selectOption('[data-testid="new-user-role"]', 'viewer');
        await page.click('[data-testid="modal-confirm"]');


        await roleFilter.selectOption('all');
        await expect(roleFilter).toHaveValue('all');

        await roleFilter.selectOption('admin');
        await expect(roleFilter).toHaveValue('admin');

        const adminRoles = await getAllRolesAcrossPages(page);
        adminRoles.forEach(role => expect(role).toBe('admin'));

        await roleFilter.selectOption('editor');
        await expect(roleFilter).toHaveValue('editor');

        const editorRoleFilter = await getAllRolesAcrossPages(page);
        editorRoleFilter.forEach(role => expect(role).toBe('editor'));

        await roleFilter.selectOption('viewer');
        await expect(roleFilter).toHaveValue('viewer');

        const viewerRoleFilter = await getAllRolesAcrossPages(page);
        viewerRoleFilter.forEach(role => expect(role).toBe('viewer'));
    });
});