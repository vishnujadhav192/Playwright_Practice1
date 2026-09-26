import { test, expect } from '@playwright/test'

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

test.afterEach(async ({ page }) => {
    await page.waitForTimeout(1000);
    await page.close();
});

test('Verify Page title', async ({ page }) => {
    const title = await page.title();
    // console.log('Page title is:', title);
    expect(title).toContain('Playwright');
})

test('Click on Locators', async ({ page }) => {
    const locatorsButton = page.getByRole('link', { name: 'Locators' })
    await locatorsButton.click();
    await expect(page).toHaveURL('https://playwrightlab.github.io/locators.html');
    await page.waitForTimeout(1000);
    const homeButton = page.getByRole('link', { name: 'Home' })
    await homeButton.click();
    await expect(page).toHaveURL('https://playwrightlab.github.io/index.html');
})

test('Click on Menu dropdown', async ({ page }) => {
    const MenuButton = page.getByRole('link', { name: 'Menu' })
    await MenuButton.click();

    // Get all the link texts inside the dropdown
    //    const menuItems = await page.getByTestId('dropdown-menu').locator('li a').allTextContents();

    // const dropdownMenu = page.locator('ul.dropdown-menu');
    // const menuItems = await dropdownMenu.locator('li a').allTextContents();

    const menuItems = (await page.getByTestId('dropdown-menu').locator('li a').allTextContents())
        .map(text => text.trim());

    console.log(menuItems);

    // ['Forms', 'Tables', 'Interactions', 'Shopping', 'Dynamic Content', 'Modals & Alerts', ...]

    await expect(page.getByTestId('dropdown-menu').locator('li a')).toHaveText([
        'Forms', 'Tables', 'Interactions', 'Shopping', 'Dynamic Content',
        'Modals & Alerts', 'Frames', 'Shadow DOM', 'Advanced', 'Wizard',
        'Carousel', 'Network', 'Flaky Elements', 'Date Picker', 'Media Player',
        'Accessibility', 'Responsive'
    ]);

    //Navigate 
    const menu = page.getByTestId('dropdown-menu');
    const items = await menu.locator('li a').all();

    for (const item of items) {
        const testId = await item.getAttribute('data-testid');
        const href = await item.getAttribute('href'); // e.g. "#modals"

        await page.getByTestId('nav-menu').click();   // reopen dropdown each time
        await page.getByTestId(testId!).click();
    }
})

test('Click on login and back to home', async ({ page }) => {
    //const loginButton = page.getByText('Login', { exact: true })

    const loginButton = page.locator('#navLoginBtn');

    await loginButton.click();
    await expect(page).toHaveURL('https://playwrightlab.github.io/login.html');

    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

    // const headings = page.getByRole('heading');
    // const count = await headings.count();

    // for (let i = 0; i < count; i++) {
    //     console.log(await headings.nth(i).innerText());
    // }

    const backToHomeButton = page.locator('#backToHome');

    await backToHomeButton.click();
    await expect(page).toHaveURL('https://playwrightlab.github.io/index.html');

})

test('Click on login and goto Dashboard and logout', async ({ page }) => {
    //const loginButton = page.getByText('Login', { exact: true })

    const loginButton = page.locator('#navLoginBtn');

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
    //const loginButton = page.getByText('Login', { exact: true })

    const loginButton = page.locator('#navLoginBtn');

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

test('Theme toggle Day ↔ Night', async ({ page }) => {
    const themeChange = page.locator('#themeToggle');
    const html = page.locator('html');
    //Checking current theme
    await expect(html).toHaveAttribute('data-theme', 'light');
    await themeChange.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await themeChange.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
})