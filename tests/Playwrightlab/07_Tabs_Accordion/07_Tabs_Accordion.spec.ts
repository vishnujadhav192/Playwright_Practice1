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

test('Click on Menu Tabs & Accordion option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-modals').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    await verifyCardVisible(page, 'tabs-card');

    // By id
    await expect(page.locator('#tabsAccordionDesc')).toContainText('Tabbed interfaces and collapsible content panels.');

    // By role (more robust, recommended)
    //    await expect(page.getByRole('heading', { name: 'Modals', exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tabs & Accordion', exact: true })).toBeVisible();

    // Also check the section is visible (has the 'section-title' class)
    await expect(page.locator('#dynamicTitle')).toHaveClass(/title/);
})

test.describe('Tabs', () => {

    test('Overview Tabs', async ({ page }) => {
        await verifyCardVisible(page, 'tabs-card');
        // Check Overview tab is active by default

        const overviewTab = page.locator('[data-testid="tab-content-1"]');
        const featuresTab = page.locator('[data-testid="tab-content-2"]');
        const pricingTab = page.locator('[data-testid="tab-content-3"]');
        const disabledTab = page.locator('[data-testid="tab-content-4"]');

        await expect(overviewTab).toBeVisible();

        // Assert the heading text
        await expect(overviewTab.locator('h4')).toHaveText('Overview');

        // Assert the paragraph text
        await expect(overviewTab.locator('p')).toContainText('PlayLab is a comprehensive test automation practice website');

        // Assert the active class is applied
        await expect(overviewTab).toHaveClass(/active/);

        await expect(featuresTab).toBeHidden();
        await expect(pricingTab).toBeHidden();
        await expect(disabledTab).toBeHidden();

    })

    test('Features Tabs', async ({ page }) => {
        await verifyCardVisible(page, 'tabs-card');

        const overviewTab = page.locator('[data-testid="tab-content-1"]');
        const featuresTab = page.locator('[data-testid="tab-content-2"]');
        const pricingTab = page.locator('[data-testid="tab-content-3"]');
        const disabledTab = page.locator('[data-testid="tab-content-4"]');

        // Switch to Features tab
        await page.click('[data-testid="tab-btn-2"]');
        await expect(featuresTab).toBeVisible();

        // Assert the heading text
        await expect(featuresTab.locator('h4')).toHaveText('Features');

        // Assert all list items together
        await expect(featuresTab.locator('ul li')).toHaveText([
            '50+ interactive UI elements',
            'Dynamic content loading',
            'Responsive design testing',
            'Theme switching (dark/light)',
            'Authentication flows'
        ]);

        // Assert the active class is applied
        await expect(featuresTab).toHaveClass(/active/);

        await expect(overviewTab).toBeHidden();
        await expect(pricingTab).toBeHidden();
        await expect(disabledTab).toBeHidden();
    })

    test('Pricing Tabs', async ({ page }) => {
        await verifyCardVisible(page, 'tabs-card');

        const overviewTab = page.locator('[data-testid="tab-content-1"]');
        const featuresTab = page.locator('[data-testid="tab-content-2"]');
        const pricingTab = page.locator('[data-testid="tab-content-3"]');
        const disabledTab = page.locator('[data-testid="tab-content-4"]');

        // Switch to Pricing tab
        await page.click('[data-testid="tab-btn-3"]');
        await expect(pricingTab).toBeVisible();

        // Assert the heading text
        await expect(pricingTab.locator('h4')).toHaveText('Pricing');

        // Assert the paragraph text
        await expect(pricingTab.locator('p')).toContainText('This practice site is completely open-source and free to use for learning automation testing.');

        // Assert the active class is applied
        await expect(pricingTab).toHaveClass(/active/);

        await expect(overviewTab).toBeHidden();
        await expect(featuresTab).toBeHidden();
        await expect(disabledTab).toBeHidden();
    })

    test('Disabled Tab', async ({ page }) => {

        await verifyCardVisible(page, 'tabs-card');

        // Overview tab is active by default , We will not able to click on Disabled tab.

        const overviewTab = page.locator('[data-testid="tab-content-1"]');
        const featuresTab = page.locator('[data-testid="tab-content-2"]');
        const pricingTab = page.locator('[data-testid="tab-content-3"]');
        const disabledTabBtn = page.locator('[data-testid="tab-btn-4"]');
        const disabledTabContent = page.locator('[data-testid="tab-content-4"]');

        // Disabled tab button should not be clickable
        await expect(disabledTabBtn).toBeDisabled();

        // Other tab contents should be hidden initially
        await expect(featuresTab).toBeHidden();
        await expect(pricingTab).toBeHidden();

        // Disabled tab content should also be hidden
        await expect(disabledTabContent).toBeHidden();

        //We will not able to click on disable so it will be on pricing tab only.
    });
})

test.describe('Accordion', () => {

    test('Accordion - What is Playwright?', async ({ page }) => {
        await verifyCardVisible(page, 'accordion-card');

        // Locate headers and bodies
        const header1 = page.locator('[data-testid="accordion-header-1"]');

        const body1 = page.locator('[data-testid="accordion-body-1"]');
        const body2 = page.locator('[data-testid="accordion-body-2"]');
        const body3 = page.locator('[data-testid="accordion-body-3"]');
        const body4 = page.locator('[data-testid="accordion-body-4"]');

        // ✅ Default state: item 1 is open
        await expect(body1).toBeVisible();
        await expect(body2).toBeHidden();
        await expect(body3).toBeHidden();
        await expect(body4).toBeHidden();

        // ⬇️ Collapse item 1
        await header1.click();
        await expect(body1).toBeHidden();
        await expect(body2).toBeHidden();
        await expect(body3).toBeHidden();
        await expect(body4).toBeHidden();

        // ⬆️ Expand item 1 again
        await header1.click();
        await expect(body1).toBeVisible();

        await expect(body1.locator('p')).toHaveText('Playwright is a modern end-to-end testing framework created by Microsoft. It supports Chromium, Firefox, and WebKit browsers with a single API.');
        await expect(body1.locator('p')).toContainText('Playwright is a modern end-to-end testing framework');

        await expect(body2).toBeHidden();
        await expect(body3).toBeHidden();
        await expect(body4).toBeHidden();
    })

    test('Accordion - Why use this practice site?', async ({ page }) => {
        await verifyCardVisible(page, 'accordion-card');

        // Locate headers and bodies
        const header2 = page.locator('[data-testid="accordion-header-2"]');

        const body1 = page.locator('[data-testid="accordion-body-1"]');
        const body2 = page.locator('[data-testid="accordion-body-2"]');
        const body3 = page.locator('[data-testid="accordion-body-3"]');
        const body4 = page.locator('[data-testid="accordion-body-4"]');

        // ⬆️ Expand item 2
        await header2.click();
        await expect(body2).toBeVisible();

        await expect(body2.locator('p')).toHaveText('This site provides a safe environment to practice various automation scenarios without affecting real applications. It covers forms, tables, modals, drag & drop, and more.');
        await expect(body2.locator('p')).toContainText('automation');

        await expect(body1).toBeHidden();
        await expect(body3).toBeHidden();
        await expect(body4).toBeHidden();
    })

    test('Accordion - How to get started?', async ({ page }) => {
        await verifyCardVisible(page, 'accordion-card');

        // Locate headers and bodies
        const header3 = page.locator('[data-testid="accordion-header-3"]');

        const body1 = page.locator('[data-testid="accordion-body-1"]');
        const body2 = page.locator('[data-testid="accordion-body-2"]');
        const body3 = page.locator('[data-testid="accordion-body-3"]');
        const body4 = page.locator('[data-testid="accordion-body-4"]');

        // ⬆️ Expand item 3
        await header3.click();
        await expect(body3).toBeVisible();

        await expect(body3.locator('p')).toHaveText("Install Playwright with npm init playwright@latest, then write your tests targeting this site's elements using the provided data-testid attributes.");
        await expect(body3.locator('p')).toContainText('playwright@latest');

        await expect(body1).toBeHidden();
        await expect(body2).toBeHidden();
        await expect(body4).toBeHidden();

    })

    test('Accordion - Can I contribute?', async ({ page }) => {
        await verifyCardVisible(page, 'accordion-card');

        // Locate headers and bodies
        const header4 = page.locator('[data-testid="accordion-header-4"]');

        const body1 = page.locator('[data-testid="accordion-body-1"]');
        const body2 = page.locator('[data-testid="accordion-body-2"]');
        const body3 = page.locator('[data-testid="accordion-body-3"]');
        const body4 = page.locator('[data-testid="accordion-body-4"]');

        // ⬆️ Expand item 4
        await header4.click();
        await expect(body4).toBeVisible();

        await expect(body4.locator('p')).toHaveText("Absolutely! Fork the repository, add new practice sections, and submit a pull request. All contributions are welcome.");
        await expect(body4.locator('p')).toContainText('repository');

        await expect(body1).toBeHidden();
        await expect(body2).toBeHidden();
        await expect(body3).toBeHidden();
    });
});