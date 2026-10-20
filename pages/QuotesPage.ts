import { Page, expect } from '@playwright/test';

export class QuotesPage {
  // The root page is public so other page objects/specs can reuse it
  constructor(public page: Page) {}

  /* ------------------------------------------------------------------ */
  /* Navigation                                                          */
  /* ------------------------------------------------------------------ */

  // Open the app and confirm the home page loaded
  async goto() {
    await this.page.goto('https://fieldesk.netlify.app/');
    await expect(this.page).toHaveTitle(/FieldDesk/);
  }

  // Navigate to the Quotes section via the sidebar
  async openQuotes() {
    await this.page.getByTestId('nav-quotes').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Quotes');
  }

  // Navigate to the Jobs section via the sidebar
  async openJobs() {
    await this.page.getByTestId('nav-jobs').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Jobs');
  }

  /* ------------------------------------------------------------------ */
  /* Locators                                                            */
  /* ------------------------------------------------------------------ */

  // The quotes table
  get quotesTable() {
    return this.page.getByTestId('quotes-table');
  }

  // Every quote row of the quotes list
  quoteRows() {
    return this.page.locator('[data-testid^="quote-row-"]');
  }

  // A single quote row located by its title
  quoteRow(title: string) {
    return this.quotesTable.locator('tbody tr').filter({ hasText: title });
  }

  // A single quote row located by its id
  quoteRowById(id: string) {
    return this.page.getByTestId(`quote-row-${id}`);
  }

  // The name input of a line item row in the quote editor
  itemNameField(index: number) {
    return this.page.getByTestId('panel').getByTestId(`item-name-quote-${index}`);
  }

  // The qty input of a line item row in the quote editor
  itemQtyField(index: number) {
    return this.page.getByTestId('panel').getByTestId(`item-qty-quote-${index}`);
  }

  // The price input of a line item row in the quote editor
  itemPriceField(index: number) {
    return this.page.getByTestId('panel').getByTestId(`item-price-quote-${index}`);
  }

  // A row of the line items table on the quote detail page
  detailItemRow(name: string) {
    return this.page.getByTestId('quote-items-table').locator('tbody tr').filter({ hasText: name });
  }

  /* ------------------------------------------------------------------ */
  /* Quote form actions                                                  */
  /* ------------------------------------------------------------------ */

  // Open the new quote slide-over panel
  async clickNewQuote() {
    await this.page.getByTestId('btn-new-quote').click();
    await expect(this.page.getByTestId('panel')).toContainText('New Quote');
  }

  // Open the edit slide-over of an existing quote and wait for the form
  async clickEditQuote(title: string) {
    await this.quoteRow(title).getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(this.page.getByTestId('panel')).toContainText('Edit Quote');
  }

  // Open the edit slide-over from the quote detail page
  async clickEditQuoteFromDetail() {
    await this.page.getByTestId('btn-edit-quote').click();
    await expect(this.page.getByTestId('panel')).toContainText('Edit Quote');
  }

  // Fill in the quote title
  async fillTitle(title: string) {
    await this.page.getByTestId('input-quote-title').fill(title);
  }

  // Pick a customer in the customer dropdown
  async selectCustomer(name: string) {
    await this.page.getByTestId('select-quote-customer').selectOption({ label: name });
  }

  // Pick a status in the status dropdown (draft, sent, approved, declined)
  async selectStatus(status: string) {
    await this.page.getByTestId('select-quote-status').selectOption(status);
  }

  // Set the expiry date of the quote (YYYY-MM-DD)
  async fillExpires(date: string) {
    await this.page.getByTestId('input-quote-expires').fill(date);
  }

  // Add an empty line item row to the quote editor
  async addLineItem() {
    await this.page.getByTestId('btn-add-item-quote').click();
  }

  // Fill in name, qty and price of a line item row
  async fillLineItem(index: number, name: string, qty: string, price: string) {
    await this.itemNameField(index).fill(name);
    await this.itemQtyField(index).fill(qty);
    await this.itemPriceField(index).fill(price);
  }

  // Remove a line item row from the quote editor
  async removeLineItem(index: number) {
    await this.page.getByTestId('panel').getByTestId(`item-remove-quote-${index}`).click();
  }

  // Save the quote (creates a new one or updates the edited one)
  async saveQuote() {
    await this.page.getByTestId('btn-save-quote').click();
  }

  // Close the panel without saving anything
  async cancelQuoteForm() {
    await this.page.getByTestId('panel').getByRole('button', { name: 'Cancel' }).click();
    await expect(this.page.getByTestId('panel')).toHaveCount(0);
  }

  /* ------------------------------------------------------------------ */
  /* Quote list / detail actions                                         */
  /* ------------------------------------------------------------------ */

  // Open the detail page of a quote by clicking its title link
  async openQuoteDetail(title: string) {
    await this.quoteRow(title).locator('a.row-link').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Quote Detail');
  }

  // Open the detail page of a quote by its id
  async openQuoteDetailById(id: string) {
    await this.page.getByTestId(`quote-link-${id}`).click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Quote Detail');
  }

  // Click Delete on a quote row and wait for the confirmation dialog
  async clickDeleteQuote(title: string) {
    await this.quoteRow(title).getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(this.page.getByTestId('confirm-overlay')).toBeVisible();
  }

  // Click Delete on the quote detail page and wait for the confirmation dialog
  async clickDeleteQuoteFromDetail() {
    await this.page.getByTestId('btn-delete-quote').click();
    await expect(this.page.getByTestId('confirm-overlay')).toBeVisible();
  }

  // Accept the confirmation dialog
  async confirmDelete() {
    await this.page.getByTestId('confirm-ok').click();
  }

  // The confirmation dialog asks for the deletion of the given quote
  async assertDeleteConfirmation(title: string) {
    await expect(this.page.getByTestId('confirm-overlay')).toContainText('Delete quote?');
    await expect(this.page.getByTestId('confirm-overlay')).toContainText(title);
  }

  // Dismiss the confirmation dialog
  async cancelDelete() {
    await this.page.getByTestId('confirm-cancel').click();
    await expect(this.page.getByTestId('confirm-overlay')).toBeHidden();
  }

  // Convert the quote of the detail page into a job
  async convertToJob() {
    await this.page.getByTestId('btn-convert-job').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Job Detail');
  }

  // Convert the quote of the detail page into a job (alias of convertToJob)
  async clickConvertToJob() {
    await this.convertToJob();
  }

  // Open the job a quote was converted into
  async viewConvertedJob() {
    await this.page.getByRole('button', { name: 'View Job' }).click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Job Detail');
  }

  /* ------------------------------------------------------------------ */
  /* Assertions                                                          */
  /* ------------------------------------------------------------------ */

  // The toast shows the given message
  async assertToast(message: string) {
    await expect(this.page.getByTestId('toast')).toHaveText(message);
  }

  // The quote editor is still open
  async assertPanelOpen() {
    await expect(this.page.getByTestId('panel')).toBeVisible();
  }

  // The quote was created and shows up in the list
  async assertQuoteCreated(title: string) {
    await expect(this.page.getByTestId('toast')).toHaveText('Quote created');
    await expect(this.quoteRow(title)).toHaveCount(1);
  }

  // The quote was not created
  async assertQuoteNotCreated(title: string) {
    await expect(this.quotesTable).not.toContainText(title);
  }

  // The list holds the given number of quotes
  async assertQuoteCount(count: number) {
    await expect(this.quoteRows()).toHaveCount(count);
  }

  // The title shown on a quote row
  async assertRowTitle(title: string) {
    await expect(this.quoteRow(title).locator('td').first()).toHaveText(title);
  }

  // The customer shown on a quote row
  async assertRowCustomer(title: string, customer: string) {
    await expect(this.quoteRow(title).locator('td').nth(1)).toHaveText(customer);
  }

  // The status shown on a quote row
  async assertRowStatus(title: string, status: string) {
    await expect(this.quoteRow(title).getByTestId('status-tag')).toHaveAttribute('data-status', status);
  }

  // The label of the status tag shown on a quote row
  async assertRowStatusText(title: string, label: string) {
    await expect(this.quoteRow(title).getByTestId('status-tag')).toHaveText(label);
  }

  // The total shown on a quote row
  async assertRowTotal(title: string, total: string) {
    await expect(this.quoteRow(title).locator('td').nth(4)).toHaveText(total);
  }

  // The created date shown on a quote row is today
  async assertRowCreatedToday(title: string) {
    const iso = new Date().toISOString().slice(0, 10);
    const shown = new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    await expect(this.quoteRow(title).locator('td').nth(3)).toHaveText(shown);
  }

  // The newest quote of the list is the given one
  async assertFirstQuoteIs(title: string) {
    await expect(this.quoteRows().first().locator('td').first()).toHaveText(title);
  }

  // The second quote of the list is the given one
  async assertSecondQuoteIs(title: string) {
    await expect(this.quoteRows().nth(1).locator('td').first()).toHaveText(title);
  }

  // The title of the quote detail page
  async assertDetailTitle(title: string) {
    await expect(this.page.getByTestId('quote-detail-title')).toHaveText(title);
  }

  // The status of the quote detail page
  async assertDetailStatus(status: string) {
    await expect(this.page.getByTestId('quote-detail-status').getByTestId('status-tag')).toHaveAttribute('data-status', status);
  }

  // The customer of the quote detail page
  async assertDetailCustomer(name: string) {
    await expect(this.page.getByText(`Customer: ${name}`)).toBeVisible();
  }

  // The expiry date of the quote detail page
  async assertDetailExpires(date: string) {
    await expect(this.page.getByText(`Expires: ${date}`)).toBeVisible();
  }

  // The total of the quote detail page
  async assertDetailTotal(total: string) {
    await expect(this.page.getByTestId('quote-detail-total')).toHaveText(total);
  }

  // A line item of the quote detail page
  async assertDetailItem(name: string, qty: string, price: string, amount: string) {
    const row = this.detailItemRow(name);
    await expect(row.locator('td').nth(0)).toHaveText(name);
    await expect(row.locator('td').nth(1)).toHaveText(qty);
    await expect(row.locator('td').nth(2)).toHaveText(price);
    await expect(row.locator('td').nth(3)).toHaveText(amount);
  }

  // The quote detail page lists no line items
  async assertDetailHasNoItems() {
    await expect(this.page.getByTestId('quote-items-table')).toContainText('No line items on this quote.');
  }

  // The amount of a line item row in the quote editor
  async assertEditorItemAmount(index: number, amount: string) {
    await expect(this.page.getByTestId('panel').getByTestId(`item-amount-quote-${index}`)).toHaveText(amount);
  }

  // The grand total of the quote editor
  async assertEditorTotal(total: string) {
    await expect(this.page.getByTestId('panel').getByTestId('items-total-quote')).toHaveText(total);
  }

  // The quote editor shows the empty line items hint
  async assertEditorHasNoItems() {
    await expect(this.page.getByTestId('panel').getByTestId('items-empty-quote')).toBeVisible();
  }

  // The status dropdown of the quote form holds the given value
  async assertFormStatus(status: string) {
    await expect(this.page.getByTestId('select-quote-status')).toHaveValue(status);
  }

  // The expiry input of the quote form holds the given value
  async assertFormExpires(date: string) {
    await expect(this.page.getByTestId('input-quote-expires')).toHaveValue(date);
  }

  // The quote form is prefilled with the current values of the quote
  async assertFormPrefilled(title: string, customerId: string, status: string, expires: string) {
    await expect(this.page.getByTestId('input-quote-title')).toHaveValue(title);
    await expect(this.page.getByTestId('select-quote-customer')).toHaveValue(customerId);
    await expect(this.page.getByTestId('select-quote-status')).toHaveValue(status);
    await expect(this.page.getByTestId('input-quote-expires')).toHaveValue(expires);
  }

  // The quote was updated and the list shows the new values
  async assertQuoteUpdated(title: string, customer: string, status: string) {
    await expect(this.page.getByTestId('toast')).toHaveText('Quote updated');
    await expect(this.quoteRow(title)).toHaveCount(1);
    await expect(this.quoteRow(title).locator('td').nth(1)).toHaveText(customer);
    await expect(this.quoteRow(title).getByTestId('status-tag')).toHaveAttribute('data-status', status);
  }

  // The quote is still listed with the given total
  async assertRowKept(title: string, total: string) {
    await expect(this.quoteRow(title)).toHaveCount(1);
    await expect(this.quoteRow(title).locator('td').nth(4)).toHaveText(total);
  }

  // The quote was deleted and is gone from the list
  async assertQuoteDeleted(title: string) {
    await expect(this.page.getByTestId('toast')).toHaveText('Quote deleted');
    await expect(this.quoteRow(title)).toHaveCount(0);
  }

  // The quote is still listed
  async assertQuoteStillPresent(title: string) {
    await expect(this.quoteRow(title)).toHaveCount(1);
  }

  // The title of the job detail page
  async assertJobTitle(title: string) {
    await expect(this.page.getByTestId('job-detail-title')).toHaveText(title);
  }

  // The status of the job detail page
  async assertJobStatus(status: string) {
    await expect(this.page.getByTestId('job-detail-status').getByTestId('status-tag')).toHaveAttribute('data-status', status);
  }

  // The total of the job detail page
  async assertJobTotal(total: string) {
    await expect(this.page.getByTestId('job-detail-total')).toHaveText(total);
  }

  // The notes of the job detail page
  async assertJobNotes(notes: string) {
    await expect(this.page.getByTestId('job-detail-notes')).toHaveText(notes);
  }

  // The jobs list holds the given number of jobs
  async assertJobCount(count: number) {
    await expect(this.page.getByTestId('jobs-table').locator('[data-testid^="job-row-"]')).toHaveCount(count);
  }

  // The quote detail page offers the job of a converted quote instead of the convert button
  async assertConvertedToJob() {
    await expect(this.page.getByTestId('btn-convert-job')).toHaveCount(0);
    await expect(this.page.getByRole('button', { name: 'View Job' })).toBeVisible();
  }

  // The quote was converted into a job (alias kept for the jobs suite)
  async assertConverted() {
    await expect(this.page.getByTestId('toast')).toHaveText('Quote converted to job');
  }
}
