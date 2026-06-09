import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CategoryPage } from '../pages/CategoryPage';

const EMAIL = 'armantesting0@gmail.com';
const PASSWORD = '!Acorn321';

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(EMAIL, PASSWORD);
});

test ('Verify women category', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const categoryPage = new CategoryPage(page);

    await productsPage.navigateProducts();
    await categoryPage.assertCategories();
});