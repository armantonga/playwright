import { test, expect } from '@playwright/test';

test('sign up new account', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Automation Exercise/);
    await page.getByRole('link', { name: 'Signup / Login'}).click();
    await page.getByPlaceholder('Name').fill('Test123');
    await page.getByPlaceholder('Email Address').nth(1).fill('satet23305@dosbee.com');
    await page.getByRole('button', { name: 'Signup'}).click();

    //checking title after clicking the signup
    await expect(page).toHaveTitle('Automation Exercise - Signup');

    await page.locator('#uniform-id_gender1').check();
    await page.locator('#password').fill('Test123@');
    await page.locator('#days').selectOption('1');
    await page.locator('#months').selectOption('June');
    await page.locator('#years').selectOption('1994');

});
