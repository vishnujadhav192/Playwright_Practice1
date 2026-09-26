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
//     //await page.close();
// });

test.describe('upload a single valid file and shows it in the file list', () => {

    test('uploads a single valid file and shows it in the file list', async ({ page }) => {

        const filename = 'File_Upload.pdf';

        const filePath = path.join(__dirname, '../../..', 'FilesForUploads', filename);

        await page.locator('#fileInput').setInputFiles(filePath);

        const fileList = page.getByTestId('file-list');
        const files = fileList.locator('[data-testid^="file-item-"]');


        // Assert only one file is present
        await expect(files).toHaveCount(1);

        // Assert that the single file is visible and has the correct name
        const fileItem = files.nth(0);   // index 0 since only one file
        await expect(fileItem).toBeVisible();
        await expect(fileItem).toContainText(filename);
    });

    test('uploads a multiples valid files and shows it in the file list', async ({ page }) => {

        const filenames = [
            'File_Upload.pdf',
            'File_Upload.png',
            'File_Upload.doc'
        ];

        // Build absolute paths for each file
        const filePaths = filenames.map(name =>
            path.join(__dirname, '../../..', 'FilesForUploads', name)
        );

        // Upload multiple files at once
        await page.locator('#fileInput').setInputFiles(filePaths);

        const fileList = page.getByTestId('file-list');
        const files = fileList.locator('[data-testid^="file-item-"]');

        // Assert total number of files
        await expect(files).toHaveCount(filenames.length);

        // Loop through each file and assert visibility + text
        for (let i = 0; i < filenames.length; i++) {
            const fileItem = files.nth(i);
            await expect(fileItem).toBeVisible();
            await expect(fileItem).toContainText(filenames[i]);
        }
    });

    test('Remove uploaded file', async ({ page }) => {

        const filenames = [
            'File_Upload.pdf',
            'File_Upload.png',
            'File_Upload.doc'
        ];

        // Build absolute paths for each file
        const filePaths = filenames.map(name =>
            path.join(__dirname, '../../..', 'FilesForUploads', name)
        );

        // Upload multiple files at once
        await page.locator('#fileInput').setInputFiles(filePaths);

        const fileList = page.getByTestId('file-list');
        const files = fileList.locator('[data-testid^="file-item-"]');

        // Assert total number of files
        await expect(files).toHaveCount(filenames.length);

        // Loop through each file and assert visibility + text
        for (let i = 0; i < filenames.length; i++) {
            const fileItem = files.nth(i);
            await expect(fileItem).toBeVisible();
            await expect(fileItem).toContainText(filenames[i]);
        }

        const removeFile = page.getByTestId('remove-File_Upload.png')

        await removeFile.click();

        // Assert file count decreased
        await expect(files).toHaveCount(filenames.length - 1);

        // Assert the removed file is gone
        await expect(page.getByTestId('file-item-File_Upload.png')).toHaveCount(0);

    });
});