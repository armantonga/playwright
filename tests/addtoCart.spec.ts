import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';

let productsPage!: ProductsPage;
let cartPage!: CartPage;

test.beforeEach(async ({ page }) => {
  
  productsPage = new ProductsPage(page);
  cartPage = new CartPage(page);

});

test('Verify item added to the cart @regression', async ({ page }) => {

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

