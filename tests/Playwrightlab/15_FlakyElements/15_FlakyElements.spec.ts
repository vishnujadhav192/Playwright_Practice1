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

test('Click on Menu Flaky Elements option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-flaky').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    await verifyCardVisible(page, 'random-appear-card');

    // By id
    await expect(page.locator('#flakyDesc')).toContainText('Elements that randomly appear, disappear, or change — great for practicing waitFor and retry logic.');

    // By role (more robust, recommended)
    await expect(page.getByRole('heading', { name: 'Flaky & Retry Elements', exact: true })).toBeVisible();

    // Also check the section is visible (has the 'section-title' class)
    await expect(page.locator('#flakyTitle')).toHaveClass(/section-title/);
})

test.describe('Random Appear Element', () => {
  test('should handle random appear/disappear states', async ({ page }) => {
    
    await verifyCardVisible(page, 'random-appear-card');

    const box = page.locator('[data-testid="random-appear-box"]');
    const log = page.locator('[data-testid="random-appear-log"]');

    // Retry loop to stabilize flaky behavior
    let appeared = false;
    for (let i = 0; i < 5; i++) {
      if (await box.isVisible()) {
        appeared = true;
        break;
      }
      await page.waitForTimeout(2000); // wait for next toggle
    }

    // Assert that the box eventually appeared
    expect(appeared).toBeTruthy();

    // Verify the text inside the box
    await expect(page.locator('[data-testid="random-appear-text"]'))
      .toHaveText('Now you see me!');

    // Verify the log updates correctly
    const logText = await log.textContent();
    expect(['Hidden', 'Visible']).toContain(logText);
  });
});