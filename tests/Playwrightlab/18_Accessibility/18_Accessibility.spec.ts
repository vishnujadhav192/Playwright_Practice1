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

test('Keyboard Navigation', async ({ page }) => {
  await verifyCardVisible(page, 'keyboard-nav-card');

  const buttons = page.getByTestId('a11y-buttons').locator('button');
  const result = page.getByTestId('a11y-key-result');
  const skipLink = page.getByTestId('skip-link');
  const target = page.getByTestId('a11y-target');

  // Focus first button and activate with Space
  await buttons.nth(0).focus();
  await page.keyboard.press('Space');
  await expect(result).toHaveText(/Clicked: Button 1/);

  // Tab to second button and activate with Enter
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(result).toHaveText(/Clicked: Button 2/);

  // Tab to third button and activate
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await expect(result).toHaveText(/Clicked: Button 3/);

  // Test skip link navigation
  await skipLink.focus();
  await page.keyboard.press('Enter');
  await expect(target).toBeFocused();
});

test('ARIA searchbox updates live region', async ({ page }) => {

  await verifyCardVisible(page, 'aria-card');

  const searchInput = page.getByTestId('a11y-search');
  const liveRegion = page.getByTestId('a11y-live-region');

  // Type "E" and check results
  await searchInput.fill('E');
  await expect(liveRegion).toContainText('Apple, Cherry, Date, Elderberry, Grape, Honeydew');

  // Type "Ap" and check narrowed results
  await searchInput.fill('Ap');
  await expect(liveRegion).toContainText('Apple');

  // Clear input and check empty state
  await searchInput.fill('');
  await expect(liveRegion).toHaveText('');
});


test('ARIA expanded toggle panel', async ({ page }) => {
  await verifyCardVisible(page, 'aria-card');

  const expandBtn = page.getByTestId('a11y-expand-btn');
  const expandContent = page.getByTestId('a11y-expand-content');

  // Initial state: collapsed
  await expect(expandBtn).toHaveAttribute('aria-expanded', 'false');
  await expect(expandContent).toHaveClass(/hidden/);

  // Click to expand
  await expandBtn.click();
  await expect(expandBtn).toHaveAttribute('aria-expanded', 'true');
  await expect(expandContent).toBeVisible();

  // Assert on the paragraph text inside the panel
  await expect(expandContent).toContainText('This panel is controlled by the button above. Check aria-expanded state.');

  // Click again to collapse
  await expandBtn.click();
  await expect(expandBtn).toHaveAttribute('aria-expanded', 'false');
  await expect(expandContent).toHaveClass(/hidden/);
});

test('ARIA expanded Focus Trap', async ({ page }) => {
  await verifyCardVisible(page, 'aria-card');

  //  const focusTrapOpenBtn = page.getByTestId('focus-trap-open');
  const focusTrapOpenBtn = page.getByRole('button', { name: 'Open Focus Trap' });
  const focusTrapArea = page.getByTestId('focus-trap-area');

  await focusTrapOpenBtn.click();
  await expect(focusTrapArea).not.toHaveClass(/hidden/);
  await expect(focusTrapArea).toContainText('Focus is trapped here! Tab cycles only within this area.');

  //  const focusTrapInput = page.getByTestId('focus-trap-input');

  const focusTrapInput = page.locator('#focusTrapInput');
  await focusTrapInput.fill('Playwright');

  const focusTrapAction = page.getByTestId('focus-trap-action');
  await focusTrapAction.click();

  const focusTrapClose = page.getByTestId('focus-trap-close');
  await focusTrapClose.click();

  await expect(focusTrapArea).toHaveClass(/hidden/);

});