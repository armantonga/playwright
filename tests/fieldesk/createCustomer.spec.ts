import { test } from '@playwright/test';
import { CustomersPage } from '../../pages/CustomersPage';

let customersPage!: CustomersPage;

test.beforeEach(async ({ page }) => {
  customersPage = new CustomersPage(page);
});

test('Create new customer', async () => {
  const uniqueName = `Test Customer ${Date.now()}`;

  await customersPage.goto();
  await customersPage.openCustomers();
  await customersPage.clickNewCustomer();
  await customersPage.fillCustomerForm(
    uniqueName,
    `testcustomer${Date.now()}@example.com`,
    '555-0100',
    '123 Test Street, Springfield'
  );
  await customersPage.saveCustomer();
  await customersPage.assertCustomerCreated(uniqueName);
});

test('Create new customer - cancel does not create customer', async () => {
  const uniqueName = `Test Customer ${Date.now()}`;

  await customersPage.goto();
  await customersPage.openCustomers();
  await customersPage.clickNewCustomer();
  await customersPage.fillCustomerForm(
    uniqueName,
    `testcustomer${Date.now()}@example.com`,
    '555-0100',
    '123 Test Street, Springfield'
  );
  await customersPage.cancelCustomerForm();
  await customersPage.assertCustomerNotCreated(uniqueName);
});
