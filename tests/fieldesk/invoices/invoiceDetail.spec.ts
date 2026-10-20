import { test, expect } from '@playwright/test';
import { JobsPage } from '../../../pages/JobsPage';
import { InvoicesPage } from '../../../pages/InvoicesPage';
import { createInvoice } from '../../../pages/fixtures/invoiceFixtures';
import { uniqueTitle } from '../../../pages/fixtures/jobFixtures';

let jobsPage!: JobsPage;
let invoicesPage!: InvoicesPage;

test.beforeEach(async ({ page }) => {
  jobsPage = new JobsPage(page);
  invoicesPage = new InvoicesPage(page);
});

test('The invoice detail shows the seeded invoice', async () => {
  await invoicesPage.goto();
  await invoicesPage.openInvoices();
  await invoicesPage.openInvoice('INV-5001');

  await invoicesPage.assertDetailTitle('INV-5001');
  await invoicesPage.assertDetailStatus('paid');
  await invoicesPage.assertDetailTotal('$120.00');
  await invoicesPage.assertDetailPaid('$120.00');
  await invoicesPage.assertDetailBalance('$0.00');
  await invoicesPage.assertDetailItemsContains('AC Tune-up Service');
});

test('The invoice detail shows the customer of the invoice', async () => {
  await invoicesPage.goto();
  await invoicesPage.openInvoices();
  await invoicesPage.openInvoice('INV-5001');

  await expect(invoicesPage.page.getByTestId('page-content')).toContainText('Dale Whitfield');
  await expect(invoicesPage.page.getByTestId('page-content')).toContainText('dale.whitfield@example.com');
});

test('The invoice detail shows the payment history', async () => {
  await invoicesPage.goto();
  await invoicesPage.openInvoices();
  await invoicesPage.openInvoice('INV-5001');

  await expect(invoicesPage.paymentsTable).toContainText('Jun 10, 2026');
  await expect(invoicesPage.paymentsTable).toContainText('$120.00');
  await expect(invoicesPage.paymentsTable).toContainText('Paid in full on completion');
  await expect(invoicesPage.paymentsTable).toContainText(/card/i);
  expect(await invoicesPage.countPayments()).toBe(1);
});

test('A paid invoice has no record payment button', async () => {
  await invoicesPage.goto();
  await invoicesPage.openInvoices();
  await invoicesPage.openInvoice('INV-5001');

  await expect(invoicesPage.addPaymentButton).toHaveCount(0);
});

test('An invoice with payments can not be deleted', async () => {
  await invoicesPage.goto();
  await invoicesPage.openInvoices();
  await invoicesPage.openInvoice('INV-5001');

  await expect(invoicesPage.lockedDeleteNote).toBeVisible();
  await expect(invoicesPage.lockedDeleteNote).toContainText("can't be deleted while it has recorded payments");
  await expect(invoicesPage.deleteInvoiceButton).toBeDisabled();
});

test('An invoice without payments can be deleted from the detail page', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await expect(invoicesPage.lockedDeleteNote).toHaveCount(0);
  await expect(invoicesPage.deleteInvoiceButton).toBeEnabled();
});

test('An invoice without payments shows the empty payment history', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await invoicesPage.assertNoPayments();
  await expect(invoicesPage.addPaymentButton).toBeVisible();
});

test('The breadcrumb of the invoice detail goes back to the invoices list', async () => {
  await invoicesPage.goto();
  await invoicesPage.openInvoices();
  await invoicesPage.openInvoice('INV-5001');
  await invoicesPage.backToInvoices();

  await expect(invoicesPage.invoicesTable).toBeVisible();
  await invoicesPage.assertInvoiceInList('INV-5001');
});

test('The job of an invoice can be opened from the invoice detail', async () => {
  await invoicesPage.goto();
  await invoicesPage.openInvoices();
  await invoicesPage.openInvoice('INV-5001');

  await invoicesPage.page.getByTestId('page-content').locator('a.row-link', { hasText: 'AC unit annual maintenance' }).click();

  await expect(invoicesPage.pageTitle).toHaveText('Job Detail');
  await expect(invoicesPage.page.getByTestId('job-detail-title')).toHaveText('AC unit annual maintenance');
});

test('An invoice keeps its data after a page reload', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await invoicesPage.reload();
  await invoicesPage.openInvoices();
  await invoicesPage.openInvoice(number);

  await invoicesPage.assertDetailTotal('$250.00');
  await invoicesPage.assertDetailBalance('$250.00');
});
