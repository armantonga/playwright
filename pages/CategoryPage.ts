import { Page, expect } from '@playwright/test';

export class CategoryPage {
    constructor(private page: Page){}

    async assertCategories(){
        await expect(this.page.locator('#accordian')).toContainText('Women');
        await expect(this.page.locator('#accordian')).toContainText('Men');
        await expect(this.page.locator('#accordian')).toContainText('Kids');
    }
    async clickWomenCategory(){
        await this.page.locator('a[href="#Women"]').click();

    }
    async clickDressCategory(){
        await this.page.locator('a[href="/category_products/1"]').click();
    }

    //using array
    async assertDressProduct(){
        await expect(this.page.locator('.features_items .productinfo p')).toContainText([
            'Sleeveless Dress',
            'Stylish Dress',
            'Rose Pink Embroidered Maxi Dress'
        ]);
        
    } 

    
}