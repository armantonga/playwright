import { test, expect } from '@playwright/test';
import { JobsPage } from '../../../pages/JobsPage';
import { createJob, uniqueTitle } from '../../../pages/fixtures/jobFixtures';

let jobsPage!: JobsPage;

test.beforeEach(async ({ page }) => {
  jobsPage = new JobsPage(page);
});

test('Open a job from the list and check the details', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.openJobDetail('Water heater replacement');

  await jobsPage.assertDetailTitle('Water heater replacement');
  await jobsPage.assertDetailStatus('scheduled');
  await jobsPage.assertDetailNotes('Customer reports no hot water since Tuesday.');
  await jobsPage.assertDetailTotal('$965.00');
  await jobsPage.assertDetailItemsContains('40-gal Water Heater Unit');
  await jobsPage.assertDetailItemsContains('Labor');
});

test('The job detail shows the scheduled date and the customer', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.openJobDetail('Water heater replacement');

  await expect(jobsPage.page.getByTestId('page-content')).toContainText('Marisol Reyes');
  await expect(jobsPage.page.getByTestId('page-content')).toContainText('Jun 22, 2026');
});

test('A job without a scheduled date shows a dash', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.openJobDetail('Leaky faucet repair');

  await expect(jobsPage.page.getByTestId('page-content')).toContainText('Scheduled: —');
});

test('A job without notes shows the placeholder', async () => {
  const title = uniqueTitle('No notes');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await createJob(jobsPage, { title, customer: 'Priya Anand' });

  await jobsPage.openJobDetail(title);
  await expect(jobsPage.detailNotes).toContainText('No notes added.');
});

test('A job without line items shows the empty message', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.openJobDetail('Leaky faucet repair');

  await expect(jobsPage.detailItemsTable).toContainText('No line items on this job.');
});

test('The job detail breadcrumb goes back to the jobs list', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.openJobDetail('Water heater replacement');
  await jobsPage.backToJobs();

  await expect(jobsPage.jobsTable).toBeVisible();
  await expect(jobsPage.jobsTable).toContainText('Water heater replacement');
});

test('Create an invoice from a job', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.openJobDetail('Water heater replacement');
  await jobsPage.clickCreateInvoice();

  await jobsPage.assertToast('Invoice created from job');
  await expect(jobsPage.page.getByTestId('invoice-detail-total')).toHaveText('$965.00');
  await expect(jobsPage.page.getByTestId('invoice-detail-balance')).toHaveText('$965.00');
});

test('A job with an invoice shows the invoice instead of the create button', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.openJobDetail('AC unit annual maintenance');

  await expect(jobsPage.page.getByTestId('btn-view-invoice')).toBeVisible();
  await expect(jobsPage.page.getByTestId('btn-create-invoice')).toHaveCount(0);
});

test('A job without an invoice shows the create invoice button', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.openJobDetail('Water heater replacement');

  await expect(jobsPage.page.getByTestId('btn-create-invoice')).toBeVisible();
  await expect(jobsPage.page.getByTestId('btn-view-invoice')).toHaveCount(0);
});

test('The customer of a job can be opened from the job detail', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.openJobDetail('Water heater replacement');

  await jobsPage.page.getByTestId('page-content').locator('a.row-link', { hasText: 'Marisol Reyes' }).click();

  await expect(jobsPage.pageTitle).toHaveText('Customers');
});
