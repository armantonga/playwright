import { Page, expect } from '@playwright/test';

export class ProductsPage {
  constructor(private page: Page) {}

  async navigateProducts() {
    await this.page.goto('/products', { waitUntil: 'domcontentloaded' });
  }

  async assertOnProductsPage() {
    await expect(this.page).toHaveURL('/products');
  }

  async searchProduct(productName: string){
    await this.page.getByPlaceholder('Search Product').fill(productName);
    await this.page.locator('#submit_search').click();
  }

 async addToCart(productId: string) {
  await this.page
    .locator(`.productinfo a.add-to-cart[data-product-id="${productId}"]`) 
    .hover();
  await this.page
    .locator(`.productinfo a.add-to-cart[data-product-id="${productId}"]`)
    .click();
}

  async assertAddedItemtoCart(){
    const cartModal = this.page.locator('#cartModal');
    await expect(cartModal).toBeVisible();
    await expect(cartModal).toContainText('Your product has been added to cart.');

  }
  async continueShopping() {
        await this.page.locator('#cartModal .btn').filter({ hasText: 'Continue Shopping' }).click();
    }

async clickViewProduct(productName: string) {
    const productCard = this.page
      .locator('.col-sm-4')
      .filter({ has: this.page.locator('p', { hasText: productName }) });

    await productCard
      .getByRole('link', { name: 'View Product' })
      .click();
  }

async assertProduct(){
  const productInfo = this.page.locator('.product-details');
  await expect(productInfo).toContainText('Men Tshirt');

}

}