import { test, expect } from '@playwright/test';
import { JobsPage } from '../../../pages/JobsPage';
import { createJob, uniqueTitle } from '../../../pages/fixtures/jobFixtures';

let jobsPage!: JobsPage;

test.beforeEach(async ({ page }) => {
  jobsPage = new JobsPage(page);
});

test('Delete a job', async () => {
  const title = uniqueTitle('Delete me');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await createJob(jobsPage, { title, customer: 'Marisol Reyes' });

  await jobsPage.clickDeleteJob(title);
  await jobsPage.confirmDelete();

  await jobsPage.assertJobDeleted(title);
});

test('Delete a job - cancel keeps the job', async () => {
  const title = uniqueTitle('Keep me');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await createJob(jobsPage, { title, customer: 'Marisol Reyes' });

  await jobsPage.clickDeleteJob(title);
  await jobsPage.cancelDelete();

  await jobsPage.assertJobInList(title);
});

test('Delete a job - the confirmation asks for the job', async () => {
  const title = uniqueTitle('Confirm me');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await createJob(jobsPage, { title, customer: 'Marisol Reyes' });

  await jobsPage.clickDeleteJob(title);

  await expect(jobsPage.confirmTitle).toHaveText('Delete job?');
  await expect(jobsPage.confirmMessage).toContainText(title);
});

test('Delete a job - the delete button is not shown twice', async () => {
  await jobsPage.goto();
  await jobsPage.openJobs();

  await expect(jobsPage.jobRow('Water heater replacement').getByRole('button', { name: 'Delete' })).toHaveCount(1);
});

test('Delete a job from the job detail page', async () => {
  const title = uniqueTitle('Delete from detail');

  await jobsPage.goto();
  await jobsPage.openJobs();
  await createJob(jobsPage, { title, customer: 'Priya Anand' });

  await jobsPage.openJobDetail(title);
  await jobsPage.clickDeleteJobFromDetail();
  await jobsPage.confirmDelete();

  // Deleting from the detail page brings the user back to the jobs list
  await expect(jobsPage.pageTitle).toHaveText('Jobs');
  await jobsPage.assertJobDeleted(title);
});
