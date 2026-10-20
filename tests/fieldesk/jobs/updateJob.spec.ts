import { test, expect } from '@playwright/test';
import { JobsPage } from '../../../pages/JobsPage';
import { uniqueTitle } from '../../../pages/fixtures/jobFixtures';

let jobsPage!: JobsPage;

test.beforeEach(async ({ page }) => {
  jobsPage = new JobsPage(page);
});

test('Edit a job - the form is prefilled with the current values', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickEditJob('Water heater replacement');

  await expect(jobsPage.titleInput).toHaveValue('Water heater replacement');
  expect(await jobsPage.selectedCustomerName()).toBe('Marisol Reyes');
  expect(await jobsPage.selectedJobStatus()).toBe('scheduled');
  await expect(jobsPage.dateInput).toHaveValue('2026-06-22');
  await expect(jobsPage.notesInput).toHaveValue('Customer reports no hot water since Tuesday.');

  // The two seeded line items are loaded into the items editor
  expect(await jobsPage.countLineItems()).toBe(2);
  await expect(jobsPage.itemName(0)).toHaveValue('40-gal Water Heater Unit');
  await expect(jobsPage.itemQty(0)).toHaveValue('1');
  await expect(jobsPage.itemPrice(0)).toHaveValue('680');
  await expect(jobsPage.itemName(1)).toHaveValue(/Labor/);
  await expect(jobsPage.itemsTotal).toHaveText('$965.00');
});

test('Update the job title', async () => {
  const updatedTitle = uniqueTitle('Renamed job');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickEditJob('Water heater replacement');
  await jobsPage.fillJobTitle(updatedTitle);
  await jobsPage.saveJob();

  await jobsPage.assertJobUpdated(updatedTitle);
  await jobsPage.assertJobNotInList('Water heater replacement');
});

test('Update the job status', async () => {
  const title = 'Leaky faucet repair';

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickEditJob(title);
  await jobsPage.selectJobStatus('completed');
  await jobsPage.saveJob();

  await jobsPage.assertJobUpdated(title);
  await jobsPage.assertJobStatus(title, 'completed');
});

test('Update the job customer', async () => {
  const title = 'Leaky faucet repair';

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickEditJob(title);
  await jobsPage.selectJobCustomer('Dale Whitfield');
  await jobsPage.saveJob();

  await jobsPage.assertJobUpdated(title);
  await jobsPage.assertJobRowContains(title, 'Dale Whitfield');
  await jobsPage.assertJobRowNotContains(title, 'Priya Anand');
});

test('Update the scheduled date', async () => {
  const title = 'Leaky faucet repair';

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickEditJob(title);
  await jobsPage.fillJobDate('2026-12-01');
  await jobsPage.saveJob();

  await jobsPage.assertJobUpdated(title);
  await jobsPage.assertJobRowContains(title, 'Dec 1, 2026');
});

test('Update the notes', async () => {
  const title = 'Leaky faucet repair';

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickEditJob(title);
  await jobsPage.fillJobNotes('Replacement valve installed.');
  await jobsPage.saveJob();

  await jobsPage.assertJobUpdated(title);

  await jobsPage.openJobDetail(title);
  await jobsPage.assertDetailNotes('Replacement valve installed.');
});

test('Update the line items and the total', async () => {
  const title = 'Leaky faucet repair';

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickEditJob(title);
  await jobsPage.addLineItem('Cartridge', 2, 35);
  await jobsPage.saveJob();

  await jobsPage.assertJobUpdated(title);
  await jobsPage.assertJobRowContains(title, '$70.00');

  await jobsPage.openJobDetail(title);
  await jobsPage.assertDetailTotal('$70.00');
  await jobsPage.assertDetailItemsContains('Cartridge');
});

test('Update a job - cancel does not save the changes', async () => {
  const neverSaved = uniqueTitle('Never saved');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickEditJob('Leaky faucet repair');
  await jobsPage.fillJobTitle(neverSaved);
  await jobsPage.fillJobNotes('Should never be saved');
  await jobsPage.cancelJobForm();

  await jobsPage.assertPanelClosed();
  await jobsPage.assertJobNotInList(neverSaved);
  await jobsPage.assertJobRowContains('Leaky faucet repair', 'Priya Anand');
});

test('Update a job without changing anything still saves', async () => {
  const title = 'Leaky faucet repair';

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickEditJob(title);
  await jobsPage.saveJob();

  await jobsPage.assertJobUpdated(title);
  await jobsPage.assertJobStatus(title, 'lead');
});

test('Update a job from the job detail page', async () => {
  const updatedTitle = uniqueTitle('Detail update');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.openJobDetail('Leaky faucet repair');
  await jobsPage.clickEditJobFromDetail();
  await jobsPage.fillJobTitle(updatedTitle);
  await jobsPage.saveJob();

  await jobsPage.assertToast('Job updated');
  // The job detail page stays open and shows the new title
  await jobsPage.assertDetailTitle(updatedTitle);
});
