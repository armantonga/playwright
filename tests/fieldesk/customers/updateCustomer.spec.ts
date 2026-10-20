import { test } from '@playwright/test';
import { CustomersPage } from '../../../pages/CustomersPage';

let customersPage!: CustomersPage;

test.beforeEach(async ({ page }) => {
  customersPage = new CustomersPage(page);
});

test('Update existing customer', async () => {
  const existingName = 'Marisol Reyes';
  const updatedName = `Updated Customer ${Date.now()}`;
  const updatedEmail = `updated.customer${Date.now()}@example.com`;

  await customersPage.goto();
  await customersPage.openCustomers();

  await customersPage.clickEditCustomer(existingName);
  await customersPage.assertCustomerFormPrefilled(
    existingName,
    'marisol.reyes@example.com',
    '555-0192',
    '14 Birchwood Ln, Springfield'
  );

  await customersPage.fillCustomerName(updatedName);
  await customersPage.fillCustomerEmail(updatedEmail);
  await customersPage.saveCustomer();

  await customersPage.assertCustomerUpdated(updatedName, updatedEmail);
  await customersPage.assertCustomerNotInTable(existingName);
});

test('Update existing customer - untouched fields keep their values', async () => {
  const existingName = 'Dale Whitfield';
  const updatedPhone = '555-9999';

  await customersPage.goto();
  await customersPage.openCustomers();

  await customersPage.clickEditCustomer(existingName);
  await customersPage.fillCustomerPhone(updatedPhone);
  await customersPage.saveCustomer();

  await customersPage.assertCustomerUpdated(existingName, 'dale.whitfield@example.com');
  await customersPage.assertCustomerRowContains(existingName, updatedPhone);
  await customersPage.assertCustomerRowContains(existingName, '882 Cedar Ct, Riverton');
});

test('Update existing customer - cancel does not save changes', async () => {
  const existingName = 'Priya Anand';
  const updatedName = `Never Saved ${Date.now()}`;

  await customersPage.goto();
  await customersPage.openCustomers();

  await customersPage.clickEditCustomer(existingName);
  await customersPage.fillCustomerName(updatedName);
  await customersPage.cancelCustomerForm();

  await customersPage.assertCustomerNotInTable(updatedName);
  await customersPage.assertCustomerRowContains(existingName, 'priya.anand@example.com');
});
