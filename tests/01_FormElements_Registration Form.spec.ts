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

//    const registrationCard = page.getByTestId('registration-card');

    const registrationTitle = page.locator('#registrationTitle')

    await registrationTitle.scrollIntoViewIfNeeded();
    await expect(registrationTitle).toBeVisible();
});

// test.afterEach(async ({ page }) => {
//     await page.waitForTimeout(1000);
//     await page.close();
// });

test('Click on Menu Forms option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-forms').click();

    const registrationCard = page.getByTestId('registration-card');
    await expect(registrationCard).toBeVisible();
    await expect(registrationCard).toContainText('Registration Form');
    await expect(registrationCard).toContainText('Validation');
    await expect(registrationCard.getByRole('heading', { name: /Registration Form/ })).toBeVisible();

    // Assertion
    const registrationFormTitle = page.locator('#registrationTitle');

    await expect(registrationFormTitle).toBeVisible();
    await expect(registrationFormTitle).toContainText('Registration Form');
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

test('Phone Number no validation. Just fill', async ({ page }) => {
    await test.step('Fill Phone number', async () => {
        const phoneNumber = page.getByLabel('Phone Number');
        await phoneNumber.fill('+91 1234567890');
    });
});

test('Date of Birth. Just fill', async ({ page }) => {
    await test.step('Fill date of birth', async () => {
        const dob = page.getByLabel('Date of Birth');
        await dob.fill('1991-02-19');
        await expect(dob).toHaveValue('1991-02-19');
    });
});

test('Select Country value', async ({ page }) => {
    const countryDropdown = page.locator('[data-testid="select-country"]');

    await test.step('select is visible and enabled', async () => {
        await expect(countryDropdown).toBeVisible();
        await expect(countryDropdown).toBeEnabled();
    });

    await test.step('Select country', async () => {
        await countryDropdown.selectOption('in');
        await expect(countryDropdown).toHaveValue('in');
    });
});

test('Select Gender value', async ({ page }) => {
    const maleRadio = page.getByTestId('radio-male');
    const femaleRadio = page.getByTestId('radio-female');
    const otherRadio = page.getByTestId('radio-other');

    await test.step('select is visible and enabled', async () => {
        await expect(maleRadio).toBeVisible();
        await expect(maleRadio).toBeEnabled();

        await expect(femaleRadio).toBeVisible();
        await expect(femaleRadio).toBeEnabled();

        await expect(otherRadio).toBeVisible();
        await expect(otherRadio).toBeEnabled();
    });

    await test.step('no gender selected by default', async () => {
        await expect(maleRadio).not.toBeChecked();
        await expect(femaleRadio).not.toBeChecked();
        await expect(otherRadio).not.toBeChecked();
    });

    await test.step('Select Male Gender', async () => {
        await maleRadio.check();
        await expect(maleRadio).toBeChecked();
        await expect(femaleRadio).not.toBeChecked();
        await expect(otherRadio).not.toBeChecked();
        await expect(maleRadio).toHaveAttribute('value', 'male');
    });

    await test.step('Select Female Gender', async () => {
        await femaleRadio.check();
        await expect(femaleRadio).toBeChecked();
        await expect(maleRadio).not.toBeChecked();
        await expect(otherRadio).not.toBeChecked();
        await expect(femaleRadio).toHaveAttribute('value', 'female');
    });

    await test.step('Select Other Gender', async () => {
        await otherRadio.check();
        await expect(otherRadio).toBeChecked();
        await expect(maleRadio).not.toBeChecked();
        await expect(femaleRadio).not.toBeChecked();
        await expect(otherRadio).toHaveAttribute('value', 'other');
    });
});

test('Select skill checkbox value', async ({ page }) => {
    const javaScriptCheckbox = page.getByTestId('check-js');
    const pythonCheckbox = page.getByTestId('check-python');
    const javaCheckbox = page.getByTestId('check-java');
    const csharpCheckbox = page.getByTestId('check-csharp');

    const allCheckboxes = [javaScriptCheckbox, pythonCheckbox, javaCheckbox, csharpCheckbox];

    // Helper: uncheck all, then check exactly one, and assert only that one is checked
    async function selectOnlySkill(target: typeof javaScriptCheckbox) {
        for (const checkbox of allCheckboxes) {
            await checkbox.uncheck();
        }
        await target.check();

        for (const checkbox of allCheckboxes) {
            if (checkbox === target) {
                await expect(checkbox).toBeChecked();
            } else {
                await expect(checkbox).not.toBeChecked();
            }
        }
    }

    await test.step('checkboxes are visible and enabled', async () => {
        await expect(javaScriptCheckbox).toBeVisible();
        await expect(javaScriptCheckbox).toBeEnabled();

        await expect(pythonCheckbox).toBeVisible();
        await expect(pythonCheckbox).toBeEnabled();

        await expect(javaCheckbox).toBeVisible();
        await expect(javaCheckbox).toBeEnabled();

        await expect(csharpCheckbox).toBeVisible();
        await expect(csharpCheckbox).toBeEnabled();
    });

    await test.step('no skill checked by default', async () => {
        for (const checkbox of allCheckboxes) {
            await expect(checkbox).not.toBeChecked();
        }
    });

    await test.step('JavaScript skill checked', async () => {
        await selectOnlySkill(javaScriptCheckbox);
    });

    await test.step('Python skill checked', async () => {
        await selectOnlySkill(pythonCheckbox);
    });

    await test.step('Java skill checked', async () => {
        await selectOnlySkill(javaCheckbox);
    });

    await test.step('C# skill checked', async () => {
        await selectOnlySkill(csharpCheckbox);
    });

    await test.step('Multiple skills can be checked simultaneously', async () => {
        for (const checkbox of allCheckboxes) {
            await checkbox.uncheck();
        }
        await javaScriptCheckbox.check();
        await pythonCheckbox.check();
        await expect(javaScriptCheckbox).toBeChecked();
        await expect(pythonCheckbox).toBeChecked();
        await expect(javaCheckbox).not.toBeChecked();
        await expect(csharpCheckbox).not.toBeChecked();
    });
});

test('Fill Bio', async ({ page }) => {
    const bioTextarea = page.getByTestId('textarea-bio');
    const charCount = page.getByTestId('char-count');

    await test.step('Bio is visible and enabled', async () => {
        await expect(bioTextarea).toBeVisible();
        await expect(bioTextarea).toBeEnabled();
    })

    await test.step('Bio default values', async () => {
        await expect(bioTextarea).toHaveValue('');
        await expect(charCount).toHaveText('0/200');
    });

    await test.step('Bio text area assertion', async () => {
        await bioTextarea.fill('Hello, this is my bio.');
        await expect(bioTextarea).toHaveValue('Hello, this is my bio.');
    });

    await test.step('Bio text area character count assertion', async () => {
        const bioText = 'Hello, this is my bio.';
        await bioTextarea.fill(bioText);
        await expect(bioTextarea).toHaveValue('Hello, this is my bio.');
        await expect(charCount).toHaveText(`${bioText.length}/200`);
    });

    // await test.step('Bio text area max lengh check', async () => {
    //     const longText = 'x'.repeat(250);
    //     await bioTextarea.fill(longText);
    //     const value = await bioTextarea.inputValue();
    //     expect(value.length).toBeLessThanOrEqual(200);
    // });

    await test.step('Bio text area data with new line', async () => {
        await bioTextarea.fill('This is line one.\nThis is line two.\nThis is line three.');
        await expect(bioTextarea).toHaveValue('This is line one.\nThis is line two.\nThis is line three.');
    });
})

test('Terms & Conditions checkbox and link', async ({ page }) => {
    const termsConditionsCheckbox = page.getByTestId('check-terms');
    const termsConditionsLink = page.getByTestId('terms-link');
    const currentUrl = page.url();
    const errorTermsError = page.locator('[data-testid="error-terms"]');
    const RegisterButton = page.getByRole('button', { name: 'Register' });

    await test.step('T&C visible and enabled', async () => {
        await expect(termsConditionsCheckbox).toBeVisible();
        await expect(termsConditionsCheckbox).toBeEnabled();

        await expect(termsConditionsLink).toBeVisible();
        await expect(termsConditionsLink).toBeEnabled();
    });

    await test.step('Terms & Conditions checkbox and link default state', async () => {
        await expect(termsConditionsCheckbox).not.toBeChecked();
    });

    await test.step('Terms & Conditions checkbox checked', async () => {
        await termsConditionsCheckbox.check();
        await expect(termsConditionsCheckbox).toBeChecked();
    });

    await test.step('Terms & Conditions checkbox unchecked', async () => {
        await termsConditionsCheckbox.uncheck();
        await expect(termsConditionsCheckbox).not.toBeChecked();
    });

    await test.step('Attribute Assertions', async () => {
        await expect(termsConditionsCheckbox).toHaveAttribute('required', '');
        await expect(termsConditionsCheckbox).toHaveAttribute('name', 'terms');
        await expect(termsConditionsLink).toHaveAttribute('href', 'terms.html');
    });

    await test.step('Accessibility check', async () => {
        await expect(page.getByLabel('I agree to the Terms & Conditions')).toBeVisible();
    });

    await test.step('Check T&C error message', async () => {
        await RegisterButton.click();

        const isChecked = await termsConditionsCheckbox.isChecked();
        if (!isChecked) {
            // If checkbox is unticked, error should be visible with correct text
            await expect(errorTermsError).toBeVisible();
            await expect(errorTermsError).toHaveText('You must accept the terms');
        } else {
            // If checkbox is ticked, error should be hidden or empty
            await expect(errorTermsError).toHaveText('');
        }
    });
});

test('Registration succeeds with valid data', async ({ page }) => {
    const userData = {
        fullName: "Amit",
        email: "amit@dummy.com",
        password: "SecurePass123!",
        phoneNumber: "+91 1234567890",
        dob: "1991-02-10",
        country: "in",
        gender: "male",
        bio: "This is line one.\nThis is line two.\nThis is line three."
    };

    await test.step('fill Full Name', async () => {
        const fullName = page.getByLabel('Full Name *');
        await fullName.fill(userData.fullName);
        await expect(fullName).toHaveValue(userData.fullName);
    });

    await test.step('fill Email', async () => {
        const emailAddress = page.getByLabel('Email Address *');
        await emailAddress.fill(userData.email);
        await expect(emailAddress).toHaveValue(userData.email);
    });

    await test.step('fill Password', async () => {
        const password = page.getByLabel('Password *');
        await password.fill(userData.password);
        await expect(password).toHaveValue(userData.password);
    });

    await test.step('fill Phone Number', async () => {
        const phoneNumber = page.getByLabel('Phone Number');
        await phoneNumber.fill(userData.phoneNumber);
        await expect(phoneNumber).toHaveValue(userData.phoneNumber);
    });

    await test.step('fill Date of Birth', async () => {
        const dob = page.getByLabel('Date of Birth');
        await dob.fill(userData.dob);
        await expect(dob).toHaveValue(userData.dob);
    });

    await test.step('select Country', async () => {
        const countryDropdown = page.locator('[data-testid="select-country"]');
        await countryDropdown.selectOption(userData.country);
        await expect(countryDropdown).toHaveValue(userData.country);
    });

    await test.step('select Gender', async () => {
        const maleRadio = page.getByTestId('radio-male');
        const femaleRadio = page.getByTestId('radio-female');
        const otherRadio = page.getByTestId('radio-other');

        await maleRadio.check();
        await expect(maleRadio).toBeChecked();
        await expect(femaleRadio).not.toBeChecked();
        await expect(otherRadio).not.toBeChecked();
        await expect(maleRadio).toHaveAttribute('value', 'male');
    });

    await test.step('select Skills', async () => {
        const javaScriptCheckbox = page.getByTestId('check-js');
        const pythonCheckbox = page.getByTestId('check-python');
        const javaCheckbox = page.getByTestId('check-java');
        const csharpCheckbox = page.getByTestId('check-csharp');

        await javaScriptCheckbox.check();
        await pythonCheckbox.check();

        await expect(javaScriptCheckbox).toBeChecked();
        await expect(pythonCheckbox).toBeChecked();
        await expect(javaCheckbox).not.toBeChecked();
        await expect(csharpCheckbox).not.toBeChecked();
    });

    await test.step('fill Bio', async () => {
        const bioTextarea = page.getByTestId('textarea-bio');
        await bioTextarea.fill(userData.bio);
        await expect(bioTextarea).toHaveValue(userData.bio);
    });

    await test.step('accept Terms & Conditions', async () => {
        const termsConditionsCheckbox = page.getByTestId('check-terms');
        await termsConditionsCheckbox.check();
        await expect(termsConditionsCheckbox).toBeChecked();
    });

    await test.step('submit and verify success', async () => {
        const registerButton = page.getByRole('button', { name: 'Register' });
        const formSuccessMessage = page.locator('[data-testid="form-success"]');

        await registerButton.click();
        await expect(formSuccessMessage).toHaveText('Registration successful! Welcome aboard.');
    });

    await test.step('no validation errors remain', async () => {
        const fullNameError = page.locator('[data-testid="error-fullname"]');
        const emailAddressError = page.locator('[data-testid="error-email"]');
        const passwordError = page.locator('[data-testid="error-password"]');
        const errorTermsError = page.locator('[data-testid="error-terms"]');

        await expect(fullNameError).toHaveText('');
        await expect(emailAddressError).toHaveText('');
        await expect(passwordError).toHaveText('');
        await expect(errorTermsError).toHaveText('');
    });
});

test('Reset already filled Registration form', async ({ page }) => {
    const userData = {
        fullName: "Amit",
        email: "amit@dummy.com",
        password: "SecurePass123!",
        phoneNumber: "+91 1234567890",
        dob: "1991-02-10",
        country: "in",
        gender: "male",
        bio: "This is line one.\nThis is line two.\nThis is line three."
    };

    const fullName = page.getByLabel('Full Name *');
    const emailAddress = page.getByLabel('Email Address *');
    const password = page.getByLabel('Password *');
    const phoneNumber = page.getByLabel('Phone Number');
    const dob = page.getByLabel('Date of Birth');
    const countryDropdown = page.locator('[data-testid="select-country"]');
    const maleRadio = page.getByTestId('radio-male');
    const femaleRadio = page.getByTestId('radio-female');
    const otherRadio = page.getByTestId('radio-other');
    const javaScriptCheckbox = page.getByTestId('check-js');
    const pythonCheckbox = page.getByTestId('check-python');
    const javaCheckbox = page.getByTestId('check-java');
    const csharpCheckbox = page.getByTestId('check-csharp');
    const bioTextarea = page.getByTestId('textarea-bio');
    const termsConditionsCheckbox = page.getByTestId('check-terms');
    const resetButton = page.getByTestId('btn-reset');

    await test.step('fill entire form', async () => {
        await fullName.fill(userData.fullName);
        await emailAddress.fill(userData.email);
        await password.fill(userData.password);
        await phoneNumber.fill(userData.phoneNumber);
        await dob.fill(userData.dob);
        await countryDropdown.selectOption(userData.country);
        await maleRadio.check();
        await javaScriptCheckbox.check();
        await pythonCheckbox.check();
        await bioTextarea.fill(userData.bio);
        await termsConditionsCheckbox.check();
    });

    await test.step('click Reset', async () => {
        await resetButton.click();
    });

    await test.step('all text/select fields are cleared', async () => {
        await expect(fullName).toHaveValue('');
        await expect(emailAddress).toHaveValue('');
        await expect(password).toHaveValue('');
        await expect(phoneNumber).toHaveValue('');
        await expect(dob).toHaveValue('');
        await expect(countryDropdown).toHaveValue('');
        await expect(bioTextarea).toHaveValue('');
    });

    await test.step('all radios and checkboxes are unchecked', async () => {
        await expect(maleRadio).not.toBeChecked();
        await expect(femaleRadio).not.toBeChecked();
        await expect(otherRadio).not.toBeChecked();

        await expect(javaScriptCheckbox).not.toBeChecked();
        await expect(pythonCheckbox).not.toBeChecked();
        await expect(javaCheckbox).not.toBeChecked();
        await expect(csharpCheckbox).not.toBeChecked();

        await expect(termsConditionsCheckbox).not.toBeChecked();
    });
});