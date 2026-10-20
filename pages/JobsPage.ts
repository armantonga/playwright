import { Page, expect, Locator } from '@playwright/test';

export type JobStatus = 'lead' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface JobFormData {
  title?: string;
  customer?: string;
  status?: JobStatus;
  date?: string;
  notes?: string;
}

export class JobsPage {
  // The root page is public so other page objects/specs can reuse it
  constructor(public page: Page) {}

  /* ------------------------------------------------------------------ *
   * Navigation
   * ------------------------------------------------------------------ */
  // Open the app and confirm the home page loaded
  async goto() {
    await this.page.goto('https://fieldesk.netlify.app/');
    await expect(this.page).toHaveTitle(/FieldDesk/);
  }

  // Navigate to the Jobs section via the sidebar
  async openJobs() {
    await this.page.getByTestId('nav-jobs').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Jobs');
  }

  async openDashboard() {
    await this.page.getByTestId('nav-dashboard').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Dashboard');
  }

  async openCustomers() {
    await this.page.getByTestId('nav-customers').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Customers');
  }

  // Reload the app (the data is kept in local storage)
  async reload() {
    await this.page.reload();
    await expect(this.page).toHaveTitle(/FieldDesk/);
  }

  /* ------------------------------------------------------------------ *
   * Locators
   * ------------------------------------------------------------------ */
  get jobsTable() {
    return this.page.getByTestId('jobs-table');
  }

  get pageTitle() {
    return this.page.getByTestId('page-title');
  }

  get panel() {
    return this.page.getByTestId('panel');
  }

  get toast() {
    return this.page.getByTestId('toast');
  }

  get titleInput() {
    return this.page.getByTestId('input-job-title');
  }

  get customerSelect() {
    return this.page.getByTestId('select-job-customer');
  }

  get statusSelect() {
    return this.page.getByTestId('select-job-status');
  }

  get dateInput() {
    return this.page.getByTestId('input-job-date');
  }

  get notesInput() {
    return this.page.getByTestId('input-job-notes');
  }

  get itemsBox() {
    return this.page.getByTestId('items-box-job');
  }

  get itemsTotal() {
    return this.page.getByTestId('items-total-job');
  }

  get itemsEmpty() {
    return this.page.getByTestId('items-empty-job');
  }

  // Locate the table row of a job by title
  jobRow(title: string): Locator {
    return this.jobsTable.locator('tbody tr').filter({ hasText: title });
  }

  // Locate a line item row of the items editor by index
  itemRow(index: number): Locator {
    return this.page.getByTestId(`item-row-job-${index}`);
  }

  itemName(index: number) {
    return this.page.getByTestId(`item-name-job-${index}`);
  }

  itemQty(index: number) {
    return this.page.getByTestId(`item-qty-job-${index}`);
  }

  itemPrice(index: number) {
    return this.page.getByTestId(`item-price-job-${index}`);
  }

  itemAmount(index: number) {
    return this.page.getByTestId(`item-amount-job-${index}`);
  }

  /* ------------------------------------------------------------------ *
   * Jobs list
   * ------------------------------------------------------------------ */
  async clickNewJob() {
    await this.page.getByTestId('btn-new-job').click();
    await expect(this.panel).toBeVisible();
  }

  // Open the edit slide-over of an existing job and wait for the form
  async clickEditJob(title: string) {
    await this.jobRow(title).getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(this.panel).toContainText('Edit Job');
  }

  // Click Delete on a job row and wait for the confirmation dialog
  async clickDeleteJob(title: string) {
    await this.jobRow(title).getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(this.page.getByTestId('confirm-overlay')).toBeVisible();
  }

  // Open a job from the list by clicking its title link
  async openJobDetail(title: string) {
    await this.jobRow(title).locator('a.row-link').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Job Detail');
  }

  // Number of jobs currently listed
  async countJobs(): Promise<number> {
    return this.jobsTable.locator('tbody tr').count();
  }

  /* ------------------------------------------------------------------ *
   * Job form
   * ------------------------------------------------------------------ */
  async fillJobForm(data: JobFormData) {
    if (data.title !== undefined) await this.titleInput.fill(data.title);
    if (data.customer !== undefined) await this.customerSelect.selectOption({ label: data.customer });
    if (data.status !== undefined) await this.statusSelect.selectOption(data.status);
    if (data.date !== undefined) await this.dateInput.fill(data.date);
    if (data.notes !== undefined) await this.notesInput.fill(data.notes);
  }

  async fillJobTitle(title: string) {
    await this.titleInput.fill(title);
  }

  async fillJobNotes(notes: string) {
    await this.notesInput.fill(notes);
  }

  async fillJobDate(date: string) {
    await this.dateInput.fill(date);
  }

  async selectJobCustomer(customer: string) {
    await this.customerSelect.selectOption({ label: customer });
  }

  async selectJobStatus(status: JobStatus) {
    await this.statusSelect.selectOption(status);
  }

  // The customer currently selected in the form
  async selectedCustomerName(): Promise<string> {
    return this.customerSelect.evaluate((el: HTMLSelectElement) =>
      el.selectedOptions[0]?.textContent?.trim() ?? ''
    );
  }

  // The status currently selected in the form
  async selectedJobStatus(): Promise<string> {
    return this.statusSelect.inputValue();
  }

  /* ------------------------------------------------------------------ *
   * Line items editor
   * ------------------------------------------------------------------ */
  // Add a line item row and fill it in. Returns the index of the new row.
  async addLineItem(name: string, qty: number | string, price: number | string): Promise<number> {
    const index = await this.page.locator('[data-testid^="item-row-job-"]').count();
    await this.page.getByTestId('btn-add-item-job').click();
    await expect(this.itemRow(index)).toBeVisible();
    await this.itemName(index).fill(name);
    await this.itemQty(index).fill(String(qty));
    await this.itemPrice(index).fill(String(price));
    return index;
  }

  // Fill an already existing line item row (used for partial updates)
  async fillLineItem(index: number, name: string, qty: number | string, price: number | string) {
    await this.itemName(index).fill(name);
    await this.itemQty(index).fill(String(qty));
    await this.itemPrice(index).fill(String(price));
  }

  async removeLineItem(index: number) {
    await this.page.getByTestId(`item-remove-job-${index}`).click();
  }

  async countLineItems(): Promise<number> {
    return this.page.locator('[data-testid^="item-row-job-"]').count();
  }

  /* ------------------------------------------------------------------ *
   * Form actions
   * ------------------------------------------------------------------ */
  async saveJob() {
    await this.page.getByTestId('btn-save-job').click();
  }

  // Close the form without saving anything
  async cancelJobForm() {
    await this.panel.getByRole('button', { name: 'Cancel' }).click();
    await this.waitForPanelClosed();
  }

  // Close the form with the X button
  async closeJobPanel() {
    await this.panel.getByTestId('panel-close').click();
    await this.waitForPanelClosed();
  }

  // The app removes the slide-over from the page a moment after it is closed,
  // waiting for it keeps a new panel from being wiped by the old one
  async waitForPanelClosed() {
    await expect(this.panel).toHaveCount(0);
  }

  /* ------------------------------------------------------------------ *
   * Confirm dialog
   * ------------------------------------------------------------------ */
  async confirmDelete() {
    await this.page.getByTestId('confirm-ok').click();
  }

  async cancelDelete() {
    await this.page.getByTestId('confirm-cancel').click();
    await expect(this.page.getByTestId('confirm-overlay')).toBeHidden();
  }

  get confirmTitle() {
    return this.page.locator('#confirm-title');
  }

  get confirmMessage() {
    return this.page.locator('#confirm-msg');
  }

  /* ------------------------------------------------------------------ *
   * Job detail
   * ------------------------------------------------------------------ */
  get detailTitle() {
    return this.page.getByTestId('job-detail-title');
  }

  get detailStatus() {
    return this.page.getByTestId('job-detail-status');
  }

  get detailNotes() {
    return this.page.getByTestId('job-detail-notes');
  }

  get detailTotal() {
    return this.page.getByTestId('job-detail-total');
  }

  get detailItemsTable() {
    return this.page.getByTestId('job-items-table');
  }

  // Edit the job from the detail page
  async clickEditJobFromDetail() {
    await this.page.getByTestId('btn-edit-job').click();
    await expect(this.panel).toContainText('Edit Job');
  }

  // Delete the job from the detail page
  async clickDeleteJobFromDetail() {
    await this.page.getByTestId('btn-delete-job').click();
    await expect(this.page.getByTestId('confirm-overlay')).toBeVisible();
  }

  // Create the invoice of the job and follow it
  async clickCreateInvoice() {
    await this.page.getByTestId('btn-create-invoice').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Invoice Detail');
  }

  // Go back to the jobs list with the breadcrumb
  async backToJobs() {
    await this.page.locator('.breadcrumb a').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Jobs');
  }

  /* ------------------------------------------------------------------ *
   * Dashboard
   * ------------------------------------------------------------------ */
  get recentJobsTable() {
    return this.page.getByTestId('recent-jobs-table');
  }

  get activeJobsStat() {
    return this.page.getByTestId('stat-active-jobs').locator('.stat-value');
  }

  async activeJobsCount(): Promise<number> {
    return Number(await this.activeJobsStat.innerText());
  }

  /* ------------------------------------------------------------------ *
   * Assertions
   * ------------------------------------------------------------------ */
  async assertToast(message: string) {
    await expect(this.toast).toHaveText(message);
  }

  async assertJobInList(title: string) {
    await expect(this.jobRow(title)).toHaveCount(1);
  }

  async assertJobNotInList(title: string) {
    await expect(this.jobsTable).not.toContainText(title);
  }

  async assertJobRowContains(title: string, text: string) {
    await expect(this.jobRow(title)).toContainText(text);
  }

  async assertJobRowNotContains(title: string, text: string) {
    await expect(this.jobRow(title)).not.toContainText(text);
  }

  // The title shown in the first cell of a job row
  async assertJobTitleInRow(title: string) {
    await expect(this.jobRow(title).locator('td').first()).toHaveText(title);
  }

  async assertJobStatus(title: string, status: JobStatus) {
    const tag = this.jobRow(title).getByTestId('status-tag');
    await expect(tag).toHaveAttribute('data-status', status);
    await expect(tag).toHaveText(this.statusLabel(status));
  }

  async assertJobCreated(title: string) {
    await this.assertToast('Job created');
    await this.assertJobInList(title);
  }

  async assertJobUpdated(title: string) {
    await this.assertToast('Job updated');
    await this.assertJobInList(title);
  }

  async assertJobDeleted(title: string) {
    await this.assertToast('Job deleted');
    await expect(this.jobRow(title)).toHaveCount(0);
  }

  async assertPanelClosed() {
    await expect(this.panel).toHaveCount(0);
  }

  async assertPanelOpen() {
    await expect(this.panel).toBeVisible();
  }

  async assertDetailTitle(title: string) {
    await expect(this.detailTitle).toHaveText(title);
  }

  async assertDetailStatus(status: JobStatus) {
    await expect(this.detailStatus.getByTestId('status-tag')).toHaveAttribute('data-status', status);
  }

  async assertDetailNotes(notes: string) {
    await expect(this.detailNotes).toContainText(notes);
  }

  async assertDetailTotal(total: string) {
    await expect(this.detailTotal).toHaveText(total);
  }

  async assertDetailItemsContains(text: string) {
    await expect(this.detailItemsTable).toContainText(text);
  }

  async assertDetailCustomer(customer: string) {
    await expect(this.page.getByTestId('page-content')).toContainText(customer);
  }

  private statusLabel(status: JobStatus): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
