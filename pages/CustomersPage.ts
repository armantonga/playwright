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

  // Locate the table row of a customer by name
  customerRow(name: string) {
    return this.page.getByTestId('customers-table').locator('tbody tr').filter({ hasText: name });
  }

  // Open the edit slide-over of an existing customer and wait for the form
  async clickEditCustomer(name: string) {
    await this.customerRow(name).getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(this.page.getByTestId('panel')).toContainText('Edit Customer');
  }

  // Fill a single field of the customer form (used for partial updates)
  async fillCustomerName(name: string) {
    await this.page.getByTestId('input-customer-name').fill(name);
  }

  async fillCustomerEmail(email: string) {
    await this.page.getByTestId('input-customer-email').fill(email);
  }

  async fillCustomerPhone(phone: string) {
    await this.page.getByTestId('input-customer-phone').fill(phone);
  }

  async fillCustomerAddress(address: string) {
    await this.page.getByTestId('input-customer-address').fill(address);
  }

  // Click Delete on a customer row and wait for the confirmation dialog
  async clickDeleteCustomer(name: string) {
    await this.customerRow(name).getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(this.page.getByTestId('confirm-overlay')).toBeVisible();
  }

  // Accept the confirmation dialog
  async confirmDelete() {
    await this.page.getByTestId('confirm-ok').click();
  }

  // Dismiss the confirmation dialog
  async cancelDelete() {
    await this.page.getByTestId('confirm-cancel').click();
    await expect(this.page.getByTestId('confirm-overlay')).toBeHidden();
  }

  // The edit form should open with the current values of the customer
  async assertCustomerFormPrefilled(name: string, email: string, phone: string, address: string) {
    await expect(this.page.getByTestId('input-customer-name')).toHaveValue(name);
    await expect(this.page.getByTestId('input-customer-email')).toHaveValue(email);
    await expect(this.page.getByTestId('input-customer-phone')).toHaveValue(phone);
    await expect(this.page.getByTestId('input-customer-address')).toHaveValue(address);
  }

  // The updated values are saved and the old ones are gone
  async assertCustomerUpdated(name: string, email: string) {
    await expect(this.page.getByTestId('toast')).toHaveText('Customer updated');
    await expect(this.page.getByTestId('customers-table')).toContainText(name);
    await expect(this.page.getByTestId('customers-table')).toContainText(email);
  }

  // The customer row still holds the given text (e.g. fields left untouched)
  async assertCustomerRowContains(name: string, text: string) {
    await expect(this.customerRow(name)).toContainText(text);
  }

  async assertCustomerNotInTable(name: string) {
    await expect(this.page.getByTestId('customers-table')).not.toContainText(name);
  }

  async assertCustomerDeleted(name: string) {
    await expect(this.page.getByTestId('toast')).toHaveText('Customer deleted');
    await expect(this.customerRow(name)).toHaveCount(0);
  }

  async assertCustomerStillPresent(name: string) {
    await expect(this.customerRow(name)).toHaveCount(1);
  }

  async assertCustomerNotCreated(name: string) {
    await expect(this.page.getByTestId('customers-table')).not.toContainText(name);
  }

  async assertCustomerCreated(name: string) {
    await expect(this.page.getByTestId('toast')).toHaveText('Customer created');
    await expect(this.page.getByTestId('customers-table')).toContainText(name);
  }
}
