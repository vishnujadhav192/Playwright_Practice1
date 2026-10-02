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

test('Click on Menu Media Player option', async ({ page }) => {
  await page.getByTestId('nav-menu').click();
  await page.getByTestId('nav-media').click();

  await page.mouse.move(0, 0);

  // Assert the dropdown closes after selecting an item
  await expect(page.getByTestId('dropdown-menu')).toBeHidden();

  await verifyCardVisible(page, 'video-card');

  // By id
  await expect(page.locator('#mediaDesc')).toContainText('Audio and video controls for testing media interactions.');

  // By role (more robust, recommended)
  await expect(page.getByRole('heading', { name: 'Media Player', exact: true })).toBeVisible();

  // Also check the section is visible (has the 'section-title' class)
  await expect(page.locator('#mediaTitle')).toHaveClass(/section-title/);
  await expect(page.locator('#mediaTag')).toHaveClass(/section-tag/);
})

test('video play and pause controls', async ({ page }) => {
  await verifyCardVisible(page, 'video-card');

  const video = page.locator('#videoPlayer');
  const playBtn = page.locator('#videoPlay');
  const pauseBtn = page.locator('#videoPause');

  // Click play
  await playBtn.click();
  await expect(video).toHaveJSProperty('paused', false);

  // Click pause
  await pauseBtn.click();
  await expect(video).toHaveJSProperty('paused', true);
});

test('video mute and volume control', async ({ page }) => {
  await verifyCardVisible(page, 'video-card');

  const video = page.locator('#videoPlayer');
  const muteBtn = page.locator('#videoMute');
  const volumeSlider = page.locator('#videoVolume');

  // Mute
  await muteBtn.click();
  await expect(video).toHaveJSProperty('muted', true);

  // Adjust volume
  await volumeSlider.fill('0.5');
  await expect(video).toHaveJSProperty('volume', 0.5);
});

test('audio play and stop controls', async ({ page }) => {
  await verifyCardVisible(page, 'audio-card');

  const audio = page.locator('#audioPlayer');
  const playBtn = page.locator('#audioPlay');
  const stopBtn = page.locator('#audioStop');

  // Play audio
  await playBtn.click();
  await expect(audio).toHaveJSProperty('paused', false);

  // Stop audio (reset to start)
  await stopBtn.click();
  await expect(audio).toHaveJSProperty('currentTime', 0);
});

test('audio volume slider', async ({ page }) => {

  await verifyCardVisible(page, 'audio-card');

  const audio = page.locator('#audioPlayer');
  const volumeSlider = page.locator('#audioVolume');

  // Set volume to 0.3
  await volumeSlider.fill('0.3');
  await expect(audio).toHaveJSProperty('volume', 0.3);
});