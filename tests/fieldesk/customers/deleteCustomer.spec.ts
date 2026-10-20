import { test } from '@playwright/test';
import { CustomersPage } from '../../../pages/CustomersPage';

let customersPage!: CustomersPage;

test.beforeEach(async ({ page }) => {
  customersPage = new CustomersPage(page);
});

// Create a customer to work on so the test does not depend on the seeded data
async function createCustomer(name: string) {
  await customersPage.goto();
  await customersPage.openCustomers();
  await customersPage.clickNewCustomer();
  await customersPage.fillCustomerForm(
    name,
    `delete.customer${Date.now()}@example.com`,
    '555-0100',
    '123 Test Street, Springfield'
  );
  await customersPage.saveCustomer();
  await customersPage.assertCustomerCreated(name);
}

test('Delete customer', async () => {
  const customerName = `Delete Me ${Date.now()}`;
  await createCustomer(customerName);

  await customersPage.clickDeleteCustomer(customerName);
  await customersPage.confirmDelete();

  await customersPage.assertCustomerDeleted(customerName);
});

test('Delete customer - cancel keeps the customer', async () => {
  const customerName = `Keep Me ${Date.now()}`;
  await createCustomer(customerName);

  await customersPage.clickDeleteCustomer(customerName);
  await customersPage.cancelDelete();

  await customersPage.assertCustomerStillPresent(customerName);
});
