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

test('Full Name validation check', async ({ page }) => {
    const fullNameError = page.locator('[data-testid="error-fullname"]');

    await test.step('Full name error message should be blank at first', async () => {
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

test('Full Name mandatory check', async ({ page }) => {

    const currentUrl = page.url();
    const fullNameError = page.locator('[data-testid="error-fullname"]');

    // --- Leave Full Name empty ---
    // const fullNameInput = page.getByPlaceholder('John Doe').first();

    await test.step('Full name error message should be blank at first', async () => {
        await expect(fullNameError).toHaveText('');
    });

    const fullName = page.getByLabel('Full Name *')

    await test.step('Full name blank check', async () => {
        await expect(fullName).toHaveValue('');
    });

    const RegisterButton = page.getByRole('button', { name: 'Register' });
    await RegisterButton.click();

    await test.step('Check full name error message', async () => {

        const value = await fullName.inputValue();
        expect(value).toBe('');
        expect(value.length).toBe(0);

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

test('Email address validation check', async ({ page }) => {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailAddressError = page.locator('[data-testid="error-email"]');
    const registerButton = page.getByRole('button', { name: 'Register' });

    await test.step('Email address error message should be blank at first', async () => {
        await expect(emailAddressError).toHaveText('');
    });

    const emailAddress = page.getByLabel('Email Address *')

    await test.step('Email address blank check', async () => {
        await expect(emailAddress).toHaveValue('');
    });

    // Helper function
    async function checkEmail(inputValue: string) {
        await emailAddress.fill(inputValue);
        await registerButton.click();
        const isValid = regex.test(inputValue);
        if (isValid) {
            await expect(emailAddressError).toHaveText('');
        } else {
            await expect(emailAddressError).toHaveText('Valid email is required');
            await expect(emailAddressError).toBeVisible();
        }
    }

    await test.step('Blank email should show error', async () => {
        await checkEmail('');
    });

    await test.step('Single character email should show error', async () => {
        await checkEmail('A');
    });

    await test.step('Valid email should clear error', async () => {
        await checkEmail('john@example.com');
    });

    await test.step('Invalid email should show error', async () => {
        await checkEmail('johnexample.com');
    });
});

test('Email address mandatory check', async ({ page }) => {

    const currentUrl = page.url();
    const emailAddressError = page.locator('[data-testid="error-email"]');

    // --- Leave Email address empty ---
    // const emailAddressInput = page.getByPlaceholder('john@example.com').first();

    await test.step('Email address error message should be blank at first', async () => {

        await expect(emailAddressError).toHaveText('');
    });

    const emailAddress = page.getByLabel('Email Address *');

    await test.step('Email address blank check', async () => {
        await expect(emailAddress).toHaveValue('');
    });

    const RegisterButton = page.getByRole('button', { name: 'Register' });
    await RegisterButton.click();

    await test.step('Check email address error message', async () => {

        const value = await emailAddress.inputValue();
        expect(value).toBe('');
        expect(value.length).toBe(0);

        await expect(emailAddressError).toHaveText('Valid email is required');
        await expect(emailAddressError).toBeVisible();
    });

    // --- Assert error message appears ---
    // await expect(page.getByText('Valid email is required')).toBeVisible();

    // --- Assert Full Name field shows error styling (red border) ---
    await expect(emailAddress).toHaveCSS('border-color', 'rgb(239, 68, 68)'); // adjust to your actual red value

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

test('password validation check', async ({ page }) => {
    const passwordError = page.locator('[data-testid="error-password"]');
    const registerButton = page.getByRole('button', { name: 'Register' });

    await test.step('Password error message should be blank at first', async () => {
        await expect(passwordError).toHaveText('');
    });

    const password = page.getByLabel('Password *')

    await test.step('Password blank check', async () => {
        await expect(password).toHaveValue('');
    });

    await test.step('Boundary check: 7 characters — one below limit, should not pass through untouched', async () => {
        await password.fill('A'.repeat(7));
        await expect(password).toHaveValue('A'.repeat(7));
        await page.locator('.toggle-password').click();
        await registerButton.click();
        await expect(passwordError).toBeVisible();
        await expect(passwordError).toHaveText('Password must be at least 8 characters');
    });
});

test('Password mandatory check', async ({ page }) => {

    const currentUrl = page.url();
    const passwordError = page.locator('[data-testid="error-password"]');

    await test.step('Password error message should be blank at first', async () => {

        await expect(passwordError).toHaveText('');
    });

    const password = page.getByLabel('Password *');

    await test.step('Password blank check', async () => {
        await expect(password).toHaveValue('');
    });

    const registerButton = page.getByRole('button', { name: 'Register' });
    await registerButton.click();

    await test.step('Check password error message', async () => {

        const value = await password.inputValue();
        expect(value).toBe('');
        expect(value.length).toBe(0);

        await expect(passwordError).toHaveText('Password must be at least 8 characters');
        await expect(passwordError).toBeVisible();
    });

    // --- Assert Full Name field shows error styling (red border) ---
    //await expect(passwordError).toHaveCSS('border-color', 'rgb(239, 68, 68)'); // adjust to your actual red value

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