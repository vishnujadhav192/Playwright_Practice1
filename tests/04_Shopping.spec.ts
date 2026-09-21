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

test('Click on Menu Shopping option', async ({ page }) => {
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-shopping').click();

    await page.mouse.move(0, 0);

    // Assert the dropdown closes after selecting an item
    await expect(page.getByTestId('dropdown-menu')).toBeHidden();

    // By id
    await expect(page.locator('#shoppingHeader')).toContainText('Shopping');

    // By role (more robust, recommended)
    await expect(page.getByRole('heading', { name: 'Shopping', exact: true })).toBeVisible();

    // Also check the section is visible (has the 'visible' class)
    await expect(page.locator('#shoppingHeader')).toHaveClass(/visible/);
})

test('Shopping items buttons are visible and enabled', async ({ page }) => {
    await verifyCardVisible(page, 'shop-products');
    // Example: Lamborghini product
    const productLamborghini = page.getByTestId('product-lamborghini');

    await productLamborghini.highlight();

    const addCartBtnLamborghini = page.getByTestId('add-cart-lamborghini');
    const buyNowBtnpLamborghini = page.getByTestId('buy-now-lamborghini');

    // Assert visibility
    await expect(addCartBtnLamborghini).toBeVisible();
    await expect(buyNowBtnpLamborghini).toBeVisible();

    // Assert enabled state
    await expect(addCartBtnLamborghini).toBeEnabled();
    await expect(buyNowBtnpLamborghini).toBeEnabled();

    // Example: Triumph Speed Triple 1200
    const triumphSpeedTriple1200 = page.getByTestId('product-triumph');

    await triumphSpeedTriple1200.highlight();

    const addCartBtntriumphSpeedTriple1200 = page.getByTestId('add-cart-triumph');
    const buyNowBtntriumphSpeedTriple1200 = page.getByTestId('buy-now-triumph');

    // Assert visibility
    await expect(addCartBtntriumphSpeedTriple1200).toBeVisible();
    await expect(buyNowBtntriumphSpeedTriple1200).toBeVisible();

    // Assert enabled state
    await expect(addCartBtntriumphSpeedTriple1200).toBeEnabled();
    await expect(buyNowBtntriumphSpeedTriple1200).toBeEnabled();

    // Example: Seiko Presage Cocktail Time
    const productSeiko = page.getByTestId('product-seiko');

    await productSeiko.highlight();

    const addCartBtnSeiko = page.getByTestId('add-cart-seiko');
    const buyNowBtnSeiko = page.getByTestId('buy-now-seiko');

    // Assert visibility
    await expect(addCartBtnSeiko).toBeVisible();
    await expect(buyNowBtnSeiko).toBeVisible();

    // Assert enabled state
    await expect(addCartBtnSeiko).toBeEnabled();
    await expect(buyNowBtnSeiko).toBeEnabled();

    // Example: Oceanis Luxury Yacht
    const oceanisLuxuryYacht = page.getByTestId('product-yacht');

    await oceanisLuxuryYacht.highlight();

    const addCartBtnoceanisLuxuryYacht = page.getByTestId('add-cart-yacht');
    const buyNowBtnoceanisLuxuryYacht = page.getByTestId('buy-now-yacht');

    // Assert visibility
    await expect(addCartBtnoceanisLuxuryYacht).toBeVisible();
    await expect(buyNowBtnoceanisLuxuryYacht).toBeVisible();

    // Assert enabled state
    await expect(addCartBtnoceanisLuxuryYacht).toBeEnabled();
    await expect(buyNowBtnoceanisLuxuryYacht).toBeEnabled();
});

test('Verify Product details', async ({ page }) => {
    await verifyCardVisible(page, 'shop-products');

    const lamborghiniCard = page.getByTestId('product-lamborghini');

    // Assert product title
    await expect(lamborghiniCard.locator('.shop-card-title')).toHaveText('Lamborghini Huracan');

    // Assert product description
    await expect(lamborghiniCard.locator('.shop-card-desc')).toHaveText('V10 engine, 630 HP, 0-100 in 2.9s');

    // Assert product price
    await expect(lamborghiniCard.locator('.shop-card-price')).toHaveText('₹3,21,00,000');

    const triumphCard = page.getByTestId('product-triumph');

    // Assert product title
    await expect(triumphCard.locator('.shop-card-title')).toHaveText('Triumph Speed Triple 1200');

    // Assert product description
    await expect(triumphCard.locator('.shop-card-desc')).toHaveText('1160cc triple engine, 180 HP, Ohlins suspension');

    // Assert product price
    await expect(triumphCard.locator('.shop-card-price')).toHaveText('₹16,95,000');

    const seikoCard = page.getByTestId('product-seiko');

    // Assert product title
    await expect(seikoCard.locator('.shop-card-title')).toHaveText('Seiko Presage Cocktail Time');

    // Assert product description
    await expect(seikoCard.locator('.shop-card-desc')).toHaveText('Automatic movement, sapphire crystal, 50m WR');

    // Assert product price
    await expect(seikoCard.locator('.shop-card-price')).toHaveText('₹32,500');

    const yachtCard = page.getByTestId('product-yacht');

    // Assert product title
    await expect(yachtCard.locator('.shop-card-title')).toHaveText('Oceanis Luxury Yacht');

    // Assert product description
    await expect(yachtCard.locator('.shop-card-desc')).toHaveText('Spacious deck, premium cabin, and smooth coastal cruising');

    // Assert product price
    await expect(yachtCard.locator('.shop-card-price')).toHaveText('₹1,85,00,000');
})

test('Add 2 products to card and check total amount', async ({ page }) => {
    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty
    const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
    await expect(cartEmptyMsg).toHaveText('Your cart is empty.');

    // 2️⃣ Add all 2 products
    const products = [
        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
        { add: 'add-cart-triumph', price: '₹16,95,000' },
    ];

    for (const p of products) {
        await page.getByTestId(p.add).click();
    }

    await verifyCardVisible(page, 'shop-cart-panel');

    // 3️⃣ Verify 2 products added to cart
    const cartCount = page.getByTestId('shop-cart-count');
    await expect(cartCount).toHaveText('2');

    // 4️⃣ Verify price from items are showing correct in cart
    for (const p of products) {
        const itemRow = page.getByTestId('shop-cart-items').getByText(p.price);
        await expect(itemRow).toBeVisible();
    }

    // 5️⃣ Check subtotal and total
    const subtotal = page.getByTestId('shop-subtotal');
    const total = page.getByTestId('shop-total');

    // Expected subtotal = sum of all product prices
    const expectedSubtotal = 32100000 + 1695000; // numeric values
    const formattedSubtotal = `₹${expectedSubtotal.toLocaleString('en-IN')}`;

    await expect(subtotal).toHaveText(formattedSubtotal);
    await expect(total).toHaveText(formattedSubtotal); // no discount applied yet
});

test('Add 4 products to card and check total amount', async ({ page }) => {
    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty
    const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
    await expect(cartEmptyMsg).toHaveText('Your cart is empty.');

    // 2️⃣ Add all 4 products
    const products = [
        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
        { add: 'add-cart-triumph', price: '₹16,95,000' },
        { add: 'add-cart-seiko', price: '₹32,500' },
        { add: 'add-cart-yacht', price: '₹1,85,00,000' },
    ];

    for (const p of products) {
        await page.getByTestId(p.add).click();
    }

    await verifyCardVisible(page, 'shop-cart-panel');

    // 3️⃣ Verify all 4 products added to cart
    const cartCount = page.getByTestId('shop-cart-count');
    await expect(cartCount).toHaveText('4');

    // 4️⃣ Verify price from items are showing correct in cart
    for (const p of products) {
        const itemRow = page.getByTestId('shop-cart-items').getByText(p.price);
        await expect(itemRow).toBeVisible();
    }

    // 5️⃣ Check subtotal and total
    const subtotal = page.getByTestId('shop-subtotal');
    const total = page.getByTestId('shop-total');

    // Expected subtotal = sum of all product prices
    const expectedSubtotal = 32100000 + 1695000 + 32500 + 18500000; // numeric values
    const formattedSubtotal = `₹${expectedSubtotal.toLocaleString('en-IN')}`;

    await expect(subtotal).toHaveText(formattedSubtotal);
    await expect(total).toHaveText(formattedSubtotal); // no discount applied yet
});

test('Add 2 products to card , remove one of product and check total amount', async ({ page }) => {
    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty
    const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
    await expect(cartEmptyMsg).toHaveText('Your cart is empty.');

    // 2️⃣ Add all 2 products
    const productsBefore = [
        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
        { add: 'add-cart-triumph', price: '₹16,95,000' },
    ];

    for (const p of productsBefore) {
        await page.getByTestId(p.add).click();
    }

    //remove Triumph Speed Triple 1200

    const removeTriumphProduct = page.getByTestId('remove-triumph');

    removeTriumphProduct.click();

    await verifyCardVisible(page, 'shop-cart-panel');

    // 3️⃣ Verify remaining 1 product in cart
    const cartCount = page.getByTestId('shop-cart-count');
    await expect(cartCount).toHaveText('1');


    const productsAfter = [
        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
    ];


    // 4️⃣ Verify price from items are showing correct in cart
    for (const p of productsAfter) {
        const itemRow = page.getByTestId('shop-cart-items').getByText(p.price);
        await expect(itemRow).toBeVisible();
    }

    // 5️⃣ Check subtotal and total
    const subtotal = page.getByTestId('shop-subtotal');
    const total = page.getByTestId('shop-total');

    // Expected subtotal = sum of all product prices
    const expectedSubtotal = 32100000; // numeric values
    const formattedSubtotal = `₹${expectedSubtotal.toLocaleString('en-IN')}`;

    await expect(subtotal).toHaveText(formattedSubtotal);
    await expect(total).toHaveText(formattedSubtotal); // no discount applied yet
});

test('Add 2 products to card, apply discount and check total amount', async ({ page }) => {
    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty

    await test.step('Check Shopping Cart is empty', async () => {
        const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
        await expect(cartEmptyMsg).toHaveText('Your cart is empty.');
    });

    const products = [
        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
        { add: 'add-cart-seiko', price: '₹32,500' },
    ];

    // 2️⃣ Add all 2 products

    await test.step('Add all 2 products', async () => {
        for (const p of products) {
            await page.getByTestId(p.add).click();
        }
    });

    await verifyCardVisible(page, 'shop-cart-panel');

    // 3️⃣ Verify 2 products added to cart

    await test.step('Verify 2 products added to cart', async () => {
        const cartCount = page.getByTestId('shop-cart-count');
        await expect(cartCount).toHaveText('2');
    });

    // 4️⃣ Verify price from items are showing correct in cart

    await test.step('Verify price from items are showing correct in cart', async () => {
        for (const p of products) {
            const itemRow = page.getByTestId('shop-cart-items').getByText(p.price);
            await expect(itemRow).toBeVisible();
        }
    });

    // 5️⃣ Apply discount and verify

    await test.step('Apply discount and verify', async () => {

        const coupon = 'FLAT10';
        const couponInput = page.getByTestId('shop-coupon-input');
        const applyCoupon = page.getByTestId('shop-apply-coupon');
        const couponMessage = page.getByTestId('shop-coupon-msg');

        await couponInput.click();
        await couponInput.fill(coupon);
        await applyCoupon.click();
        await expect(couponMessage).toContainText(coupon);
    });
    // 6️⃣ Check subtotal , apply discount and calculate final total

    await test.step('Check subtotal and total', async () => {

        const subtotal = page.getByTestId('shop-subtotal');
        const total = page.getByTestId('shop-total');

        // Expected subtotal = sum of all product prices
        const expectedSubtotal = 32100000 + 32500; // numeric values
        const formattedSubtotal = `₹${expectedSubtotal.toLocaleString('en-IN')}`;

        const tenPercentDiscount = (expectedSubtotal) * 0.1;
        const finalTotal = expectedSubtotal - tenPercentDiscount;
        const formattedfinaltotal = `₹${finalTotal.toLocaleString('en-IN')}`;

        await expect(subtotal).toHaveText(formattedSubtotal);
        await expect(total).toHaveText(formattedfinaltotal);
    });
});