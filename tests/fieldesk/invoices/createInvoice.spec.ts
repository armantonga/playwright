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

test('Create an invoice from a job', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();

  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    customer: 'Marisol Reyes',
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  // The invoice detail page is opened right after the creation
  await invoicesPage.assertDetailTitle(number);
  await invoicesPage.assertDetailTotal('$250.00');
  await invoicesPage.assertDetailPaid('$0.00');
  await invoicesPage.assertDetailBalance('$250.00');
  await invoicesPage.assertDetailStatus('unpaid');
  await invoicesPage.assertDetailItemsContains('Valve replacement');
});

test('The invoice of a job is listed in the invoices list', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();

  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await invoicesPage.openInvoices();

  await invoicesPage.assertInvoiceInList(number);
  await invoicesPage.assertInvoiceStatus(number, 'unpaid');
  await invoicesPage.assertInvoiceRowContains(number, '$250.00');
  await invoicesPage.assertInvoiceRowContains(number, 'Dale Whitfield');
});

test('The job shows the invoice instead of the create invoice button', async () => {
  const jobTitle = uniqueTitle('Invoice job');

  await jobsPage.goto();
  await jobsPage.openJobs();
  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle,
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await jobsPage.openJobs();
  await jobsPage.openJobDetail(jobTitle);

  await expect(jobsPage.page.getByTestId('btn-view-invoice')).toBeVisible();
  await expect(jobsPage.page.getByTestId('btn-create-invoice')).toHaveCount(0);
  // The job detail shows the status and the balance of the invoice
  await expect(jobsPage.page.locator('.kv').filter({ hasText: 'Balance' })).toContainText('$250.00');
  await expect(jobsPage.page.getByRole('button', { name: 'Open Invoice' })).toBeVisible();
});

test('The invoice of a job can be opened from the job detail page', async () => {
  const jobTitle = uniqueTitle('Invoice job');

  await jobsPage.goto();
  await jobsPage.openJobs();
  const number = await createInvoice(jobsPage, invoicesPage, {
    jobTitle,
    items: [{ name: 'Valve replacement', qty: 1, price: 250 }]
  });

  await jobsPage.openJobs();
  await jobsPage.openJobDetail(jobTitle);
  await jobsPage.page.getByTestId('btn-view-invoice').click();

  await expect(invoicesPage.pageTitle).toHaveText('Invoice Detail');
  await invoicesPage.assertDetailTitle(number);
});

test('An invoice of a job without line items has no total and no payment button', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();

  const number = await createInvoice(jobsPage, invoicesPage, { jobTitle: uniqueTitle('Empty invoice job') });

  await invoicesPage.assertDetailTotal('$0.00');
  await invoicesPage.assertDetailBalance('$0.00');
  await expect(invoicesPage.itemsTable).toContainText('No line items.');
  await expect(invoicesPage.addPaymentButton).toHaveCount(0);
  await invoicesPage.assertDetailStatus('paid');
});

test('The invoice of a job keeps every line item of the job', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();

  await createInvoice(jobsPage, invoicesPage, {
    jobTitle: uniqueTitle('Invoice job'),
    items: [
      { name: 'Copper Pipe (50ft)', qty: 1, price: 210 },
      { name: 'Rough-in Labor', qty: 16, price: 95 }
    ]
  });

  await invoicesPage.assertDetailItemsContains('Copper Pipe (50ft)');
  await invoicesPage.assertDetailItemsContains('Rough-in Labor');
  // 1 x $210.00 + 16 x $95.00 = $1,730.00
  await invoicesPage.assertDetailTotal('$1,730.00');
});
