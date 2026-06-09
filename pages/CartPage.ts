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
    }

    async assertCartEmpty() {
        await expect(this.page.locator('#cart_info_table tbody tr')).toHaveCount(0);
    }
}

