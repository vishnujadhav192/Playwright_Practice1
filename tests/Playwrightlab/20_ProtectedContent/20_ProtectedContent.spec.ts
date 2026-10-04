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

test('Click on Menu Protected Content option', async ({ page }) => {
  await page.getByTestId('nav-menu').click();
  await page.getByTestId('nav-responsive').click();

  await page.mouse.move(0, 0);

  // Assert the dropdown closes after selecting an item
  await expect(page.getByTestId('dropdown-menu')).toBeHidden();

  await verifyCardVisible(page, 'protected-card');

  // By id
  await expect(page.locator('#protectedDesc')).toContainText('Content that requires authentication — practice testing auth guards.');

  // By role (more robust, recommended)
  await expect(page.getByRole('heading', { name: 'Protected Content' })).toBeVisible();

  // Also check the section is visible (has the 'section-title' class)
  await expect(page.locator('#protectedTitle')).toHaveClass(/section-title/);
  await expect(page.locator('#protectedTag')).toHaveClass(/section-tag/);
})


test('Click on login and back to home', async ({ page }) => {

  await verifyCardVisible(page, 'protected-card');

  const loginButton = page.getByTestId('protected-login-btn');

  await loginButton.click();
  await expect(page).toHaveURL('https://playwrightlab.github.io/login.html');

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

  const backToHomeButton = page.locator('#backToHome');

  await backToHomeButton.click();
  await expect(page).toHaveURL('https://playwrightlab.github.io/index.html');

})

test('Click on login and goto Dashboard and logout', async ({ page }) => {
  await verifyCardVisible(page, 'protected-card');

  const loginButton = page.getByTestId('protected-login-btn');
  await loginButton.click();
  await expect(page).toHaveURL('https://playwrightlab.github.io/login.html');

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

  const emailAddressValue = 'test@playlab.com';
  const passwordValue = 'Password123';

  const emailAddress = page.getByRole('textbox', { name: 'Email Address' })
  await emailAddress.fill(emailAddressValue);

  const Password = page.getByRole('textbox', { name: 'Password' })
  await Password.fill(passwordValue);
  await page.locator('.toggle-password').click();

  const signInButton = page.getByRole('button', { name: 'Sign In' });

  await signInButton.click();

  const welcomeNameMessage = expect(page.locator('#welcomeName'));

  await welcomeNameMessage.toHaveText(`Signed in as ${emailAddressValue}`);

  await page.getByRole('link', { name: 'Go to Dashboard' }).click();

  await expect(page).toHaveURL('https://playwrightlab.github.io/index.html');

  const logOutButton = page.locator('#navLogoutBtn');
  await expect(logOutButton).toHaveText('Logout');
  await logOutButton.click();
})

test('Click on login and logout', async ({ page }) => {
  await verifyCardVisible(page, 'protected-card');

  const loginButton = page.getByTestId('protected-login-btn');

  await loginButton.click();
  await expect(page).toHaveURL('https://playwrightlab.github.io/login.html');

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

  const emailAddressValue = 'test@playlab.com';
  const passwordValue = 'Password123';

  const emailAddress = page.getByRole('textbox', { name: 'Email Address' })
  await emailAddress.fill(emailAddressValue);

  const Password = page.getByRole('textbox', { name: 'Password' })
  await Password.fill(passwordValue);
  await page.locator('.toggle-password').click();

  const signInButton = page.getByRole('button', { name: 'Sign In' });
  await signInButton.click();

  const welcomeNameMessage = expect(page.locator('#welcomeName'));
  await welcomeNameMessage.toHaveText(`Signed in as ${emailAddressValue}`);

  const logOutButton = page.getByRole('button', { name: 'Sign Out' });
  await logOutButton.click();
  await expect(page).toHaveURL('https://playwrightlab.github.io/login.html');
})