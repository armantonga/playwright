import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';

const EMAIL = 'armantesting0@gmail.com';
const PASSWORD = '!Acorn321';

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(EMAIL, PASSWORD);
});

test('add item to cart', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await productsPage.navigateProducts();
    await productsPage.assertOnProductsPage();
    await productsPage.searchProduct('Blue Top');
    await productsPage.addToCart('1');
    await productsPage.assertAddedItemtoCart();
    await productsPage.continueShopping();
    await cartPage.navigateCart();
    await cartPage.removeItemFromCart('1');        
    await cartPage.assertCartEmpty(); 

});

test('check item in cart', async ({ page }) => {
    const cartPage = new CartPage(page);
    const productsPage = new ProductsPage(page);

    await productsPage.navigateProducts();
    await productsPage.assertOnProductsPage();
    await productsPage.searchProduct('Blue Top');
    await productsPage.addToCart('1');
    await productsPage.assertAddedItemtoCart();
    await productsPage.continueShopping();
    await cartPage.navigateCart();
    await cartPage.assertOnCartPage();
    await cartPage.assertCartItem('Blue Top', '1');
    await cartPage.removeItemFromCart('1');        
    await cartPage.assertCartEmpty(); 

});
