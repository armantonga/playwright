import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    await this.page.getByRole('link', { name: 'Signup / Login' }).click();
  }

  async login(email: string, password: string) {
    await this.page.getByPlaceholder('Email Address').nth(0).fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
}