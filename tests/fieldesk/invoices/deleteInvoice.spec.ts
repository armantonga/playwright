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

test('Delete an invoice', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await invoicesPage.openInvoices();
  await invoicesPage.clickDeleteInvoice(number);
  await invoicesPage.confirmDelete();

  await invoicesPage.assertToast('Invoice deleted');
  await invoicesPage.assertInvoiceNotInList(number);
});

test('The confirmation of an invoice mentions the invoice number', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await invoicesPage.openInvoices();
  await invoicesPage.clickDeleteInvoice(number);

  await expect(invoicesPage.confirmTitle).toHaveText('Delete invoice?');
  await expect(invoicesPage.confirmMessage).toContainText(number);
});

test('Delete an invoice - cancel keeps the invoice', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await invoicesPage.openInvoices();
  await invoicesPage.clickDeleteInvoice(number);
  await invoicesPage.cancelDelete();

  await invoicesPage.assertInvoiceInList(number);
});

test('Delete an invoice from the invoice detail page', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await invoicesPage.openInvoices();
  await invoicesPage.openInvoice(number);
  await invoicesPage.deleteInvoiceButton.click();
  await invoicesPage.confirmDelete();

  await invoicesPage.assertToast('Invoice deleted');
  // Deleting from the detail page brings the user back to the invoices list
  await expect(invoicesPage.pageTitle).toHaveText('Invoices');
  await invoicesPage.assertInvoiceNotInList(number);
});

test('Deleting an invoice frees the job to create a new one', async () => {
  const jobTitle = uniqueTitle('Invoice job');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await createInvoice(jobsPage, invoicesPage, {
    jobTitle,
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await jobsPage.openJobs();
  await jobsPage.openJobDetail(jobTitle);
  await expect(jobsPage.page.getByTestId('btn-view-invoice')).toBeVisible();

  await jobsPage.page.getByTestId('btn-view-invoice').click();
  await invoicesPage.deleteInvoiceButton.click();
  await invoicesPage.confirmDelete();

  await jobsPage.openJobs();
  await jobsPage.openJobDetail(jobTitle);
  await expect(jobsPage.page.getByTestId('btn-create-invoice')).toBeVisible();
  await expect(jobsPage.page.getByTestId('btn-view-invoice')).toHaveCount(0);
});

test('An invoice with payments can not be deleted from the list', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await recordPayment(invoicesPage, { amount: 100 });

  await invoicesPage.openInvoices();
  const deleteButton = invoicesPage.invoiceRow(number).getByRole('button', { name: 'Delete', exact: true });
  await expect(deleteButton).toBeDisabled();
  await invoicesPage.assertInvoiceInList(number);
});

test('Deleting an invoice lowers the outstanding balance', async () => {
  await jobsPage.goto();
  await jobsPage.openDashboard();
  expect(await invoicesPage.outstandingBalance()).toBe('$0.00');

  await jobsPage.openJobs();
  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await invoicesPage.openDashboard();
  expect(await invoicesPage.outstandingBalance()).toBe('$250.00');

  await invoicesPage.openInvoices();
  await invoicesPage.clickDeleteInvoice(number);
  await invoicesPage.confirmDelete();

  await invoicesPage.openDashboard();
  expect(await invoicesPage.outstandingBalance()).toBe('$0.00');
});
