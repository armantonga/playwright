import { test, expect } from '@playwright/test';

test('sign up new account', async ({ page }) => {
    
    await page.goto('/');

    await expect(page).toHaveTitle(/Automation Exercise/);
    await page.getByRole('link', { name: 'Signup / Login'}).click();
    await page.getByPlaceholder('Name').fill('Test123');
    await page.getByPlaceholder('Email Address').nth(1).fill('jeyobed445@fanchatu.com');
    await page.getByRole('button', { name: 'Signup'}).click();

    //checking title after clicking the signup
    await expect(page).toHaveTitle('Automation Exercise - Signup');

    await page.locator('#uniform-id_gender1').check();
    await page.locator('#password').fill('Test123@');
    await page.locator('#days').selectOption('1');
    await page.locator('#months').selectOption('June');
    await page.locator('#years').selectOption('1994');
    await page.locator('#first_name').fill('Test');
    await page.locator('#last_name').fill('Test123');
    await page.locator('#address1').fill('Test123');
    await page.locator('#country').selectOption('Australia');
    await page.locator('#state').fill('Test123');
    await page.locator('#city').fill('Test123');
    await page.locator('#zipcode').fill('Test123');
    await page.locator('#mobile_number').fill('09657483946');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page).toHaveURL('/account_created')


});