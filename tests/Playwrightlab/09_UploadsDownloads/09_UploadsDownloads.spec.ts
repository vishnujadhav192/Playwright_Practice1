import { test, expect, Page, Locator } from '@playwright/test'
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
});

async function verifyCardVisible(page: Page, testId: string) {
    const card = page.getByTestId(testId);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
}

// test.afterEach(async ({ page }) => {
//     //await page.close();
// });

test('Click on Menu Uploads and Downloads option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-uploads-downloads').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    await verifyCardVisible(page, 'single-upload-card');

    // By id
    await expect(page.locator('#uploadsDownloadsDesc')).toContainText('Single/multiple file upload flows plus a real PDF to test browser download/viewer behavior.');

    // By role (more robust, recommended)
    //    await expect(page.getByRole('heading', { name: 'Modals', exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Uploads & Downloads', exact: true })).toBeVisible();

    // Also check the section is visible (has the 'section-title' class)
    await expect(page.locator('#dynamicTitle')).toHaveClass(/title/);
})

test('Upload single file', async ({ page }) => {
    await verifyCardVisible(page, 'single-upload-card');
    const filename = 'File_Upload.pdf';

    const filePath = path.join(__dirname, '../../..', 'FilesForUploads', filename);

    // Upload the single file
    await page.getByTestId('single-file-input').setInputFiles(filePath);

    // Click the Upload button
    await page.getByTestId('single-upload-btn').click();

    // Assert the file list shows the uploaded file
    const fileList = page.getByTestId('single-file-list');
    const files = fileList.locator('[data-testid^="file-item-"]');
    await expect(files).toHaveCount(1);

    const fileItem = files.nth(0);
    await expect(fileItem).toBeVisible();
    await expect(fileItem).toContainText(filename);

    // Assert the success message is visible
    const status = page.getByTestId('single-upload-status');
    await expect(status).toBeVisible();
    await expect(status).toContainText('Uploaded successfully!');
});

test('Upload multiples files', async ({ page }) => {

    await verifyCardVisible(page, 'multi-upload-card');

    const filenames = [
        'File_Upload.pdf',
        'File_Upload.png',
        'File_Upload.doc'
    ];

    // Build absolute paths for each file
    const filePaths = filenames.map(name =>
        path.join(__dirname, '../../..', 'FilesForUploads', name)
    );

    // Upload multiple files
    await page.getByTestId('multi-file-input').setInputFiles(filePaths);

    // Click the Upload button
    await page.getByTestId('multi-upload-btn').click();

    // Assert all files are listed
    const fileList = page.getByTestId('multi-file-list');
    const files = fileList.locator('[data-testid^="file-item-"]');
    await expect(files).toHaveCount(filenames.length);

    for (let i = 0; i < filenames.length; i++) {
        const fileItem = files.nth(i);
        await expect(fileItem).toBeVisible();
        await expect(fileItem).toContainText(filenames[i]);
    }

    // Assert status message is visible (after upload)
    const status = page.getByTestId('multi-upload-status');
    await expect(status).toBeVisible();
    await expect(status).toContainText('Uploaded'); // adjust if your app sets a different message
});

test('Remove file before upload', async ({ page }) => {

    await verifyCardVisible(page, 'multi-upload-card');

    const filenames = [
        'File_Upload.pdf',
        'File_Upload.png',
        'File_Upload.doc'
    ];

    // Build absolute paths for each file
    const filePaths = filenames.map(name =>
        path.join(__dirname, '../../..', 'FilesForUploads', name)
    );

    // Upload multiple files
    await page.getByTestId('multi-file-input').setInputFiles(filePaths);

    // Assert all files are listed
    const fileList = page.getByTestId('multi-file-list');
    const files = fileList.locator('[data-testid^="file-item-"]');
    await expect(files).toHaveCount(filenames.length);

    for (let i = 0; i < filenames.length; i++) {
        const fileItem = files.nth(i);
        await expect(fileItem).toBeVisible();
        await expect(fileItem).toContainText(filenames[i]);
    }

    const removeFile = page.getByTestId('remove-File_Upload.pdf');

    await removeFile.click();

    // Assert file count decreased
    await expect(files).toHaveCount(filenames.length - 1);

    // Assert the removed file is gone
    await expect(page.getByTestId('file-item-File_Upload.pdf')).toHaveCount(0);

    // Click the Upload button
    await page.getByTestId('multi-upload-btn').click();

    // Assert status message is visible (after upload)
    const status = page.getByTestId('multi-upload-status');
    await expect(status).toBeVisible();
    await expect(status).toContainText('Uploaded successfully!'); // adjust if your app sets a different message

});

test('Download PDF', async ({ page }) => {
    await verifyCardVisible(page, 'pdf-download-card');

    const pdfCard = page.getByTestId('pdf-download-card');
    await pdfCard.scrollIntoViewIfNeeded();
    await expect(pdfCard).toBeVisible();

    // Capture the download event
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByTestId('download-pdf-btn').click()
    ]);

    // Verify the suggested filename
    const suggestedName = download.suggestedFilename();
    expect(suggestedName).toBe('Playwright-Cheat-Sheet.pdf');

    // Save the file locally (optional)
    //const savePath = path.resolve(process.cwd(), 'FilesDownloaded', suggestedName);

    const savePath = path.join(__dirname, '../../..', 'FilesDownloaded', suggestedName);

    await download.saveAs(savePath);
});

test('open PDF in new tab', async ({ page, context }) => {

    await verifyCardVisible(page, 'pdf-download-card');
    const pdfCard = page.getByTestId('pdf-download-card');
    await pdfCard.scrollIntoViewIfNeeded();
    await expect(pdfCard).toBeVisible();

    // Clicking "Open PDF" should open a new tab
    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        page.getByTestId('open-pdf-btn').click()
    ]);

    // Wait for the new page to load
    await newPage.waitForLoadState('domcontentloaded');

    // Assert the URL contains the PDF path
    expect(newPage.url()).toContain('pdf/Playwright-Cheat-Sheet.pdf');
});