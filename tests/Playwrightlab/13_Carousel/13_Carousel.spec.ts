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

function getSlide(page: Page, number: string) {
    return page.getByTestId(`carousel-slide-${number}`);
}

// test.afterEach(async ({ page }) => {
//     //await page.close();
// });

test('Click on Menu Carousel option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-carousel').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

        await verifyCardVisible(page, 'carousel-card');


    // By id
    await expect(page.locator('#carouselDesc')).toContainText('Image carousel with navigation, autoplay, and indicator dots.');

    // By role (more robust, recommended)
    await expect(page.getByRole('heading', { name: 'Carousel / Slider', exact: true })).toBeVisible();

    // Also check the section is visible (has the 'section-title' class)
    await expect(page.locator('#carouselTitle')).toHaveClass(/section-title/);
})

test('Carousel', async ({ page }) => {
    await verifyCardVisible(page, 'carousel-card');
    await expect(page.getByTestId('carousel-slide-1')).toBeVisible();
    await expect(page.getByTestId('carousel-autoplay')).toBeChecked();
    await expect(page.getByTestId('carousel-status')).toHaveText('Slide 1 of 4');
});

test('Untick Autoplay Carousel', async ({ page }) => {
    await verifyCardVisible(page, 'carousel-card');
    await page.getByTestId('carousel-autoplay').uncheck();
    await expect(page.getByTestId('carousel-autoplay')).not.toBeChecked();
});

test('Navigate to carousel-slide-2 using carousel-next', async ({ page }) => {
    await verifyCardVisible(page, 'carousel-card');
    await page.getByTestId('carousel-autoplay').uncheck();
    await expect(page.getByTestId('carousel-autoplay')).not.toBeChecked();
    await page.getByTestId('carousel-next').click();
    await expect(page.getByTestId('carousel-slide-3')).toHaveClass(/active/);
    await expect(page.getByTestId('carousel-status')).toHaveText('Slide 3 of 4');
});

test('Navigate to carousel-slide-4 using Dot navigation', async ({ page }) => {
    const autoPlay = page.getByTestId('carousel-autoplay');
    const carouselDot4 = page.getByTestId('carousel-dot-4');
    const carouselSlide4 = page.getByTestId('carousel-slide-4');
    const carouselStatus = page.getByTestId('carousel-status');

    await verifyCardVisible(page, 'carousel-card');
    await autoPlay.uncheck();
    await expect(autoPlay).not.toBeChecked();
    await carouselDot4.click();
    await expect(carouselSlide4).toHaveClass(/active/);
    await expect(carouselStatus).toHaveText('Slide 4 of 4');
    await expect(carouselSlide4.locator('h2')).toHaveText('Completely Free');
    await expect(carouselSlide4.locator('p')).toHaveText('Open source and free to use for learning');
});

test('Count number of carousel and assert', async ({ page }) => {
    await verifyCardVisible(page, 'carousel-card');

    const slides = page.locator('.carousel-slide');
    const count = await slides.count();
    console.log(`Total slides: ${count}`);
    expect(count).toBe(4); // sanity check

    const autoPlay = page.getByTestId('carousel-autoplay');
    await autoPlay.uncheck();

    // Loop through all slides
    for (let i = 1; i <= count; i++) {
        // Click the corresponding dot
        await page.getByTestId(`carousel-dot-${i}`).click();

        // Get the slide element
        const slide = getSlide(page, String(i));

        // Assert h2 and p based on index
        switch (i) {
            case 1:
                await expect(slide.locator('h2')).toHaveText('Welcome to PlayLab');
                await expect(slide.locator('p')).toHaveText('Your ultimate Playwright practice arena');
                break;
            case 2:
                await expect(slide.locator('h2')).toHaveText('50+ UI Elements');
                await expect(slide.locator('p')).toHaveText('Forms, tables, modals, and much more');
                break;
            case 3:
                await expect(slide.locator('h2')).toHaveText('Real-World Patterns');
                await expect(slide.locator('p')).toHaveText("Practice with patterns you'll find in production");
                break;
            case 4:
                await expect(slide.locator('h2')).toHaveText('Completely Free');
                await expect(slide.locator('p')).toHaveText('Open source and free to use for learning');
                break;
        }
    }
});