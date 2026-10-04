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

test('Click on Menu Responsive option', async ({ page }) => {
  await page.getByTestId('nav-menu').click();
  await page.getByTestId('nav-responsive').click();

  await page.mouse.move(0, 0);

  // Assert the dropdown closes after selecting an item
  await expect(page.getByTestId('dropdown-menu')).toBeHidden();

  await verifyCardVisible(page, 'responsive-card');

  // By id
  await expect(page.locator('#responsiveDesc')).toContainText('Elements that change behavior and visibility based on viewport size.');

  // By role (more robust, recommended)
  await expect(page.getByRole('heading', { name: 'Responsive Testing' })).toBeVisible();

  // Also check the section is visible (has the 'section-title' class)
  await expect(page.locator('#responsiveTitle')).toHaveClass(/section-title/);
  await expect(page.locator('#responsiveTag')).toHaveClass(/section-tag/);
})

test.describe('Responsive element visibility', () => {
  test('Desktop breakpoint (>768px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await verifyCardVisible(page, 'responsive-card');

    await expect(page.getByTestId('desktop-only')).toBeVisible();
    await expect(page.getByTestId('tablet-only')).toBeHidden();
    await expect(page.getByTestId('mobile-only')).toBeHidden();
    await expect(page.getByTestId('always-visible')).toBeVisible();
  });

  test('Tablet breakpoint (481–768px)', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 768 });
    await verifyCardVisible(page, 'responsive-card');

    await expect(page.getByTestId('tablet-only')).toBeVisible();
    await expect(page.getByTestId('desktop-only')).toBeHidden();
    await expect(page.getByTestId('mobile-only')).toBeHidden();
  });

  test('Mobile breakpoint (≤480px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await verifyCardVisible(page, 'responsive-card');

    await expect(page.getByTestId('mobile-only')).toBeVisible();
    await expect(page.getByTestId('desktop-only')).toBeHidden();
    await expect(page.getByTestId('tablet-only')).toBeHidden();
  });

  test('Responsive demo grid layout', async ({ page }) => {
    await verifyCardVisible(page, 'responsive-card');
    await page.setViewportSize({ width: 1024, height: 768 });

    const cardA = await page.getByTestId('resp-item-1').boundingBox();
    const cardB = await page.getByTestId('resp-item-2').boundingBox();

    // On desktop: cards should be side-by-side (same Y position)
    expect(cardA?.y).toBe(cardB?.y);

    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    const mobileCardA = await page.getByTestId('resp-item-1').boundingBox();
    const mobileCardB = await page.getByTestId('resp-item-2').boundingBox();

    // On mobile: cards should stack (different Y position)
    expect(mobileCardA?.y).not.toBe(mobileCardB?.y);
  });
});