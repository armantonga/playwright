import { JobsPage, JobStatus } from '../JobsPage';

export interface CreateJobOptions {
  title: string;
  customer?: string;
  status?: JobStatus;
  date?: string;
  notes?: string;
  items?: Array<{ name: string; qty: number | string; price: number | string }>;
}

/**
 * Creates a job through the UI so tests do not depend on the seeded data.
 * The job is left in the jobs list, the caller can continue from there.
 */
export async function createJob(jobsPage: JobsPage, options: CreateJobOptions): Promise<string> {
  await jobsPage.clickNewJob();
  await jobsPage.fillJobForm({
    title: options.title,
    customer: options.customer,
    status: options.status,
    date: options.date,
    notes: options.notes,
  });

  for (const item of options.items ?? []) {
    await jobsPage.addLineItem(item.name, item.qty, item.price);
  }

  await jobsPage.saveJob();
  await jobsPage.waitForPanelClosed();
  await jobsPage.assertJobCreated(options.title);
  return options.title;
}

/** A title that is unique for every test run. */
export function uniqueTitle(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}
