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


test('Should handle random appear/disappear states', async ({ page }) => {

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

test('should wait for delayed button and click it', async ({ page }) => {

  await verifyCardVisible(page, 'delayed-button-card');

  // Click the spawn button to trigger delayed appearance
  await page.click('[data-testid="spawn-delayed-btn"]');

  // Wait for the delayed button to appear (random delay 1–5s)
  const delayedButton = page.locator('[data-testid="spawned-button"]');
  await delayedButton.waitFor({ state: 'visible', timeout: 6000 });

  // Verify the button text
  await expect(delayedButton).toHaveText('Click Me!');

  // Click the delayed button
  await delayedButton.click();

  // Optional: verify container state after click
  const container = page.locator('[data-testid="delayed-btn-container"]');
  expect(await container.isVisible()).toBeTruthy();
});

test('should wait for success text and click action', async ({ page }) => {

  await verifyCardVisible(page, 'changing-text-card');

  const textBox = page.locator('[data-testid="changing-text-box"]');
  const actionBtn = page.locator('[data-testid="changing-text-action"]');
  const result = page.locator('[data-testid="changing-text-result"]');

  // Wait until the text changes to "Success! Click now"
  await expect(textBox).toHaveText('Success! Click now', { timeout: 10000 });

  // Ensure the action button becomes visible
  await actionBtn.waitFor({ state: 'visible', timeout: 2000 });

  // Click the action button
  await actionBtn.click();

  // Verify result text updates (adjust expected value to your app’s behavior)
  await expect(result).toHaveText("You caught it!");
});