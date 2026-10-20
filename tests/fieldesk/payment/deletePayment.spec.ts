import { test, expect } from '@playwright/test';
import { JobsPage } from '../../../pages/JobsPage';
import { InvoicesPage } from '../../../pages/InvoicesPage';
import { createInvoice, recordPayment } from '../../../pages/fixtures/invoiceFixtures';
import { uniqueTitle } from '../../../pages/fixtures/jobFixtures';

let jobsPage!: JobsPage;
let invoicesPage!: InvoicesPage;

test.beforeEach(async ({ page }) => {
  jobsPage = new JobsPage(page);
  invoicesPage = new InvoicesPage(page);
});

// Creates an invoice of 250 dollars with one payment of 100 dollars
async function openInvoiceWithPayment() {
  await jobsPage.goto();
  await jobsPage.openJobs();

  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await recordPayment(invoicesPage, { amount: 100, note: 'First payment' });
  return number;
}

test('Delete a payment', async () => {
  await openInvoiceWithPayment();

  await invoicesPage.clickDeletePayment('$100.00');
  await invoicesPage.confirmDelete();

  await invoicesPage.assertToast('Payment deleted');
  await invoicesPage.assertPaymentNotRecorded('$100.00');
  await invoicesPage.assertDetailPaid('$0.00');
  await invoicesPage.assertDetailBalance('$250.00');
  await invoicesPage.assertDetailStatus('unpaid');
});

test('The confirmation of a payment mentions the amount', async () => {
  await openInvoiceWithPayment();

  await invoicesPage.clickDeletePayment('$100.00');

  await expect(invoicesPage.confirmTitle).toHaveText('Delete payment?');
  await expect(invoicesPage.confirmMessage).toContainText('$100.00');
  await expect(invoicesPage.confirmMessage).toContainText('balance will be recalculated');
});

test('Delete a payment - cancel keeps the payment', async () => {
  await openInvoiceWithPayment();

  await invoicesPage.clickDeletePayment('$100.00');
  await invoicesPage.cancelDelete();

  await invoicesPage.assertPaymentRecorded('$100.00');
  await invoicesPage.assertDetailPaid('$100.00');
  await invoicesPage.assertDetailBalance('$150.00');
});

test('Only the deleted payment is removed', async () => {
  await openInvoiceWithPayment();

  await recordPayment(invoicesPage, { amount: 50, note: 'Second payment' });
  expect(await invoicesPage.countPayments()).toBe(2);

  await invoicesPage.clickDeletePayment('$100.00');
  await invoicesPage.confirmDelete();

  await invoicesPage.assertPaymentNotRecorded('$100.00');
  await invoicesPage.assertPaymentRecorded('$50.00');
  await invoicesPage.assertDetailPaid('$50.00');
  await invoicesPage.assertDetailBalance('$200.00');
});

test('An invoice can be deleted again after its payments are removed', async () => {
  await openInvoiceWithPayment();

  await expect(invoicesPage.deleteInvoiceButton).toBeDisabled();

  await invoicesPage.clickDeletePayment('$100.00');
  await invoicesPage.confirmDelete();

  await expect(invoicesPage.deleteInvoiceButton).toBeEnabled();
  await expect(invoicesPage.lockedDeleteNote).toHaveCount(0);
});
