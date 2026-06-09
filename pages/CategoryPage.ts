import { Page, expect } from '@playwright/test';

export class CategoryPage {
    constructor(private page: Page){}

    async assertCategories(){
        await expect(this.page.locator('#accordian')).toContainText('Women');
        await expect(this.page.locator('#accordian')).toContainText('Men');
        await expect(this.page.locator('#accordian')).toContainText('Kids');
    }

    
}