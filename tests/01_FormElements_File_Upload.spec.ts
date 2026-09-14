import { test, expect } from '@playwright/test'
import path from 'path';

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

    const uploadCard = page.getByTestId('upload-card');
    await uploadCard.scrollIntoViewIfNeeded();
    await expect(uploadCard).toBeVisible();

});

// test.afterEach(async ({ page }) => {
//     await page.waitForTimeout(1000);
//     await page.close();
// });

test.describe('File Upload', () => {

    test('uploads a single valid file and shows it in the file list', async ({ page }) => {

        const filename1 = 'File_Upload_0.pdf';

        const filePath = path.join(__dirname, '..', 'FilesForUploads', filename1);

        // The input is hidden, but setInputFiles works on hidden inputs directly
        await page.getByTestId('file-input').setInputFiles(filePath);

        // Assert it shows up in the file list
        const fileList = page.getByTestId('file-list');
        await expect(fileList).toContainText(filename1);
        await expect(fileList.locator('> *')).toHaveCount(1);
    });
});