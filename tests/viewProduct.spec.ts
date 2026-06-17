import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';

const EMAIL = 'armantesting0@gmail.com';
const PASSWORD = '!Acorn321';
let productsPage!: ProductsPage;

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  productsPage = new ProductsPage(page);

  await loginPage.goto();
  await loginPage.login(EMAIL, PASSWORD);
});

test ('view product @regression', async ({page}) => {

    await productsPage.navigateProducts();
    await productsPage.clickViewProduct('Men Tshirt');
    await productsPage.assertProduct();

})