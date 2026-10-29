import { test as base, expect, type Page, type Locator } from '@playwright/test';

const test = base.extend({
  page: async ({ page }, use) => {
    page.on('pageerror', error => console.error('Application error:', error.message));
    // Keep external fonts, analytics and telemetry out of the local demo.
    if (!process.env.BASE_URL) {
      await page.route('**/*', route => {
        const host = new URL(route.request().url()).hostname;
        return ['127.0.0.1', 'localhost'].includes(host) ? route.continue() : route.abort();
      });
    }
    await use(page);
  },
});

async function login(page: Page) {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('inventory-list')).toBeVisible();
}

async function capture(page: Page, name: string, target?: Locator) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map(img => img.decode().catch(() => {})));
  });
  if (process.env.VISUAL_REGRESSION === '1') {
    await page.addStyleTag({ content: '.inventory_item_name { color: #c00040 !important; font-size: 28px !important; }' });
  }
  if (target) await expect(target).toHaveScreenshot(name);
  else await expect(page).toHaveScreenshot(name, { fullPage: true });
}

test('login page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('login-button')).toBeVisible();
  await capture(page, 'login.png');
});

test('login validation', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('error')).toContainText('Username is required');
  await capture(page, 'login-error.png');
});

test('inventory page', async ({ page }) => {
  await login(page);
  await expect(page.getByTestId('inventory-item')).toHaveCount(6);
  await capture(page, 'inventory.png');
});

test('product card', async ({ page }) => {
  await login(page);
  await capture(page, 'product-card.png', page.getByTestId('inventory-item').first());
});

test('product details', async ({ page }) => {
  await login(page);
  await page.getByTestId('inventory-item-name').filter({ hasText: 'Sauce Labs Backpack' }).click();
  await expect(page).toHaveURL(/inventory-item\.html/);
  await expect(page.getByTestId('back-to-products')).toBeVisible();
  await expect(page.getByTestId('inventory-item-price')).toHaveText('$29.99');
  await capture(page, 'product-details.png');
});

test('empty cart', async ({ page }) => {
  await login(page);
  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL(/cart\.html/);
  await expect(page.getByTestId('cart-list')).toBeVisible();
  await capture(page, 'cart-empty.png');
});

test('checkout journey', async ({ page }) => {
  await login(page);
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL(/cart\.html/);
  await expect(page.getByTestId('cart-list')).toBeVisible();
  await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');
  await capture(page, 'cart-filled.png');
  await page.getByTestId('checkout').click();
  await expect(page.getByTestId('checkout-info-container')).toBeVisible();
  await capture(page, 'checkout-info.png');
  await page.getByTestId('continue').click();
  await expect(page.getByTestId('error')).toContainText('First Name is required');
  await capture(page, 'checkout-validation.png');
  await page.getByTestId('firstName').fill('Visual');
  await page.getByTestId('lastName').fill('Tester');
  await page.getByTestId('postalCode').fill('12345');
  await page.getByTestId('continue').click();
  await expect(page.getByTestId('total-label')).toContainText('32.39');
  await capture(page, 'checkout-summary.png');
  await page.getByTestId('finish').click();
  await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
  await capture(page, 'checkout-complete.png');
});
