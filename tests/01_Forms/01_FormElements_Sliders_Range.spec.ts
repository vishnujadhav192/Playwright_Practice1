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

    const sliderCard = page.getByTestId('slider-card');
    await sliderCard.scrollIntoViewIfNeeded();
    await expect(sliderCard).toBeVisible();
});

// test.afterEach(async ({ page }) => {
//     await page.waitForTimeout(1000);
//     await page.close();
// });


test.describe('Volume group slider', () => {

    test('Update volume value when slider changes --By fill', async ({ page }) => {

        const sliderValue = 20;

        // Locate the slider
        const slider = page.locator('[data-testid="slider-volume"]');
        // Set slider to a new value (e.g., 20)
        await slider.fill(String(sliderValue));
        // Now check the displayed value
        const volumeValue = page.locator('[data-testid="volume-value"]');
        await expect(volumeValue).toHaveText(String(sliderValue));
        await expect(slider).toHaveAttribute('min', '0');
        await expect(slider).toHaveAttribute('max', '100');

        const Volumnelabel = page.locator('label:has-text("Volume")');
        await expect(Volumnelabel).toHaveText(`Volume: ${sliderValue}%`);
    });

    test('Update volume value when slider changes from current position --By Keyboard Arrow Left movement', async ({ page }) => {
        const slider = page.locator('[data-testid="slider-volume"]');
        // const currentvalue = await slider.getAttribute('value');
        const sliderValue = 60;
        const sliderDefaultValue = await slider.inputValue();
        await slider.focus();
        const sliderPosition = Number(sliderDefaultValue) - sliderValue;
        const finalValue = sliderPosition > 0 ? sliderPosition : 0;

        // Move the slider left
        for (let i = 0; i < sliderValue; i++) {
            await page.keyboard.press('ArrowLeft')
        }

        const volumeValue = page.locator('[data-testid="volume-value"]');
        await expect(volumeValue).toHaveText(String(finalValue));
        await expect(slider).toHaveValue(String(finalValue));
        await expect(slider).toHaveAttribute('min', '0');
        await expect(slider).toHaveAttribute('max', '100');
    });

    test('Update volume value when slider changes from current position --By Keyboard Arrow Right movement', async ({ page }) => {
        const slider = page.locator('[data-testid="slider-volume"]');
        // const currentvalue = await slider.getAttribute('value');
        const sliderValue = 10;
        const sliderDefaultValue = await slider.inputValue();

        await slider.focus();
        const sliderPosition = Number(sliderDefaultValue) + sliderValue;

        const finalValue = sliderPosition > 100 ? 100 : sliderPosition;

        // Move the slider Right
        for (let i = 0; i < sliderValue; i++) {
            await page.keyboard.press('ArrowRight')
        }

        const volumeValue = page.locator('[data-testid="volume-value"]');
        await expect(volumeValue).toHaveText(String(finalValue));
        await expect(slider).toHaveValue(String(finalValue));
        await expect(slider).toHaveAttribute('min', '0');
        await expect(slider).toHaveAttribute('max', '100');
    });

    test('Update volume value when slider set to Home and navigate to right side --By Keyboard Arrow Right movement', async ({ page }) => {
        const slider = page.locator('[data-testid="slider-volume"]');
        // const currentvalue = await slider.getAttribute('value');
        const sliderValue = 10;
        await slider.focus();
        await page.keyboard.press('Home') // go to end point '0'
        const currentsliderValue = 0;
        const sliderPosition = currentsliderValue + sliderValue;
        const finalValue = sliderPosition > 100 ? 100 : sliderPosition;

        // Move the slider Right
        for (let i = 0; i < sliderValue; i++) {
            await page.keyboard.press('ArrowRight')
        }

        const volumeValue = page.locator('[data-testid="volume-value"]');
        await expect(volumeValue).toHaveText(String(finalValue));
        await expect(slider).toHaveValue(String(finalValue));
        await expect(slider).toHaveAttribute('min', '0');
        await expect(slider).toHaveAttribute('max', '100');
    });

    test('Update volume value when slider set to end and navigate to left side --By Keyboard Arrow Left movement', async ({ page }) => {
        const slider = page.locator('[data-testid="slider-volume"]');
        // const currentvalue = await slider.getAttribute('value');
        const sliderValue = 10;
        await slider.focus();
        await page.keyboard.press('End') // go to end point '100'
        const currentsliderValue = 100;

        const sliderPosition = currentsliderValue - sliderValue;

        const finalValue = sliderPosition > 0 ? sliderPosition : 0;

        // Move the slider Left
        for (let i = 0; i < sliderValue; i++) {
            await page.keyboard.press('ArrowLeft')
        }

        const volumeValue = page.locator('[data-testid="volume-value"]');
        await expect(volumeValue).toHaveText(String(finalValue));
        await expect(slider).toHaveValue(String(finalValue));
        await expect(slider).toHaveAttribute('min', '0');
        await expect(slider).toHaveAttribute('max', '100');
    });
})

test.describe('Price Range slider', () => {

    test('Update Price Range when slider set to end and navigate to left side --By Keyboard Arrow Left movement', async ({ page }) => {
        const slider = page.locator('[data-testid="slider-price"]');
        const stepAttr = await slider.getAttribute('step');
        const stepValue = stepAttr ? Number(stepAttr) : 0;

        const sliderStepValue = 2;

        const sliderMovement = stepValue * sliderStepValue;

        await slider.focus();
        await page.keyboard.press('End') // go to end point '1000'
        const currentsliderstepAttr = await slider.getAttribute('max');
        const currentsliderstepValue = currentsliderstepAttr ? Number(currentsliderstepAttr) : 0;

        const sliderValuePosition = currentsliderstepValue - sliderMovement;

        const finalValue = sliderValuePosition > 0 ? sliderValuePosition : 0;

        // Move the slider Left
        for (let i = 0; i < sliderStepValue; i++) {
            await page.keyboard.press('ArrowLeft')
        }

        const priceValue = page.locator('[data-testid="price-value"]');
        await expect(priceValue).toHaveText(String(finalValue));
        await expect(slider).toHaveAttribute('min', '0');
        await expect(slider).toHaveAttribute('max', '1000');

        const priceLabel = page.locator('label:has-text("Price Range")');
        await expect(priceLabel).toHaveText(`Price Range: $${finalValue}`);
    });

    test('Update Price Range when slider set to home and navigate to right side --By Keyboard Arrow right movement', async ({ page }) => {
        const slider = page.locator('[data-testid="slider-price"]');
        const stepAttr = await slider.getAttribute('step');
        const stepValue = stepAttr ? Number(stepAttr) : 0;

        const sliderStepValue = 5;

        const sliderMovement = stepValue * sliderStepValue;

        await slider.focus();
        await page.keyboard.press('Home') // go to end point '0'
        const currentsliderstepAttr = await slider.getAttribute('min');
        const currentsliderstepValue = currentsliderstepAttr ? Number(currentsliderstepAttr) : 0;

        const sliderValuePosition = currentsliderstepValue + sliderMovement;

        const finalValue = sliderValuePosition > 1000 ? 1000 : sliderValuePosition;

        // Move the slider Left
        for (let i = 0; i < sliderStepValue; i++) {
            await page.keyboard.press('ArrowRight')
        }

        const priceValue = page.locator('[data-testid="price-value"]');
        await expect(priceValue).toHaveText(String(finalValue));
        await expect(slider).toHaveAttribute('min', '0');
        await expect(slider).toHaveAttribute('max', '1000');

        const priceLabel = page.locator('label:has-text("Price Range")');
        await expect(priceLabel).toHaveText(`Price Range: $${finalValue}`);
    });

    test('Update Price Range when slider changes from current position to left --By Keyboard Arrow Left movement', async ({ page }) => {
        const slider = page.locator('[data-testid="slider-price"]');
        const stepAttr = await slider.getAttribute('step');
        const stepValue = stepAttr ? Number(stepAttr) : 0;

        const sliderStepValue = 10;

        const sliderMovement = stepValue * sliderStepValue;

        await slider.focus();

        const currentsliderstepAttr = await slider.getAttribute('value');
        const currentsliderstepValue = currentsliderstepAttr ? Number(currentsliderstepAttr) : 0;

        const sliderValuePosition = currentsliderstepValue - sliderMovement;

        const finalValue = sliderValuePosition > 0 ? sliderValuePosition : 0;

        // Move the slider Left
        for (let i = 0; i < sliderStepValue; i++) {
            await page.keyboard.press('ArrowLeft')
        }

        const priceValue = page.locator('[data-testid="price-value"]');
        await expect(priceValue).toHaveText(String(finalValue));
        await expect(slider).toHaveAttribute('min', '0');
        await expect(slider).toHaveAttribute('max', '1000');

        const priceLabel = page.locator('label:has-text("Price Range")');
        await expect(priceLabel).toHaveText(`Price Range: $${finalValue}`);
    });

    test('Update Price Range when slider changes from current position to right --By Keyboard Arrow Right movement', async ({ page }) => {
        const slider = page.locator('[data-testid="slider-price"]');
        const stepAttr = await slider.getAttribute('step');
        const stepValue = stepAttr ? Number(stepAttr) : 0;

        const sliderStepValue = 8;

        const sliderMovement = stepValue * sliderStepValue;

        await slider.focus();

        const currentsliderstepAttr = await slider.getAttribute('value');
        const currentsliderstepValue = currentsliderstepAttr ? Number(currentsliderstepAttr) : 0;

        const sliderValuePosition = currentsliderstepValue + sliderMovement;

        const finalValue = sliderValuePosition > 1000 ? 1000 : sliderValuePosition;

        // Move the slider Right
        for (let i = 0; i < sliderStepValue; i++) {
            await page.keyboard.press('ArrowRight')
        }

        const priceValue = page.locator('[data-testid="price-value"]');
        await expect(priceValue).toHaveText(String(finalValue));
        await expect(slider).toHaveAttribute('min', '0');
        await expect(slider).toHaveAttribute('max', '1000');

        const priceLabel = page.locator('label:has-text("Price Range")');
        await expect(priceLabel).toHaveText(`Price Range: $${finalValue}`);
    });
})

test.describe('Favorite Color', () => {

    test('Favorite Color : Assert the initial value', async ({ page }) => {
        const slider = page.locator('[data-testid="color-picker"]');
        // await slider.click();

        await expect(slider).toHaveValue('#6366f1');

        await expect(page.locator('[data-testid="color-display"]')).toHaveText('#6366f1');
    });

    test('Favorite Color : Simulate changing the color', async ({ page }) => {
        const slider = page.locator('[data-testid="color-picker"]');

        await page.fill('#colorPicker', '#ff0000'); // simulate picking red
        await expect(page.locator('[data-testid="color-display"]')).toHaveText('#ff0000');
    });

    test('Update favorite color value directly', async ({ page }) => {
        const newColor = '#ff0000'; // red

        const colorPicker = page.locator('[data-testid="color-picker"]');

        // Set the value programmatically (native OS color picker can't be automated)
        await colorPicker.evaluate((el: HTMLInputElement, value: string) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, newColor);

        // Verify the input itself holds the new value
        await expect(colorPicker).toHaveValue(newColor);

        // Verify the display span reflects it
        const colorDisplay = page.locator('[data-testid="color-display"]');
        await expect(colorDisplay).toHaveText(newColor);
    });

    test('Default favorite color on page load', async ({ page }) => {
        const colorPicker = page.locator('[data-testid="color-picker"]');
        const colorDisplay = page.locator('[data-testid="color-display"]');

        await expect(colorPicker).toHaveValue('#6366f1');
        await expect(colorDisplay).toHaveText('#6366f1');
    });

    test('Invalid hex format falls back to black', async ({ page }) => {
        const colorPicker = page.locator('[data-testid="color-picker"]');

        await colorPicker.evaluate((el: HTMLInputElement, value: string) => {
            el.value = value; // invalid format
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, 'not-a-color');

        // Chromium falls back to #000000 for invalid hex values on type="color"
        await expect(colorPicker).toHaveValue('#000000');

        const colorDisplay = page.locator('[data-testid="color-display"]');
        await expect(colorDisplay).toHaveText('#000000');
    });
})