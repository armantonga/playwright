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

// Creates an invoice of 250 dollars and leaves the invoice detail page open
async function openInvoiceOf250() {
  await jobsPage.goto();
  await jobsPage.openJobs();
  return createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });
}

test('Record a full payment', async () => {
  await openInvoiceOf250();

  await recordPayment(invoicesPage, { amount: 250, note: 'Paid in cash at the job site' });

  await invoicesPage.assertToast('Payment recorded');
  await invoicesPage.assertDetailPaid('$250.00');
  await invoicesPage.assertDetailBalance('$0.00');
  await invoicesPage.assertDetailStatus('paid');
  await invoicesPage.assertPaymentRecorded('$250.00');
  await expect(invoicesPage.paymentsTable).toContainText('Paid in cash at the job site');
});

test('A fully paid invoice has no record payment button anymore', async () => {
  await openInvoiceOf250();

  await recordPayment(invoicesPage, { amount: 250 });

  await expect(invoicesPage.addPaymentButton).toHaveCount(0);
});

test('Record a partial payment', async () => {
  await openInvoiceOf250();

  await recordPayment(invoicesPage, { amount: 100 });

  await invoicesPage.assertToast('Payment recorded');
  await invoicesPage.assertDetailPaid('$100.00');
  await invoicesPage.assertDetailBalance('$150.00');
  await invoicesPage.assertDetailStatus('partial');
});

test('Several payments are added up', async () => {
  await openInvoiceOf250();

  await recordPayment(invoicesPage, { amount: 100 });
  await recordPayment(invoicesPage, { amount: 50 });

  await invoicesPage.assertDetailPaid('$150.00');
  await invoicesPage.assertDetailBalance('$100.00');
  await invoicesPage.assertDetailStatus('partial');
  expect(await invoicesPage.countPayments()).toBe(2);
  await invoicesPage.assertPaymentRecorded('$100.00');
  await invoicesPage.assertPaymentRecorded('$50.00');
});

test('The payment method can be chosen', async () => {
  await openInvoiceOf250();

  await recordPayment(invoicesPage, { amount: 250, method: 'cash' });

  await expect(invoicesPage.paymentsTable).toContainText(/cash/i);
});

test('Every payment method can be selected', async () => {
  await openInvoiceOf250();

  await invoicesPage.clickAddPayment();
  await expect(invoicesPage.page.getByTestId('pay-method-card')).toHaveClass(/selected/);

  await invoicesPage.selectPayMethod('bank_transfer');
  await expect(invoicesPage.page.getByTestId('pay-method-bank_transfer')).toHaveClass(/selected/);
  await expect(invoicesPage.page.getByTestId('pay-method-card')).not.toHaveClass(/selected/);
});

test('The payment form is prefilled with the balance and with today', async () => {
  await openInvoiceOf250();

  await invoicesPage.clickAddPayment();

  await expect(invoicesPage.paymentAmountInput).toHaveValue('250.00');
  await expect(invoicesPage.paymentDateInput).toHaveValue(new Date().toISOString().slice(0, 10));
  await expect(invoicesPage.paymentNoteInput).toHaveValue('');
});

test('A payment of zero is refused', async () => {
  await openInvoiceOf250();

  await invoicesPage.clickAddPayment();
  await invoicesPage.fillPaymentAmount(0);
  await invoicesPage.savePayment();

  await invoicesPage.assertToast('Enter a valid payment amount');
  await invoicesPage.assertPanelOpen();
  await invoicesPage.assertNoPayments();
});

test('An empty payment amount is refused', async () => {
  await openInvoiceOf250();

  await invoicesPage.clickAddPayment();
  await invoicesPage.fillPaymentAmount('');
  await invoicesPage.savePayment();

  await invoicesPage.assertToast('Enter a valid payment amount');
  await invoicesPage.assertPanelOpen();
  await invoicesPage.assertNoPayments();
});

test('The payment form can be cancelled', async () => {
  await openInvoiceOf250();

  await invoicesPage.clickAddPayment();
  await invoicesPage.fillPaymentAmount(100);
  await invoicesPage.cancelPaymentForm();

  await invoicesPage.assertPanelClosed();
  await invoicesPage.assertNoPayments();
  await invoicesPage.assertDetailBalance('$250.00');
});

test('The note of a payment is optional', async () => {
  await openInvoiceOf250();

  await recordPayment(invoicesPage, { amount: 250 });

  await invoicesPage.assertPaymentRecorded('$250.00');
  await expect(invoicesPage.paymentsTable).toContainText('—');
});

test('A payment with a date is shown with that date', async () => {
  await openInvoiceOf250();

  await recordPayment(invoicesPage, { amount: 250, date: '2026-10-05' });

  await expect(invoicesPage.paymentsTable).toContainText('Oct 5, 2026');
});

test('A payment bigger than the balance leaves a negative balance', async () => {
  await openInvoiceOf250();

  await recordPayment(invoicesPage, { amount: 300 });

  await invoicesPage.assertDetailPaid('$300.00');
  await invoicesPage.assertDetailBalance('$-50.00');
  await invoicesPage.assertDetailStatus('paid');
});

test('A recorded payment is kept after a page reload', async () => {
  const number = await openInvoiceOf250();

  await recordPayment(invoicesPage, { amount: 100 });

  await invoicesPage.reload();
  await invoicesPage.openInvoices();
  await invoicesPage.openInvoice(number);

  await invoicesPage.assertDetailPaid('$100.00');
  await invoicesPage.assertDetailBalance('$150.00');
});

test('A payment changes the dashboard stats', async () => {
  await jobsPage.goto();
  await jobsPage.openDashboard();
  const outstandingBefore = await invoicesPage.outstandingBalance();
  const collectedBefore = await invoicesPage.totalCollected();
  expect(outstandingBefore).toBe('$0.00');

  await jobsPage.openJobs();
  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await invoicesPage.openDashboard();
  expect(await invoicesPage.outstandingBalance()).toBe('$250.00');

  await invoicesPage.openInvoices();
  await invoicesPage.openInvoice(number);
  await recordPayment(invoicesPage, { amount: 50 });

  await invoicesPage.openDashboard();
  expect(await invoicesPage.outstandingBalance()).toBe('$200.00');
  expect(await invoicesPage.totalCollected()).not.toBe(collectedBefore);
});
