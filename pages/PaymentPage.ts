import { Page, expect } from '@playwright/test';

export class PaymentPage {
      constructor(private page : Page){}

    async assertPaymentPage(){
        await expect(this.page).toHaveURL('/payment');
        await expect(this.page.getByRole('heading', {name: 'Payment'})).toBeVisible();

    }

    async fillCardDetails(
        nameOnCard: string, 
        cardNumber: string, 
        cvc: string, 
        expiryMonth: string,
        expiryYear: string ){

        await this.page.locator('[data-qa="name-on-card"]').fill(nameOnCard);
        await this.page.locator('[data-qa="card-number"]').fill(cardNumber);
        await this.page.locator('[data-qa="cvc"]').fill(cvc);
        await this.page.locator('[data-qa="expiry-month"]').fill(expiryMonth); 
        await this.page.locator('[data-qa="expiry-year"]').fill(expiryYear);
        
        }
    
     async clickPayAndConfirmOrder(){
        await this.page.locator('[data-qa="pay-button"]')
        .filter({'hasText': 'Pay and Confirm Order'}).click();

     }   

     async assertPaymentDonePage() {
        await expect(this.page).toHaveURL(/\/payment_done/);
        await expect(this.page.getByRole('heading', { name: 'Order Placed!' })).toBeVisible();
        }


}





