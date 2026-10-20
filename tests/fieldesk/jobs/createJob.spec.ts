import { test, expect } from '@playwright/test';
import { JobsPage } from '../../../pages/JobsPage';
import { uniqueTitle } from '../../../pages/fixtures/jobFixtures';

let jobsPage!: JobsPage;

test.beforeEach(async ({ page }) => {
  jobsPage = new JobsPage(page);
});

test('Create a job with all fields', async () => {
  const title = uniqueTitle('Boiler service');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickNewJob();
  await jobsPage.fillJobForm({
    title,
    customer: 'Marisol Reyes',
    status: 'scheduled',
    date: '2026-11-04',
    notes: 'Customer reports the pilot light goes out.'
  });
  await jobsPage.saveJob();

  await jobsPage.assertJobCreated(title);
  await jobsPage.assertJobRowContains(title, 'Marisol Reyes');
  await jobsPage.assertJobStatus(title, 'scheduled');
  await jobsPage.assertJobRowContains(title, 'Nov 4, 2026');
  await jobsPage.assertJobRowContains(title, '$0.00');
});

test('Create a job with line items and the computed total', async () => {
  const title = uniqueTitle('Line items job');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickNewJob();
  await jobsPage.fillJobForm({ title, customer: 'Dale Whitfield', status: 'in_progress' });
  await jobsPage.addLineItem('Copper Pipe (50ft)', 1, 210);
  await jobsPage.addLineItem('Rough-in Labor', 16, 95);
  await jobsPage.saveJob();

  await jobsPage.assertJobCreated(title);
  // 1 x $210.00 + 16 x $95.00 = $1,730.00
  await jobsPage.assertJobRowContains(title, '$1,730.00');

  await jobsPage.openJobDetail(title);
  await jobsPage.assertDetailTotal('$1,730.00');
  await jobsPage.assertDetailItemsContains('Copper Pipe (50ft)');
  await jobsPage.assertDetailItemsContains('Rough-in Labor');
});

test('Create a job - the title is required', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  const jobsBefore = await jobsPage.countJobs();

  await jobsPage.clickNewJob();
  await jobsPage.selectJobCustomer('Priya Anand');
  await jobsPage.saveJob();

  await jobsPage.assertToast('Job title is required');
  await jobsPage.assertPanelOpen();
  expect(await jobsPage.countJobs()).toBe(jobsBefore);
});

test('Create a job - the customer is required', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  const jobsBefore = await jobsPage.countJobs();

  await jobsPage.clickNewJob();
  await jobsPage.fillJobTitle(uniqueTitle('No customer job'));
  await jobsPage.saveJob();

  await jobsPage.assertToast('Please select a customer');
  await jobsPage.assertPanelOpen();
  expect(await jobsPage.countJobs()).toBe(jobsBefore);
});

test('Create a job - cancel does not create the job', async () => {
  const title = uniqueTitle('Cancelled job');

  await jobsPage.goto();
  await jobsPage.openJobs();
  const jobsBefore = await jobsPage.countJobs();

  await jobsPage.clickNewJob();
  await jobsPage.fillJobForm({ title, customer: 'Marisol Reyes' });
  await jobsPage.cancelJobForm();

  await jobsPage.assertPanelClosed();
  await jobsPage.assertJobNotInList(title);
  expect(await jobsPage.countJobs()).toBe(jobsBefore);
});

test('Create a job - closing the panel does not create the job', async () => {
  const title = uniqueTitle('Closed panel job');

  await jobsPage.goto();
  await jobsPage.openJobs();
  const jobsBefore = await jobsPage.countJobs();

  await jobsPage.clickNewJob();
  await jobsPage.fillJobForm({ title, customer: 'Marisol Reyes' });
  await jobsPage.closeJobPanel();

  await jobsPage.assertPanelClosed();
  await jobsPage.assertJobNotInList(title);
  expect(await jobsPage.countJobs()).toBe(jobsBefore);
});

test('Create a job - clicking outside of the panel does not create the job', async () => {
  const title = uniqueTitle('Overlay job');

  await jobsPage.goto();
  await jobsPage.openJobs();
  const jobsBefore = await jobsPage.countJobs();

  await jobsPage.clickNewJob();
  await jobsPage.fillJobForm({ title, customer: 'Marisol Reyes' });
  await jobsPage.page.getByTestId('overlay').click();

  await jobsPage.assertPanelClosed();
  await jobsPage.assertJobNotInList(title);
  expect(await jobsPage.countJobs()).toBe(jobsBefore);
});

test('A job title with special characters is shown as it is', async () => {
  const title = `O'Brien "HVAC" repair & co`;

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickNewJob();
  await jobsPage.fillJobForm({ title, customer: 'Priya Anand' });
  await jobsPage.saveJob();

  await jobsPage.assertJobCreated(title);
  await jobsPage.assertJobTitleInRow(title);
});

test('New job form - empty defaults', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickNewJob();

  await expect(jobsPage.panel).toContainText('New Job');
  await expect(jobsPage.titleInput).toHaveValue('');
  await expect(jobsPage.customerSelect).toHaveValue('');
  await expect(jobsPage.statusSelect).toHaveValue('lead');
  await expect(jobsPage.dateInput).toHaveValue('');
  await expect(jobsPage.notesInput).toHaveValue('');
  await expect(jobsPage.itemsEmpty).toBeVisible();
  await expect(jobsPage.itemsEmpty).toHaveText('No line items yet.');
});

test('New job form - every status can be selected', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickNewJob();

  const options = await jobsPage.statusSelect.locator('option').evaluateAll((els) =>
    els.map((el) => (el as HTMLOptionElement).value)
  );
  expect(options).toEqual(['lead', 'scheduled', 'in_progress', 'completed', 'cancelled']);

  for (const status of ['scheduled', 'in_progress', 'completed', 'cancelled'] as const) {
    await jobsPage.selectJobStatus(status);
    expect(await jobsPage.selectedJobStatus()).toBe(status);
  }
});

test('New job form - a line item updates the amount and the total', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickNewJob();

  const index = await jobsPage.addLineItem('Diagnostic fee', 2, 75);
  await expect(jobsPage.itemAmount(index)).toHaveText('$150.00');
  await expect(jobsPage.itemsTotal).toHaveText('$150.00');

  await jobsPage.itemQty(index).fill('3');
  await expect(jobsPage.itemAmount(index)).toHaveText('$225.00');
  await expect(jobsPage.itemsTotal).toHaveText('$225.00');
});

test('New job form - a line item can be removed', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickNewJob();

  await jobsPage.addLineItem('First item', 1, 10);
  await jobsPage.addLineItem('Second item', 2, 20);
  expect(await jobsPage.countLineItems()).toBe(2);
  await expect(jobsPage.itemsTotal).toHaveText('$50.00');

  await jobsPage.removeLineItem(0);

  expect(await jobsPage.countLineItems()).toBe(1);
  await expect(jobsPage.itemName(0)).toHaveValue('Second item');
  await expect(jobsPage.itemsTotal).toHaveText('$40.00');
});

test('Empty line item rows are not saved', async () => {
  const title = uniqueTitle('Empty item job');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickNewJob();
  await jobsPage.fillJobForm({ title, customer: 'Priya Anand' });
  await jobsPage.addLineItem('', 0, 0);
  await jobsPage.saveJob();

  await jobsPage.assertJobCreated(title);

  await jobsPage.openJobDetail(title);
  await expect(jobsPage.detailItemsTable).toContainText('No line items on this job.');
  await jobsPage.assertDetailTotal('$0.00');
});

test('A created job is listed on the dashboard', async () => {
  const title = uniqueTitle('Dashboard job');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickNewJob();
  await jobsPage.fillJobForm({ title, customer: 'Dale Whitfield' });
  await jobsPage.saveJob();
  await jobsPage.assertJobCreated(title);

  await jobsPage.openDashboard();
  await expect(jobsPage.recentJobsTable).toContainText(title);
});

test('A created job increases the active jobs stat', async () => {
  await jobsPage.goto();
  await jobsPage.openDashboard();
  const activeBefore = await jobsPage.activeJobsCount();

  await jobsPage.openJobs();
  await jobsPage.clickNewJob();
  await jobsPage.fillJobForm({ title: uniqueTitle('Active job'), customer: 'Dale Whitfield', status: 'lead' });
  await jobsPage.saveJob();

  await jobsPage.openDashboard();
  expect(await jobsPage.activeJobsCount()).toBe(activeBefore + 1);
});

test('A completed job does not count as an active job', async () => {
  await jobsPage.goto();
  await jobsPage.openDashboard();
  const activeBefore = await jobsPage.activeJobsCount();

  await jobsPage.openJobs();
  await jobsPage.clickNewJob();
  await jobsPage.fillJobForm({
    title: uniqueTitle('Completed job'),
    customer: 'Dale Whitfield',
    status: 'completed'
  });
  await jobsPage.saveJob();

  await jobsPage.openDashboard();
  expect(await jobsPage.activeJobsCount()).toBe(activeBefore);
});

test('A created job is still there after a page reload', async () => {
  const title = uniqueTitle('Persisted job');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await jobsPage.clickNewJob();
  await jobsPage.fillJobForm({ title, customer: 'Marisol Reyes' });
  await jobsPage.saveJob();
  await jobsPage.assertJobCreated(title);

  await jobsPage.reload();
  await jobsPage.openJobs();

  await jobsPage.assertJobInList(title);
});
