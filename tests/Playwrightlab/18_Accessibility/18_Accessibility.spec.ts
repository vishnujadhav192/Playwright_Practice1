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

test('Click on Menu Accessibility option', async ({ page }) => {
  await page.getByTestId('nav-menu').click();
  await page.getByTestId('nav-a11y').click();

  await page.mouse.move(0, 0);

  // Assert the dropdown closes after selecting an item
  await expect(page.getByTestId('dropdown-menu')).toBeHidden();

  await verifyCardVisible(page, 'keyboard-nav-card');

  // By id
  await expect(page.locator('#a11yDesc')).toContainText('Test ARIA attributes, keyboard navigation, focus management, and screen reader support.');

  // By role (more robust, recommended)
  await expect(page.getByRole('heading', { name: 'Accessibility' })).toBeVisible();

  // Also check the section is visible (has the 'section-title' class)
  await expect(page.locator('#a11yTitle')).toHaveClass(/section-title/);
  await expect(page.locator('#a11yTag')).toHaveClass(/section-tag/);
})