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

test('Click on Menu Network option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-network').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    await verifyCardVisible(page, 'api-post-card');

    // By id
    await expect(page.locator('#networkDesc')).toContainText('Practice intercepting network requests, mocking APIs, and handling responses.');

    // By role (more robust, recommended)
    await expect(page.getByRole('heading', { name: 'Network & API', exact: true })).toBeVisible();

    // Also check the section is visible (has the 'section-title' class)
    await expect(page.locator('#networkTitle')).toHaveClass(/section-title/);
})

test('Fetch Users API', async ({ page }) => {
    await verifyCardVisible(page, 'api-post-card');

    const fetchUserBtn = page.getByTestId('fetch-users-btn');
    const fetchUserStatus = page.getByTestId('fetch-users-status');
    const resultLocator = page.getByTestId('fetch-users-result');

    await expect(fetchUserStatus).toHaveText('');

    await fetchUserBtn.click();

    await expect(fetchUserStatus).toContainText('200 OK — 10 users');
    await expect(resultLocator).toBeVisible();

    await expect(resultLocator).toContainText('"name": "Leanne Graham"');
    await expect(resultLocator).toContainText('"email": "Sincere@april.biz"');
    await expect(resultLocator).toContainText('"name": "Chelsey Dietrich"');

})

test('Submit Data API', async ({ page }) => {
    await verifyCardVisible(page, 'api-post-card');

    const titleInfo = 'Title123';
    const bodyInfo = 'Body123'

    const titleInput = page.getByPlaceholder('My Post Title');
    const bodyInput = page.getByPlaceholder('Post content...');
    const submitBtn = page.getByText('Submit POST');
    const apiPostCard = page.getByTestId('api-post-card');
    const postStatus = page.getByTestId('post-status');
    const postResult = page.getByTestId('post-result');

    // Card is visible
    await expect(apiPostCard).toBeVisible();

    // Status is empty
    await expect(postStatus).not.toBeVisible();

    // Result shows placeholder text
    await expect(postResult).toContainText('Submit to see response...');


    await titleInput.fill(titleInfo);
    await bodyInput.fill(bodyInfo);
    await submitBtn.click();

    // Status updated with success class and text
    await expect(postStatus).toHaveClass(/success/);
    await expect(postStatus).toHaveText('Status: 201 Created');

    // Result contains JSON response
    await expect(postResult).toContainText(`"title": "${titleInfo}"`);
    await expect(postResult).toContainText(`"body": "${bodyInfo}"`);
    await expect(postResult).toContainText('"userId": 1');
    await expect(postResult).toContainText('"id": 101');

    // Verify result
    await expect(postResult).toContainText(
        `{ "title": "${titleInfo}", "body": "${bodyInfo}", "userId": 1, "id": 101 }`);
})

test('Slow API (Timeout)', async ({ page }) => {
    await verifyCardVisible(page, 'api-delay-card');

    const responseDelayDropdown = page.getByTestId('api-delay-select');
    const slowAPIBtn = page.getByTestId('slow-api-btn');
    const apiDelayCard = page.getByTestId('api-delay-card');
    const slowAPIResult = page.getByTestId('slow-api-result');

    // Card is visible
    await expect(apiDelayCard).toBeVisible();

    // Result shows placeholder text
    await expect(slowAPIResult).toContainText('Waiting...');

    await responseDelayDropdown.selectOption('2');
    await slowAPIBtn.click();

    // Result shows placeholder text
    await expect(slowAPIResult).toContainText('Waiting for response...');
    await page.waitForTimeout(2000);
    await expect(slowAPIResult).toContainText(`{ "status": "ok", "message": "Response after 2s delay"`);


    await responseDelayDropdown.selectOption('10');
    await slowAPIBtn.click();

    // Result shows placeholder text
    await expect(slowAPIResult).toContainText('Waiting for response...');
    await page.waitForTimeout(10000);
    await expect(slowAPIResult).toContainText(`{ "status": "ok", "message": "Response after 10s delay"`);
})

test('Error Responses', async ({ page }) => {
    await verifyCardVisible(page, 'api-error-card');

    const apiResponse400Btn = page.getByTestId('api-error-400');
    const apiResponse401Btn = page.getByTestId('api-error-401');
    const apiResponse403Btn = page.getByTestId('api-error-403');
    const apiResponse404Btn = page.getByTestId('api-error-404');
    const apiResponse500Btn = page.getByTestId('api-error-500');

    const errorAPIResult = page.getByTestId('error-api-result');

    await expect(errorAPIResult).toContainText('Click an error code...');

    await apiResponse400Btn.click();
    await expect(errorAPIResult).toContainText('{ "error": true, "status": 400, "message": "Bad Request');

    await apiResponse401Btn.click();
    await expect(errorAPIResult).toContainText('{ "error": true, "status": 401, "message": "Unauthorized"');

    await apiResponse403Btn.click();
    await expect(errorAPIResult).toContainText('{ "error": true, "status": 403, "message": "Forbidden"');

    await apiResponse404Btn.click();
    await expect(errorAPIResult).toContainText('{ "error": true, "status": 404, "message": "Not Found"');

    await apiResponse500Btn.click();
    await expect(errorAPIResult).toContainText('{ "error": true, "status": 500, "message": "Internal Server Error"');

})