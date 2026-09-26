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

test('Add same product again', async ({ page }) => {

    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty
    const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
    await expect(cartEmptyMsg).toHaveText('Your cart is empty.');

    // 2️⃣ Add product/s
    const products = [
        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
    ];

    const updatedProducts = products.map(p => {
        const priceValue = Number(p.price.replace(/[^\d]/g, ''));
        return {
            ...p,
            priceValue
        };
    });

    for (const p of updatedProducts) {
        await page.getByTestId(p.add).click();
    }

    await verifyCardVisible(page, 'shop-cart-panel');

    // // 3️⃣ Verify product/s added to cart
    // const cartCount = page.getByTestId('shop-cart-count');
    // await expect(cartCount).toHaveText('4');

    // 4️⃣ Verify price from items are showing correct in cart
    const cartItems = page.getByTestId('shop-cart-items').locator('.shop-cart-item');
    await expect(cartItems).toHaveCount(updatedProducts.length);

    for (let i = 0; i < updatedProducts.length; i++) {
        const item = cartItems.nth(i);
        await expect(item).toContainText(updatedProducts[i].price);
    }

    // 6️⃣ Check subtotal and total
    const subtotal = page.getByTestId('shop-subtotal');
    const total = page.getByTestId('shop-total');

    // Expected subtotal = sum of all product prices
    const expectedSubtotal = updatedProducts.reduce((sum, p) => sum + p.priceValue, 0); // numeric values
    const formattedSubtotal = `₹${expectedSubtotal.toLocaleString('en-IN')}`;
    const formattedFinalTotal = `₹${expectedSubtotal.toLocaleString('en-IN')}`; // no discount

    await expect(subtotal).toHaveText(formattedSubtotal);
    await expect(total).toHaveText(formattedFinalTotal);
});

test('Check for Invalid coupon code 1.', async ({ page }) => {
    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty

    await test.step('Check Shopping Cart is empty', async () => {
        const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
        await expect(cartEmptyMsg).toHaveText('Your cart is empty.');
    });

    const products = [
        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
    ];

    // 2️⃣ Add 1 product

    await test.step('Add 1 product', async () => {
        for (const p of products) {
            await page.getByTestId(p.add).click();
        }
    });

    await verifyCardVisible(page, 'shop-cart-panel');

    // 3️⃣ Verify 1 product added to cart

    await test.step('Verify 1 product added to cart', async () => {
        const cartCount = page.getByTestId('shop-cart-count');
        await expect(cartCount).toHaveText('1');
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

        const coupon = 'FLAT10000';
        const couponErrorMsg = 'Invalid coupon code.';
        const couponInput = page.getByTestId('shop-coupon-input');
        const applyCoupon = page.getByTestId('shop-apply-coupon');
        const couponMessage = page.getByTestId('shop-coupon-msg');

        await couponInput.click();
        await couponInput.fill(coupon);
        await applyCoupon.click();
        await expect(couponMessage).toContainText(couponErrorMsg);
    });
});

test('Check for Invalid coupon code 2.', async ({ page }) => {
    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty

    await test.step('Check Shopping Cart is empty', async () => {
        const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
        await expect(cartEmptyMsg).toHaveText('Your cart is empty.');
    });

    const products = [
        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
    ];

    // 2️⃣ Add 1 product

    await test.step('Add 1 product', async () => {
        for (const p of products) {
            await page.getByTestId(p.add).click();
        }
    });

    await verifyCardVisible(page, 'shop-cart-panel');

    // 3️⃣ Verify 1 product added to cart

    await test.step('Verify 1 product added to cart', async () => {
        const cartCount = page.getByTestId('shop-cart-count');
        await expect(cartCount).toHaveText('1');
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

        const coupon = '';
        const couponErrorMsg = 'Invalid coupon code.';
        const couponInput = page.getByTestId('shop-coupon-input');
        const applyCoupon = page.getByTestId('shop-apply-coupon');
        const couponMessage = page.getByTestId('shop-coupon-msg');

        await couponInput.click();
        await couponInput.fill(coupon);
        await applyCoupon.click();
        await expect(couponMessage).toContainText(couponErrorMsg);
    });
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

test('Discount option should be hidden on empty cart', async ({ page }) => {
    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty
    const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
    await expect(cartEmptyMsg).toHaveText('Your cart is empty.');

    await verifyCardVisible(page, 'shop-cart-panel');

    // 2️⃣ Discount option should be disable.    
    const couponInput = page.getByTestId('shop-coupon-input');
    const applyCoupon = page.getByTestId('shop-apply-coupon');
    const couponMessage = page.getByTestId('shop-coupon-msg');

    await expect(couponInput).toBeHidden();
    await expect(applyCoupon).toBeHidden();
    await expect(couponMessage).toBeHidden();
});


test('Check visibility of Discount option when items in cart 1', async ({ page }) => {
    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty
    const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
    await expect(cartEmptyMsg).toHaveText('Your cart is empty.');

    //   { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },

    // 2️⃣ Add product

    await page.getByTestId('add-cart-lamborghini').click();

    await verifyCardVisible(page, 'shop-cart-panel');

    // 2️⃣ Discount option should be enable.    
    const couponInput = page.getByTestId('shop-coupon-input');
    const applyCoupon = page.getByTestId('shop-apply-coupon');
    const couponMessage = page.getByTestId('shop-coupon-msg');

    await expect(couponInput).not.toBeHidden();
    await expect(applyCoupon).not.toBeHidden();
    await expect(couponMessage).not.toBeHidden();
});

test('Check visibility of Discount option when items in cart 2', async ({ page }) => {
    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty
    const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
    await expect(cartEmptyMsg).toHaveText('Your cart is empty.');

    //   { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },

    // 2️⃣ Add product

    await page.getByTestId('add-cart-lamborghini').click();

    await verifyCardVisible(page, 'shop-cart-panel');

    // 2️⃣ Discount option should be enable.
    const couponInput = page.getByTestId('shop-coupon-input');
    const applyCoupon = page.getByTestId('shop-apply-coupon');
    const couponMessage = page.getByTestId('shop-coupon-msg');

    await expect(couponInput).toBeEnabled();
    await expect(applyCoupon).toBeEnabled();
    await expect(couponMessage).toBeEnabled();
});

test('Verifing FLAT10 — 10% off on orders above ₹50,000', async ({ page }) => {

    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty
    const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
    await expect(cartEmptyMsg).toHaveText('Your cart is empty.');

    // 2️⃣ Add product/s
    const products = [
        //        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
        //        { add: 'add-cart-triumph', price: '₹16,95,000' },
        { add: 'add-cart-seiko', price: '₹32,500' },
        { add: 'add-cart-yacht', price: '₹1,85,00,000' },
    ];

    const updatedProducts = products.map(p => ({
        ...p,
        priceValue: Number(p.price.replace(/[₹,]/g, '')) // new numeric field
    }));

    for (const p of updatedProducts) {
        await page.getByTestId(p.add).click();
    }

    await verifyCardVisible(page, 'shop-cart-panel');

    // // 3️⃣ Verify product/s added to cart
    // const cartCount = page.getByTestId('shop-cart-count');
    // await expect(cartCount).toHaveText('1');

    // 4️⃣ Verify price from items are showing correct in cart
    for (const p of updatedProducts) {
        const itemRow = page.getByTestId('shop-cart-items').getByText(p.price);
        await expect(itemRow).toBeVisible();
    }

    // 5️⃣ FLAT10 — 10% off on orders above ₹50,000

    const coupon = 'FLAT10';
    const couponValidationMsg = 'Minimum order of ₹50,000 required.';
    const couponSuccessMsg = 'Coupon "FLAT10" applied! 10% off';
    const couponInput = page.getByTestId('shop-coupon-input');
    const applyCoupon = page.getByTestId('shop-apply-coupon');
    const couponMessage = page.getByTestId('shop-coupon-msg');

    await couponInput.click();
    await couponInput.fill(coupon);
    await applyCoupon.click();

    // 6️⃣ Check subtotal, discount and total
    const subtotal = page.getByTestId('shop-subtotal');
    const shopDiscount = page.getByTestId('shop-discount');
    const total = page.getByTestId('shop-total');

    // Expected subtotal = sum of all product prices
    const expectedSubtotal = updatedProducts.reduce((sum, p) => sum + p.priceValue, 0); // numeric values
    const formattedSubtotal = `₹${expectedSubtotal.toLocaleString('en-IN')}`;

    if (expectedSubtotal > 50000) {
        await expect(couponMessage).toContainText(couponSuccessMsg);
        const tenPercentDiscount = (expectedSubtotal) * 0.1;
        const finalTotal = expectedSubtotal - tenPercentDiscount;
        const formattedfinaltotal = `₹${finalTotal.toLocaleString('en-IN')}`;
        const formattedDiscounttotal = `-₹${tenPercentDiscount.toLocaleString('en-IN')}`;
        await expect(subtotal).toHaveText(formattedSubtotal);
        await expect(shopDiscount).toHaveText(formattedDiscounttotal);
        await expect(total).toHaveText(formattedfinaltotal);
    }
    else if (expectedSubtotal < 50000) {
        await expect(couponMessage).toContainText(couponValidationMsg);
        const formattedfinaltotal = `₹${expectedSubtotal.toLocaleString('en-IN')}`;
        await expect(subtotal).toHaveText(formattedSubtotal);
        await expect(total).toHaveText(formattedfinaltotal);
    }
});

test('Verifing SPEED20 — 20% off on automobiles', async ({ page }) => {

    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty
    const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
    await expect(cartEmptyMsg).toHaveText('Your cart is empty.');

    // 2️⃣ Add product/s
    const products = [
        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
        { add: 'add-cart-triumph', price: '₹16,95,000' },
        { add: 'add-cart-seiko', price: '₹32,500' },
        { add: 'add-cart-yacht', price: '₹1,85,00,000' },
    ];

    // Product	Amount	Discount	Amt after discount
    // Lamborghini Huracan	32100000	6420000	25680000
    // Triumph Speed Triple 1200	1695000	339000	1356000
    // Seiko Presage Cocktail Time	32500		32500
    // Oceanis Luxury Yacht	18500000		18500000
    // 	52327500	6759000	45568500


    const updatedProducts = products.map(p => {
        const priceValue = Number(p.price.replace(/[^\d]/g, ''));
        let discountedPrice = 0;

        let label = 'Other'; // default
        if (p.add.includes('lamborghini') || p.add.includes('triumph')) {
            label = 'Automobile';
            discountedPrice = 0.2 * priceValue;
        } else if (p.add.includes('seiko')) {
            label = 'Watch';
            discountedPrice = 0 * priceValue;
        } else if (p.add.includes('yacht')) {
            label = 'Luxury Yacht';
            discountedPrice = 0 * priceValue;
        }

        return {
            ...p,
            priceValue,
            label,
            discountedPrice
        };
    });

    for (const p of updatedProducts) {
        await page.getByTestId(p.add).click();
    }

    await verifyCardVisible(page, 'shop-cart-panel');

    // 3️⃣ Verify product/s added to cart
    const cartCount = page.getByTestId('shop-cart-count');
    await expect(cartCount).toHaveText('4');

    // 4️⃣ Verify price from items are showing correct in cart
    for (const p of updatedProducts) {
        const itemRow = page.getByTestId('shop-cart-items').getByText(p.price);
        await expect(itemRow).toBeVisible();
    }

    // 5️⃣  SPEED20 — 20% off on automobiles

    const coupon = 'SPEED20';
    const couponSuccessMsg = 'Coupon "SPEED20" applied! 20% off automobiles';
    const couponInput = page.getByTestId('shop-coupon-input');
    const applyCoupon = page.getByTestId('shop-apply-coupon');
    const couponMessage = page.getByTestId('shop-coupon-msg');

    await couponInput.click();
    await couponInput.fill(coupon);
    await applyCoupon.click();

    // 6️⃣ Check subtotal, discount and total
    const subtotal = page.getByTestId('shop-subtotal');
    const shopDiscount = page.getByTestId('shop-discount');
    const total = page.getByTestId('shop-total');

    // Expected subtotal = sum of all product prices
    const expectedSubtotal = updatedProducts.reduce((sum, p) => sum + p.priceValue, 0); // numeric values
    const formattedSubtotal = `₹${expectedSubtotal.toLocaleString('en-IN')}`;

    const discounttotal = updatedProducts.reduce((sum, p) => sum + p.discountedPrice, 0); // numeric values
    const formattedDiscounttotal = `-₹${discounttotal.toLocaleString('en-IN')}`;

    const finalTotal = expectedSubtotal - discounttotal;
    const formattedFinalTotal = `₹${finalTotal.toLocaleString('en-IN')}`;

    await expect(couponMessage).toContainText(couponSuccessMsg);
    await expect(subtotal).toHaveText(formattedSubtotal);
    await expect(shopDiscount).toHaveText(formattedDiscounttotal);
    await expect(total).toHaveText(formattedFinalTotal);
});

test('FIRST500 — ₹500 off on your first order', async ({ page }) => {

    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty
    const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
    await expect(cartEmptyMsg).toHaveText('Your cart is empty.');

    // 2️⃣ Add product/s
    const products = [
        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
        { add: 'add-cart-triumph', price: '₹16,95,000' },
        { add: 'add-cart-seiko', price: '₹32,500' },
        { add: 'add-cart-yacht', price: '₹1,85,00,000' },
    ];

    const updatedProducts = products.map(p => {
        const priceValue = Number(p.price.replace(/[^\d]/g, ''));
        return {
            ...p,
            priceValue
        };
    });

    for (const p of updatedProducts) {
        await page.getByTestId(p.add).click();
    }

    await verifyCardVisible(page, 'shop-cart-panel');

    // // 3️⃣ Verify product/s added to cart
    // const cartCount = page.getByTestId('shop-cart-count');
    // await expect(cartCount).toHaveText('4');

    // 4️⃣ Verify price from items are showing correct in cart
    for (const p of updatedProducts) {
        const itemRow = page.getByTestId('shop-cart-items').getByText(p.price);
        await expect(itemRow).toBeVisible();
    }

    // 5️⃣  FIRST500 — ₹500 off on your first order

    const coupon = 'FIRST500';
    const couponSuccessMsg = 'Coupon "FIRST500" applied! ₹500 off';
    const couponInput = page.getByTestId('shop-coupon-input');
    const applyCoupon = page.getByTestId('shop-apply-coupon');
    const couponMessage = page.getByTestId('shop-coupon-msg');

    await couponInput.click();
    await couponInput.fill(coupon);
    await applyCoupon.click();

    // 6️⃣ Check subtotal, discount and total
    const subtotal = page.getByTestId('shop-subtotal');
    const shopDiscount = page.getByTestId('shop-discount');
    const total = page.getByTestId('shop-total');

    // Expected subtotal = sum of all product prices
    const expectedSubtotal = updatedProducts.reduce((sum, p) => sum + p.priceValue, 0); // numeric values
    const formattedSubtotal = `₹${expectedSubtotal.toLocaleString('en-IN')}`;

    const discounttotal = 500 // numeric values
    const formattedDiscounttotal = `-₹${discounttotal.toLocaleString('en-IN')}`;

    const finalTotal = expectedSubtotal - discounttotal;
    const formattedFinalTotal = `₹${finalTotal.toLocaleString('en-IN')}`;

    await expect(couponMessage).toContainText(couponSuccessMsg);
    await expect(subtotal).toHaveText(formattedSubtotal);
    await expect(shopDiscount).toHaveText(formattedDiscounttotal);
    await expect(total).toHaveText(formattedFinalTotal);
});

test('Purchase Product without discount and payment by Credit / Debit Card', async ({ page }) => {

    await verifyCardVisible(page, 'shop-products');

    // 1️⃣ Check Shopping Cart is empty
    const cartEmptyMsg = page.getByTestId('shop-cart-items').locator('#shopCartEmpty');
    await expect(cartEmptyMsg).toHaveText('Your cart is empty.');

    // 2️⃣ Add product/s
    const products = [
        //        { add: 'add-cart-lamborghini', price: '₹3,21,00,000' },
        //        { add: 'add-cart-triumph', price: '₹16,95,000' },
        { add: 'add-cart-seiko', price: '₹32,500' },
        //        { add: 'add-cart-yacht', price: '₹1,85,00,000' },
    ];

    const updatedProducts = products.map(p => {
        const priceValue = Number(p.price.replace(/[^\d]/g, ''));
        return {
            ...p,
            priceValue
        };
    });

    for (const p of updatedProducts) {
        await page.getByTestId(p.add).click();
    }

    await verifyCardVisible(page, 'shop-cart-panel');

    // // 3️⃣ Verify product/s added to cart
    // const cartCount = page.getByTestId('shop-cart-count');
    // await expect(cartCount).toHaveText('4');

    // 4️⃣ Verify price from items are showing correct in cart
    for (const p of updatedProducts) {
        const itemRow = page.getByTestId('shop-cart-items').getByText(p.price);
        await expect(itemRow).toBeVisible();
    }

    // 6️⃣ Check subtotal and total
    const subtotal = page.getByTestId('shop-subtotal');
    const total = page.getByTestId('shop-total');

    // Expected subtotal = sum of all product prices
    const expectedSubtotal = updatedProducts.reduce((sum, p) => sum + p.priceValue, 0); // numeric values
    const formattedSubtotal = `₹${expectedSubtotal.toLocaleString('en-IN')}`;
    const formattedFinalTotal = `₹${expectedSubtotal.toLocaleString('en-IN')}`;

    await expect(subtotal).toHaveText(formattedSubtotal);
    await expect(total).toHaveText(formattedFinalTotal);

    // 7️⃣ Proceed to checkout.
    const checkOutBtn = page.getByTestId('shop-checkout-btn');
    await checkOutBtn.click();

    // 8️⃣ Verify checkout modal is visible
    const checkoutModal = page.getByTestId('shop-checkout-modal');
    await expect(checkoutModal).toBeVisible();

    // 9️⃣ Fill address step
    await page.getByTestId('shop-fullname').fill('Amit Patel');
    await page.getByTestId('shop-address').fill('59 Maiden Lane, New York, NY');
    await page.getByTestId('shop-city').fill('New York');
    await page.getByTestId('shop-pincode').fill('10038');
    await page.getByTestId('shop-phone').fill('+1 212-212-0000');

    // 🔟 Continue to payment

    const paymentBtn = page.getByTestId('shop-to-payment');
    await expect(paymentBtn).toBeVisible();
    await paymentBtn.click();

    // 1️⃣1️⃣ Fill card details
    await page.getByTestId('shop-card-number').fill('4111111111111111');
    await page.getByTestId('shop-card-expiry').fill('12/30');
    await page.getByTestId('shop-card-cvv').fill('123');

    // 1️⃣2️⃣ Place order

    const orderBtn = page.getByTestId('shop-place-order');
    await expect(orderBtn).toBeVisible();
    await orderBtn.click();

    // 1️⃣3️⃣ Verify confirmation step
    const confirmationStep = page.getByTestId('shop-step-confirmation');
    await expect(confirmationStep).toBeVisible();
    await expect(confirmationStep).toContainText('Order Placed Successfully!');

    // 1️⃣4️⃣ Verify order ID is shown
    const shopOrderId = page.getByTestId('shop-order-id');
    await expect(shopOrderId).toContainText('Order ID:');

    const orderIdText = await shopOrderId.textContent();
    if (!orderIdText) {
        throw new Error('Order ID text not found');
    }
    const orderId = orderIdText.replace('Order ID:', '').trim();

    // 1️⃣5️⃣ Continue shopping button

    const continueShoppingBtn = page.getByTestId('shop-continue-shopping');
    await expect(continueShoppingBtn).toBeVisible();
    await continueShoppingBtn.click();
});