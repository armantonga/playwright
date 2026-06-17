import { Page, expect } from '@playwright/test';

export class CartPage {
    constructor(private page : Page){}

    async navigateCart() {
        await this.page.goto('/view_cart')
        }

    async assertOnCartPage(){
        await expect(this.page).toHaveURL('/view_cart');
        }    

    async assertCartItem(productName: string, quantity: string){
        const row = this.page
        .locator('#cart_info_table tbody tr')
        .filter({ hasText: productName });

        await expect(row.locator('.cart_description')).toContainText(productName);
        await expect(row.locator('.cart_quantity button')).toContainText(quantity); 
    }    

    async removeItemFromCart(productId: string) {
        const row = this.page.locator(`tr#product-${productId}`);
        await row.locator('.cart_quantity_delete').click(); 
        await this.page.waitForTimeout(1000);
    }

    async assertCartEmpty() {
        await expect(this.page.getByText('Cart is empty!')).toBeVisible({ timeout: 10000 });
    }

    async clickProceedToCheckout() {
        await this.page.locator('.check_out').filter({hasText: 'Proceed To Checkout'}).click();
    }
    async clearCart() {
        await this.page.goto('/view_cart');
        const deleteButtons = this.page.locator('.cart_quantity_delete');
        const count = await deleteButtons.count();
        for (let i = 0; i < count; i++) {
            await deleteButtons.first().click();
            await this.page.waitForTimeout(500);
  }
}

}

