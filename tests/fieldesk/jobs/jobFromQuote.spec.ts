import { test, expect } from '@playwright/test';
import { JobsPage } from '../../../pages/JobsPage';
import { QuotesPage } from '../../../pages/QuotesPage';

let jobsPage!: JobsPage;
let quotesPage!: QuotesPage;

test.beforeEach(async ({ page }) => {
  jobsPage = new JobsPage(page);
  quotesPage = new QuotesPage(page);
});

test('A converted quote shows up in the jobs list', async () => {
  await quotesPage.goto();
  await quotesPage.openJobs();
  const jobsBefore = await jobsPage.countJobs();

  await quotesPage.openQuotes();
  await quotesPage.openQuoteDetail('Tankless water heater upgrade');
  await quotesPage.clickConvertToJob();

  await jobsPage.openJobs();

  expect(await jobsPage.countJobs()).toBe(jobsBefore + 1);
  await jobsPage.assertJobInList('Tankless water heater upgrade');
  await jobsPage.assertJobStatus('Tankless water heater upgrade', 'scheduled');
  await jobsPage.assertJobRowContains('Tankless water heater upgrade', '$1,450.00');
});

test('The job of a converted quote can be opened from the quote', async () => {
  await quotesPage.goto();
  await quotesPage.openQuotes();
  await quotesPage.openQuoteDetail('Bathroom remodel — plumbing rough-in');
  await quotesPage.clickConvertToJob();

  await quotesPage.openQuotes();
  await quotesPage.openQuoteDetail('Bathroom remodel — plumbing rough-in');
  await quotesPage.viewConvertedJob();

  await quotesPage.assertJobTitle('Bathroom remodel — plumbing rough-in');
  await quotesPage.assertJobStatus('scheduled');
  // 16 x $95.00 + 1 x $210.00 = $1,730.00
  await quotesPage.assertJobTotal('$1,730.00');
});
