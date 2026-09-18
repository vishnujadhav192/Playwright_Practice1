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