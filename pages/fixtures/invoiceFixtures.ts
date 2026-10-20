import { JobsPage } from '../JobsPage';
import { InvoicesPage, PayMethod } from '../InvoicesPage';
import { createJob, uniqueTitle } from './jobFixtures';

export interface InvoiceFixtureOptions {
  /** Title of the job the invoice is created from */
  jobTitle?: string;
  /** Customer of the job */
  customer?: string;
  /** Line items of the job, they are copied to the invoice */
  items?: Array<{ name: string; qty: number | string; price: number | string }>;
}

export interface PaymentFixtureOptions {
  amount: number | string;
  method?: PayMethod;
  note?: string;
  date?: string;
}

/**
 * Creates a job and turns it into an invoice.
 * The jobs list has to be open, the invoice detail page is left open.
 * Returns the invoice number (INV-1234).
 */
export async function createInvoice(
  jobsPage: JobsPage,
  invoicesPage: InvoicesPage,
  options: InvoiceFixtureOptions = {}
): Promise<string> {
  const jobTitle = options.jobTitle ?? uniqueTitle('Invoice job');

  await createJob(jobsPage, {
    title: jobTitle,
    customer: options.customer ?? 'Dale Whitfield',
    items: options.items
  });

  await jobsPage.openJobDetail(jobTitle);
  await jobsPage.clickCreateInvoice();
  await invoicesPage.assertToast('Invoice created from job');

  return invoicesPage.invoiceNumber();
}

/**
 * Records a payment on the invoice that is open.
 * The invoice detail page has to be open.
 */
export async function recordPayment(invoicesPage: InvoicesPage, options: PaymentFixtureOptions) {
  await invoicesPage.clickAddPayment();
  await invoicesPage.fillPaymentAmount(options.amount);

  if (options.method) await invoicesPage.selectPayMethod(options.method);
  if (options.date) await invoicesPage.fillPaymentDate(options.date);
  if (options.note !== undefined) await invoicesPage.fillPaymentNote(options.note);

  await invoicesPage.savePayment();
  await invoicesPage.waitForPanelClosed();
}
