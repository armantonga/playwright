import { test, expect } from '@playwright/test';
import { InvoicesPage } from '../../../pages/InvoicesPage';

let invoicesPage!: InvoicesPage;

test.beforeEach(async ({ page }) => {
  invoicesPage = new InvoicesPage(page);
});

test('The invoices list shows the seeded invoice', async () => {
  await invoicesPage.goto();
  await invoicesPage.openInvoices();

  await expect(invoicesPage.invoicesTable).toBeVisible();
  await invoicesPage.assertInvoiceInList('INV-5001');
  await invoicesPage.assertInvoiceRowContains('INV-5001', 'Dale Whitfield');
  await invoicesPage.assertInvoiceStatus('INV-5001', 'paid');
  await invoicesPage.assertInvoiceRowContains('INV-5001', 'Jun 10, 2026');
  await invoicesPage.assertInvoiceRowContains('INV-5001', '$120.00');
});

test('A paid invoice has a balance of zero', async () => {
  await invoicesPage.goto();
  await invoicesPage.openInvoices();

  await invoicesPage.assertInvoiceRowContains('INV-5001', '$0.00');
});

test('The delete button of an invoice with payments is disabled', async () => {
  await invoicesPage.goto();
  await invoicesPage.openInvoices();

  const deleteButton = invoicesPage.invoiceRow('INV-5001').getByRole('button', { name: 'Delete', exact: true });
  await expect(deleteButton).toBeDisabled();
});

test('The invoice number opens the invoice detail', async () => {
  await invoicesPage.goto();
  await invoicesPage.openInvoices();
  await invoicesPage.openInvoice('INV-5001');

  await expect(invoicesPage.detailTitle).toHaveText('INV-5001');
  await expect(invoicesPage.pageTitle).toHaveText('Invoice Detail');
});

test('The invoices list is empty when every invoice is deleted', async () => {
  await invoicesPage.goto();
  await invoicesPage.openInvoices();

  // The seeded invoice holds a payment, it has to be removed first
  await invoicesPage.openInvoice('INV-5001');
  await invoicesPage.clickDeletePayment('$120.00');
  await invoicesPage.confirmDelete();
  await invoicesPage.backToInvoices();

  await invoicesPage.clickDeleteInvoice('INV-5001');
  await invoicesPage.confirmDelete();

  await expect(invoicesPage.emptyState).toBeVisible();
  await expect(invoicesPage.emptyState).toContainText('No invoices yet');
  expect(await invoicesPage.countInvoices()).toBe(0);
});
