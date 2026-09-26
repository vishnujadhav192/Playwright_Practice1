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

test.describe('Hover Effects', () => {

    test('Hover me', async ({ page }) => {
        await verifyCardVisible(page, 'hover-card');

        const hoverBox = page.getByTestId("hover-box-1");
        await hoverBox.click();
        await expect(page.getByTestId('hover-box-1')).toHaveAttribute('data-tooltip', "I'm a tooltip!");
    });

    test('Scale 1', async ({ page }) => {
        await verifyCardVisible(page, 'hover-card');

        const scaleBox = page.getByTestId('hover-box-2');

        // Before hover
        let transformBefore = await scaleBox.evaluate(el => getComputedStyle(el).transform);

        // Hover
        await scaleBox.hover();

        // After hover
        let transformAfter = await scaleBox.evaluate(el => getComputedStyle(el).transform);

        // Assert transform changed
        expect(transformBefore).not.toBe(transformAfter);
    });

    test('Scale 2', async ({ page }) => {
        await verifyCardVisible(page, 'hover-card');

        const scaleBox = page.getByTestId('hover-box-2');

        // Before hover
        const boxBefore = await scaleBox.boundingBox();

        // Hover
        await scaleBox.hover();

        // After hover
        const boxAfter = await scaleBox.boundingBox();

        // Assert size increased
        expect(boxAfter!.width).toBeGreaterThan(boxBefore!.width);
        expect(boxAfter!.height).toBeGreaterThan(boxBefore!.height);
    });

    test('Rotate', async ({ page }) => {
        await verifyCardVisible(page, 'hover-card');

        const rotateBox = page.getByTestId('hover-box-3');

        // Before hover
        const transformBefore = await rotateBox.evaluate(el => getComputedStyle(el).transform);

        // Hover
        await rotateBox.hover();

        // After hover
        const transformAfter = await rotateBox.evaluate(el => getComputedStyle(el).transform);

        // Assert rotation applied
        expect(transformBefore).not.toBe(transformAfter);
        expect(transformAfter).toContain('matrix'); // rotation usually shows as a matrix
    });

    test('Color 1', async ({ page }) => {
        await verifyCardVisible(page, 'hover-card');

        const colorBox = page.getByTestId('hover-box-4');

        // Before hover
        const colorBefore = await colorBox.evaluate(el => getComputedStyle(el).color);

        // Hover
        await colorBox.hover();

        // After hover
        const colorAfter = await colorBox.evaluate(el => getComputedStyle(el).color);

        // Assert color changed
        expect(colorBefore).not.toBe(colorAfter);
    });

    test('Color 2', async ({ page }) => {
        await verifyCardVisible(page, 'hover-card');

        const colorBox = page.getByTestId('hover-box-4');

        // Get color before hover
        const beforeColor = await colorBox.evaluate(el => getComputedStyle(el).color);
        console.log('Before hover color:', beforeColor);

        // Hover over the element
        await colorBox.hover();

        // Get color after hover
        const afterColor = await colorBox.evaluate(el => getComputedStyle(el).color);
        console.log('After hover color:', afterColor);

        // Assertions
        expect(beforeColor).not.toBe(afterColor);   // ensure the color changed
        // If you know the expected hover color, assert it directly:
        // expect(afterColor).toBe('rgb(255, 0, 0)');
    });

    test('Tooltip appears on hover', async ({ page }) => {
        await verifyCardVisible(page, 'hover-card');

        const tooltipBtn = page.getByTestId('tooltip-btn');
        const tooltip = page.getByTestId('custom-tooltip');

        // Tooltip should be hidden initially
        await expect(tooltip).toBeHidden();

        // Hover over the button
        await tooltipBtn.hover();

        // Tooltip should now be visible
        await expect(tooltip).toBeVisible();

        // Assert tooltip text content
        await expect(tooltip).toContainText("This is a custom tooltip");

    });

    test('Double click demo', async ({ page }) => {
        await verifyCardVisible(page, 'hover-card');

        const doubleClickBtn = page.getByTestId('double-click-btn');
        const doubleClickResult = page.getByTestId('double-click-result');

        // Result should be hidden or empty initially
        // await expect(doubleClickResult).toHaveText('Double-clicked!', { timeout: 0 }).catch(() => {}); 
        // or simply: await expect(doubleClickResult).not.toBeVisible(); if hidden by default

        // Perform double click
        await doubleClickBtn.dblclick();

        // Assert result text appears
        await expect(doubleClickResult).toBeVisible();
        await expect(doubleClickResult).toHaveText('Double-clicked!');
    });

    test('Right click demo', async ({ page }) => {
        await verifyCardVisible(page, 'hover-card');

        const rightClickBtn = page.getByTestId('right-click-btn');
        const rightClickResult = page.getByTestId('right-click-result');

        // Initial state: result should not be visible or should not contain the text
        await expect(rightClickResult).not.toBeVisible();

        // Perform right-click
        await rightClickBtn.click({ button: 'right' });

        // Assert result text appears
        await expect(rightClickResult).toBeVisible();
        await expect(rightClickResult).toHaveText('Right-clicked!');
    });
});