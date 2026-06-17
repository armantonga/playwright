import { Page, expect } from '@playwright/test';

export class CheckOutPage {
    constructor(private page : Page){}

    async assertOnCheckoutPage() {
        await expect(this.page).toHaveURL('/checkout');
        await expect(this.page.getByText('Address Details')).toBeVisible();
        }

    async assertOders(CartInfo: string, cart_price: string, total_price: string){
        const row = this.page
            .getByRole('row', { name: new RegExp(CartInfo) });
        await expect(row.locator('.cart_description h4')).toContainText(CartInfo);
        await expect(row.locator('.cart_price')).toContainText(cart_price);
        await expect(row.locator('.cart_total_price')).toContainText(total_price);

    }    

    async clickPlaceOrder(){
        await this.page.locator('.check_out').filter({hasText: 'Place Order'}).click();
    }

}