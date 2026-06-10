import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CategoryPage } from '../pages/CategoryPage';

const EMAIL = 'armantesting0@gmail.com';
const PASSWORD = '!Acorn321';
let productsPage!: ProductsPage;
let categoryPage!: CategoryPage;

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);

  productsPage = new ProductsPage(page);
  categoryPage = new CategoryPage(page);

  await loginPage.goto();
  await loginPage.login(EMAIL, PASSWORD);
});

test ('Verify women category', async ({ page }) => {
   
    await productsPage.navigateProducts();
    await categoryPage.assertCategories();
    await categoryPage.clickWomenCategory();
    await categoryPage.clickDressCategory();
    await expect(page.locator('.features_items'))
          .toBeVisible();
    await expect(page.locator('.features_items'))
          .toContainText('Women - Dress Products');
    await categoryPage.assertDressProduct();
});

test ('Verify brands qty ', async ({page}) => {
  
  //Polo
  await productsPage.navigateProducts();
  await page.locator('a[href="/brand_products/Polo"]').click();
  await expect(page.locator('.features_items')).toBeVisible();
  await expect(page.locator('.features_items'))
          .toContainText('Brand - Polo Products');
  await expect(page.locator('.features_items .col-sm-4')).toHaveCount(6);

  //Biba
  await productsPage.navigateProducts();
  await page.locator('a[href="/brand_products/Biba"]').click();
  await expect(page.locator('.features_items')).toBeVisible();
  await expect(page.locator('.features_items'))
          .toContainText('Brand - Biba Products');
  await expect(page.locator('.features_items .col-sm-4')).toHaveCount(5);

});