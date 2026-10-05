import { Page, expect } from '@playwright/test';

export class CustomersPage {
  constructor(private page: Page) {}

  // Open the app and confirm the home page loaded
  async goto() {
    await this.page.goto('https://fieldesk.netlify.app/');
    await expect(this.page).toHaveTitle(/FieldDesk/);
  }

  // Navigate to the Customers section via the sidebar
  async openCustomers() {
    await this.page.getByTestId('nav-customers').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Customers');
  }

  // Open the new customer slide-over panel
  async clickNewCustomer() {
    await this.page.getByTestId('btn-new-customer').click();
  }

  // Fill in all fields of the customer form
  async fillCustomerForm(name: string, email: string, phone: string, address: string) {
    await this.page.getByTestId('input-customer-name').fill(name);
    await this.page.getByTestId('input-customer-email').fill(email);
    await this.page.getByTestId('input-customer-phone').fill(phone);
    await this.page.getByTestId('input-customer-address').fill(address);
  }

  async saveCustomer() {
    await this.page.getByTestId('btn-save-customer').click();
  }

  // Close the panel without saving anything
  async cancelCustomerForm() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  async assertCustomerNotCreated(name: string) {
    await expect(this.page.getByTestId('customers-table')).not.toContainText(name);
  }

  async assertCustomerCreated(name: string) {
    await expect(this.page.getByTestId('toast')).toHaveText('Customer created');
    await expect(this.page.getByTestId('customers-table')).toContainText(name);
  }
}
