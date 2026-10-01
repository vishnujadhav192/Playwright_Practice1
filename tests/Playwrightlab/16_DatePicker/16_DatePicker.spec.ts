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

test('Click on Menu Date picker option', async ({ page }) => {
  await page.getByTestId('nav-menu').click();
  await page.getByTestId('nav-datepicker').click();

  await page.mouse.move(0, 0);

  // Assert the dropdown closes after selecting an item
  await expect(page.getByTestId('dropdown-menu')).toBeHidden();

  await verifyCardVisible(page, 'datepicker-card');

  // By id
  await expect(page.locator('#datepickerDesc')).toContainText('A custom calendar widget — more realistic than native date inputs.');

  // By role (more robust, recommended)
  await expect(page.getByRole('heading', { name: 'Custom Date Picker', exact: true })).toBeVisible();

  // Also check the section is visible (has the 'section-title' class)
  await expect(page.locator('#datepickerTitle')).toHaveClass(/section-title/);
  await expect(page.locator('#datepickerTag')).toHaveClass(/section-tag/);
})

test.describe('Calendar Picker', () => {

  test('Select todays date', async ({ page }) => {
    await verifyCardVisible(page, 'datepicker-card');

    //    await page.getByTestId('datepicker-input').click();

    await page.getByPlaceholder('Click to select date...').click();

    await page.getByTestId('dp-today').click();

    const today: Date = new Date();

    const formattedDate: string = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    await expect(page.getByTestId('datepicker-result')).toContainText(`Selected: ${formattedDate}`);
  })

  test('Click on Reset', async ({ page }) => {
    await verifyCardVisible(page, 'datepicker-card');

    //    await page.getByTestId('datepicker-input').click();

    await page.getByPlaceholder('Click to select date...').click();
    await page.getByTestId('dp-today').click();

    await page.getByPlaceholder('Click to select date...').click();
    await page.getByTestId('dp-clear').click();
    //await page.mouse.move(0, 0);
    await page.click('body');

    // ✅ Assert input is empty
    await expect(page.getByTestId('datepicker-input')).toHaveValue('');

    // ✅ Assert result display is empty
    await expect(page.getByTestId('datepicker-result')).toHaveText('');
  });

  test('Pick calendar current month date', async ({ page }) => {
    await verifyCardVisible(page, 'datepicker-card');

    // Open the datepicker
    //    await page.getByTestId('datepicker-input').click();

    await page.getByPlaceholder('Click to select date...').click();

    // Select 31st October 2026
    await page.getByTestId('dp-day-31').click();

    // ✅ Assert input has a value (your app may format differently)
    await expect(page.getByTestId('datepicker-input')).not.toHaveValue('');

    // ✅ Assert result display shows the correct date
    await expect(page.getByTestId('datepicker-result'))
      .toHaveText('Selected: Saturday, October 31, 2026');

    // ✅ Assert that the 31st button has "selected" class
    await expect(page.getByTestId('dp-day-31')).toHaveClass(/selected/);

  })

  test('assert other-month days are inactive in Oct 2026 month view', async ({ page }) => {
    await verifyCardVisible(page, 'datepicker-card');

    // Open the datepicker
    await page.getByTestId('datepicker-input').click();

    // Locate all "other-month" days
    const otherMonthDays = page.locator('.dp-day.other-month');

    // Assert count (should be 4 in October 2026 view)
    await expect(otherMonthDays).toHaveCount(4);

    // Assert each has the "other-month" class
    await expect(otherMonthDays.nth(0)).toHaveClass(/other-month/);
    await expect(otherMonthDays.nth(1)).toHaveClass(/other-month/);
    await expect(otherMonthDays.nth(2)).toHaveClass(/other-month/);
    await expect(otherMonthDays.nth(3)).toHaveClass(/other-month/);

    // Assert each one has only "dp-day other-month" class (no "selected")
    for (let i = 0; i < await otherMonthDays.count(); i++) {
      const day = otherMonthDays.nth(i);
      const className = await day.getAttribute('class');
      expect(className).toBe('dp-day other-month');
    }
    await page.click('body');

  });

  test('Pick previous calendar month date', async ({ page }) => {
    await verifyCardVisible(page, 'datepicker-card');

    // Open the datepicker
    await page.getByPlaceholder('Click to select date...').click();

    await page.getByTestId('dp-prev-month').click();

    // Select 21st September 2026
    await page.getByTestId('dp-day-21').click();

    // ✅ Assert input has a value (your app may format differently)
    await expect(page.getByTestId('datepicker-input')).not.toHaveValue('');

    // ✅ Assert result display shows the correct date
    await expect(page.getByTestId('datepicker-result'))
      .toHaveText('Selected: Monday, September 21, 2026');

    // ✅ Assert that the 31st button has "selected" class
    await expect(page.getByTestId('dp-day-21')).toHaveClass(/selected/);

  })

  test('Pick next calendar month date', async ({ page }) => {
    await verifyCardVisible(page, 'datepicker-card');

    // Open the datepicker
    await page.getByPlaceholder('Click to select date...').click();

    await page.getByTestId('dp-next-month').click();

    // Select 7th November 2026
    await page.getByTestId('dp-day-7').click();

    // ✅ Assert input has a value (your app may format differently)
    await expect(page.getByTestId('datepicker-input')).not.toHaveValue('');

    // ✅ Assert result display shows the correct date
    await expect(page.getByTestId('datepicker-result'))
      .toHaveText('Selected: Saturday, November 7, 2026');

    // ✅ Assert that the 31st button has "selected" class
    await expect(page.getByTestId('dp-day-7')).toHaveClass(/selected/);
  })
})

test.describe('Typable Date', () => {

  test('Select todays date', async ({ page }) => {
    await verifyCardVisible(page, 'typed-date-card');

    //    await page.getByTestId('datepicker-input').click();

    await page.getByPlaceholder('DD-MM-YYYY').click();
    await page.getByTestId('typed-today').click();

    const today: Date = new Date();

    const formattedDate: string = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    await expect(page.getByTestId('typed-date-result')).toContainText(`Selected: ${formattedDate}`);
  })

  test('Click on Reset', async ({ page }) => {
    await verifyCardVisible(page, 'typed-date-card');

    //    await page.getByTestId('datepicker-input').click();

    await page.getByPlaceholder('DD-MM-YYYY').click();
    await page.getByTestId('typed-today').click();

    await page.getByPlaceholder('DD-MM-YYYY').click();
    await page.getByTestId('typed-clear').click();


    //await page.click('body');

    // ✅ Assert input is empty
    await expect(page.getByTestId('typed-date-input')).toHaveValue('');

    // ✅ Assert result display is empty
    await expect(page.getByTestId('typed-date-result')).toHaveText('');
  });

  test('Pick calendar current month date', async ({ page }) => {
    await verifyCardVisible(page, 'typed-date-card');

    // Open the datepicker
    //    await page.getByTestId('typed-date-input').click();

    await page.getByPlaceholder('DD-MM-YYYY').click();

    // Click the 20th day
    await page.getByRole('button', { name: '20' }).click();

    // Assert input updated
    await expect(page.getByTestId('typed-date-input')).toHaveValue('20-10-2026');

    // Assert result display updated
    await expect(page.getByTestId('typed-date-result')).toContainText('Selected: Tuesday, October 20, 2026');
  })

  test('Type Date', async ({ page }) => {
    await verifyCardVisible(page, 'typed-date-card');

    // Type a date manually
    await page.getByTestId('typed-date-input').fill('31-10-2026');

    // Verify input has value
    await expect(page.getByTestId('typed-date-input')).toHaveValue('31-10-2026');

    // (Optional) Verify result display updated
    await expect(page.getByTestId('typed-date-result')).not.toHaveText('');

    // Click Clear
    await page.getByTestId('typed-date-input').click();

    await page.getByTestId('typed-clear').click();

    // ✅ Assert input is empty
    await expect(page.getByTestId('typed-date-input')).toHaveValue('');

    // ✅ Assert result display is empty
    await expect(page.getByTestId('typed-date-result')).toHaveText('');

  })

  test('Type wrong Date', async ({ page }) => {
    await verifyCardVisible(page, 'typed-date-card');

    // Type a date manually
    await page.getByTestId('typed-date-input').fill('99-99-2026');

    // Verify input has value
    await expect(page.getByTestId('typed-date-input')).toHaveValue('99-99-2026');

    // (Optional) Verify result display updated
    await expect(page.getByTestId('typed-date-result')).not.toHaveText('');
    await expect(page.getByTestId('typed-date-result')).toContainText('Enter a valid date in dd-mm-yyyy format');

    // Click Clear
    await page.getByTestId('typed-date-input').click();

    await page.getByTestId('typed-clear').click();

    // ✅ Assert input is empty
    await expect(page.getByTestId('typed-date-input')).toHaveValue('');

    // ✅ Assert result display is empty
    await expect(page.getByTestId('typed-date-result')).toHaveText('');

  })

  test('assert other-month days are inactive in Oct 2026 month view', async ({ page }) => {
    await verifyCardVisible(page, 'typed-date-card');

    // Open the datepicker
    await page.getByTestId('typed-date-input').click();

    // Locate all "other-month" days
    const otherMonthDays = page.locator('.dp-day.calendar-spacer');

    // Assert count (should be 4 in October 2026 view)
    await expect(otherMonthDays).toHaveCount(4);

    // Assert each has the "other-month" class
    await expect(otherMonthDays.nth(0)).toHaveClass(/calendar-spacer/);
    await expect(otherMonthDays.nth(1)).toHaveClass(/calendar-spacer/);
    await expect(otherMonthDays.nth(2)).toHaveClass(/calendar-spacer/);
    await expect(otherMonthDays.nth(3)).toHaveClass(/calendar-spacer/);

    // Assert each one has only "dp-day calendar-spacer" class (no "selected")
    for (let i = 0; i < await otherMonthDays.count(); i++) {
      const day = otherMonthDays.nth(i);
      const className = await day.getAttribute('class');
      expect(className).toBe('dp-day calendar-spacer');
    }
    await page.click('body');
  });

  test('Pick previous calendar month date', async ({ page }) => {
    await verifyCardVisible(page, 'typed-date-input');

    // Open the datepicker
    await page.getByPlaceholder('DD-MM-YYYY').click();

    await page.getByTestId('typed-prev-month').click();

    // Click the 20th day
    await page.getByRole('button', { name: '20' }).click();

    // Assert input updated
    await expect(page.getByTestId('typed-date-input')).toHaveValue('20-09-2026');

    // Assert result display updated
    await expect(page.getByTestId('typed-date-result')).toContainText('Selected: Sunday, September 20, 2026');

  })

  test('Pick next calendar month date', async ({ page }) => {
    await verifyCardVisible(page, 'typed-date-input');

    // Open the datepicker
    await page.getByPlaceholder('DD-MM-YYYY').click();

    await page.getByTestId('typed-next-month').click();

    // Click the 10th day
    await page.getByRole('button', { name: '10' }).click();

    // Assert input updated
    await expect(page.getByTestId('typed-date-input')).toHaveValue('10-11-2026');

    // Assert result display updated
    await expect(page.getByTestId('typed-date-result')).toContainText('Selected: Tuesday, November 10, 2026');
  })
})


test.describe('Month / Year Picker Date', () => {

  test('Select todays date', async ({ page }) => {
    await verifyCardVisible(page, 'monthyear-card');

    //    await page.getByTestId('month-year-input').click();

    await page.getByPlaceholder('Select month/year').click();
    await page.getByTestId('month-year-today').click();

    const today: Date = new Date();

    const formattedDate: string = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    await expect(page.getByTestId('month-year-result')).toContainText(`Selected: ${formattedDate}`);
  })

  test('Click on Reset', async ({ page }) => {
    await verifyCardVisible(page, 'monthyear-card');

    //    await page.getByTestId('month-year-input').click();

    await page.getByPlaceholder('Select month/year').click();
    await page.getByTestId('month-year-today').click();

    await page.getByPlaceholder('Select month/year').click();
    await page.getByTestId('month-year-clear').click();


    //await page.click('body');

    // ✅ Assert input is empty
    await expect(page.getByTestId('month-year-input')).toHaveValue('');

    // ✅ Assert result display is empty
    await expect(page.getByTestId('month-year-result')).toHaveText('');
  });

  test('Pick calendar current month date', async ({ page }) => {
    await verifyCardVisible(page, 'monthyear-card');

    //    await page.getByTestId('month-year-input').click();

    await page.getByPlaceholder('Select month/year').click();

    // Click the 20th day
    await page.getByRole('button', { name: '20' }).click();

    // ✅ Assert input is empty
    await expect(page.getByTestId('month-year-input')).toHaveValue('20-10-2026');

    // ✅ Assert result display is empty
    await expect(page.getByTestId('month-year-result')).toHaveText('Selected: Tuesday, October 20, 2026');
  });

  test('assert other-month days are inactive in Oct 2026 month view', async ({ page }) => {
    await verifyCardVisible(page, 'monthyear-card');

    // Open the datepicker
    await page.getByTestId('month-year-input').click();

    // Locate all "other-month" days
    const otherMonthDays = page.locator('#monthYearCal .dp-day.calendar-spacer');

    /*
    // Scoped to month-year-calendar only
    const otherMonthDays = page.locator('#monthYearCal .dp-day.calendar-spacer');
    
    // or using data-testid
    const otherMonthDays = page.getByTestId('month-year-calendar').locator('.dp-day.calendar-spacer');
    
    */

    // Assert count (should be 4 in October 2026 view)
    await expect(otherMonthDays).toHaveCount(4);

    // Assert each has the "other-month" class
    await expect(otherMonthDays.nth(0)).toHaveClass(/calendar-spacer/);
    await expect(otherMonthDays.nth(1)).toHaveClass(/calendar-spacer/);
    await expect(otherMonthDays.nth(2)).toHaveClass(/calendar-spacer/);
    await expect(otherMonthDays.nth(3)).toHaveClass(/calendar-spacer/);

    // Assert each one has only "dp-day calendar-spacer" class (no "selected")
    for (let i = 0; i < await otherMonthDays.count(); i++) {
      const day = otherMonthDays.nth(i);
      const className = await day.getAttribute('class');
      expect(className).toBe('dp-day calendar-spacer');
    }
    await page.click('body');
  });

  test('Pick Jan 2026 calendar date', async ({ page }) => {
    await verifyCardVisible(page, 'monthyear-card');

    // Open the datepicker
    //    await page.getByTestId('month-year-input').click();
    await page.getByPlaceholder('Select month/year').click();

    const selectMonth = page.getByTestId('month-year-month-select');

    await selectMonth.click();
    await selectMonth.selectOption('0');

    const selectYear = page.getByTestId('month-year-year-select');

    await selectYear.click();
    await selectYear.selectOption('2026');

    // Click the 20th day
    await page.getByRole('button', { name: '20' }).click();

    // Assert input updated
    await expect(page.getByTestId('month-year-input')).toHaveValue('20-01-2026');

    // Assert result display updated
    await expect(page.getByTestId('month-year-result')).toContainText('Selected: Tuesday, January 20, 2026');
  })

  test('Pick Dec 2030 calendar date', async ({ page }) => {
    await verifyCardVisible(page, 'monthyear-card');

    // Open the datepicker
    //    await page.getByTestId('month-year-input').click();
    await page.getByPlaceholder('Select month/year').click();

    const selectMonth = page.getByTestId('month-year-month-select');

    await selectMonth.click();
    await selectMonth.selectOption('11');

    const selectYear = page.getByTestId('month-year-year-select');

    await selectYear.click();
    await selectYear.selectOption('2030');

    // Click the 20th day
    await page.getByRole('button', { name: '31' }).click();

    // Assert input updated
    await expect(page.getByTestId('month-year-input')).toHaveValue('31-12-2030');

    // Assert result display updated
    await expect(page.getByTestId('month-year-result')).toContainText('Selected: Tuesday, December 31, 2030');
  })
})

test.describe('Date Range', () => {

  test('Start and end date empty', async ({ page }) => {
    await verifyCardVisible(page, 'daterange-card');

    const calculateDurationBtn = page.getByTestId('calc-range-btn');
    const rangeStart = page.getByTestId('range-start');
    const rangeEnd = page.getByTestId('range-end');
    const rangeResult = page.getByTestId('range-result');

    await calculateDurationBtn.click();

    // Leave start and end date empty
    await expect(rangeStart).toHaveValue('');
    await expect(rangeEnd).toHaveValue('');
    await expect(rangeResult).toContainText('Please select both dates');
  })

  test('Start date empty', async ({ page }) => {
    await verifyCardVisible(page, 'daterange-card');

    const calculateDurationBtn = page.getByTestId('calc-range-btn');
    const rangeStart = page.getByTestId('range-start');
    const rangeEnd = page.getByTestId('range-end');
    const rangeResult = page.getByTestId('range-result');

    // Fill only the end date
    await rangeEnd.fill('2026-10-01');

    await calculateDurationBtn.click();

    // Leave start date empty
    await expect(rangeStart).toHaveValue('');
    await expect(rangeEnd).toHaveValue('2026-10-01');

    await expect(rangeResult).toContainText('Please select both dates');
  })

  test('End date empty', async ({ page }) => {
    await verifyCardVisible(page, 'daterange-card');

    const calculateDurationBtn = page.getByTestId('calc-range-btn');
    const rangeStart = page.getByTestId('range-start');
    const rangeEnd = page.getByTestId('range-end');
    const rangeResult = page.getByTestId('range-result');

    // Fill only the start date
    await rangeStart.fill('2026-10-01');

    await calculateDurationBtn.click();

    // Leave end date empty
    await expect(rangeStart).toHaveValue('2026-10-01');
    await expect(rangeEnd).toHaveValue('');
    await expect(rangeResult).toContainText('Please select both dates');
  })

  test('End date must be after start date', async ({ page }) => {
    await verifyCardVisible(page, 'daterange-card');

    const calculateDurationBtn = page.getByTestId('calc-range-btn');
    const rangeStart = page.getByTestId('range-start');
    const rangeEnd = page.getByTestId('range-end');
    const rangeResult = page.getByTestId('range-result');

    const startDateInput = '2025-01-01';
    const endDateInput = '2020-01-01';

    await rangeStart.fill(startDateInput);
    await rangeEnd.fill(endDateInput);

    await calculateDurationBtn.click();

    // Leave end date empty
    await expect(rangeStart).toHaveValue(startDateInput);
    await expect(rangeEnd).toHaveValue(endDateInput);

    // Get values
    const startValue = await rangeStart.inputValue();
    const endValue = await rangeEnd.inputValue();

    // Convert to Date objects
    const startDate = new Date(startValue);
    const endDate = new Date(endValue);

    if (startDate > endDate) {
      await expect(rangeResult).toContainText('End date must be after start date');
    } else if (startDate <= endDate) {
      // Subtract timestamps (milliseconds)
      const diffMs = endDate.getTime() - startDate.getTime();
      // Convert to days
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      await expect(rangeResult).toContainText(`Duration: ${diffDays} day(s)`);
    }
  })

  test('End date after start date', async ({ page }) => {
    await verifyCardVisible(page, 'daterange-card');

    const calculateDurationBtn = page.getByTestId('calc-range-btn');
    const rangeStart = page.getByTestId('range-start');
    const rangeEnd = page.getByTestId('range-end');
    const rangeResult = page.getByTestId('range-result');

    const startDateInput = '2025-01-01';
    const endDateInput = '2030-01-01';

    await rangeStart.fill(startDateInput);
    await rangeEnd.fill(endDateInput);

    await calculateDurationBtn.click();

    // Leave end date empty
    await expect(rangeStart).toHaveValue(startDateInput);
    await expect(rangeEnd).toHaveValue(endDateInput);

    // Get values
    const startValue = await rangeStart.inputValue();
    const endValue = await rangeEnd.inputValue();

    // Convert to Date objects
    const startDate = new Date(startValue);
    const endDate = new Date(endValue);

    if (startDate <= endDate) {
      // Subtract timestamps (milliseconds)
      const diffMs = endDate.getTime() - startDate.getTime();
      // Convert to days
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      await expect(rangeResult).toContainText(`Duration: ${diffDays} day(s)`);
    }
    else if (startDate > endDate) {
      await expect(rangeResult).toContainText('End date must be after start date');
    }
  })
})