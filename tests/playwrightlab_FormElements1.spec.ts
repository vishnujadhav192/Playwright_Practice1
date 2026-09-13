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

// test.afterEach(async ({ page }) => {
//     await page.waitForTimeout(1000);
//     await page.close();
// });

test('Click on Menu Forms option', async ({ page }) => {
    // const MenuButton = page.getByRole('link', { name: 'Menu' })
    // await MenuButton.click();
    // await page.locator('a').filter({ hasText: 'Forms' }).first().click();

    await page.getByTestId('nav-menu').click();

    await page.getByTestId('nav-forms').click();

    const registrationFormTitle = page.locator('#registrationTitle');

    // Assertion
    await expect(registrationFormTitle).toBeVisible();
    await expect(registrationFormTitle).toContainText('Registration Form');

    const registrationCard = page.getByTestId('registration-card');
    await expect(registrationCard.getByRole('heading', { name: /Registration Form/ })).toBeVisible();

    // Trigger validation without filling anything
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.locator('[data-testid="form-success"]'))
        .toHaveText('Registration successful! Welcome aboard.');
})

test('Full Name length validation check', async ({ page }) => {

    await test.step('Full name error message should be blank at first', async () => {
        const fullNameError = page.locator('[data-testid="error-fullname"]');
        await expect(fullNameError).toHaveText('');
    });

    const fullName = page.getByLabel('Full Name *')

    await test.step('Full name blank check', async () => {
        await expect(fullName).toHaveValue('');
    });

    await test.step('Check maxlength attribute is set correctly', async () => {
        await expect(fullName).toHaveAttribute('maxlength', '50');
    });

    await test.step('Try entering 60 characters — should be capped at 50', async () => {
        await fullName.fill('A'.repeat(60));
        await expect(fullName).toHaveValue('A'.repeat(50));
    });

    await test.step('Boundary check: 49 characters — one below limit, should pass through untouched', async () => {
        await fullName.fill('A'.repeat(49));
        await expect(fullName).toHaveValue('A'.repeat(49));
    });

    await test.step('Boundary check: exactly 50 characters should be fully accepted', async () => {
        await fullName.fill('A'.repeat(50));
        await expect(fullName).toHaveValue('A'.repeat(50));
    });

    await test.step('Boundary check: 51 characters — one above limit, should pass through untouched', async () => {
        await fullName.fill('A'.repeat(51));
        await expect(fullName).toHaveValue('A'.repeat(50));
    });
});

test('Full Name mandatory validation check', async ({ page }) => {
    const currentUrl = page.url();

    // --- Leave Full Name empty ---
    // const fullNameInput = page.getByPlaceholder('John Doe').first();

    await test.step('Full name error message should be blank at first', async () => {
        const fullNameError = page.locator('[data-testid="error-fullname"]');
        await expect(fullNameError).toHaveText('');
    });

    const fullName = page.getByLabel('Full Name *')

    await test.step('Full name blank check', async () => {
        await expect(fullName).toHaveValue('');
    });

    const RegisterButton = page.getByRole('button', { name: 'Register' });
    await RegisterButton.click();
    const fullNameError = page.locator('[data-testid="error-fullname"]');

    await test.step('Check full name error message', async () => {
        await expect(fullNameError).toHaveText('Name is required');
        await expect(fullNameError).toBeVisible();
    });

    // --- Assert error message appears ---
    // await expect(page.getByText('Name is required')).toBeVisible();

    // --- Assert Full Name field shows error styling (red border) ---
    // await expect(fullNameInput).toHaveCSS('border-color', 'rgb(239, 68, 68)'); // adjust to your actual red value

    await test.step('Assert no navigation occurred', async () => {
        await expect(page).toHaveURL(currentUrl);
    });

    const successMessage = page.locator('[data-testid="form-success"]');

    await test.step('Success message should be hidden', async () => {
        await expect(successMessage).toBeHidden();
    });

    await test.step('Assert success banner did NOT appear', async () => {
        await expect(page.getByText('Registration successful! Welcome aboard.')).not.toBeVisible();
    });
});