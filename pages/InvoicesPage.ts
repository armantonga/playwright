import { Page, expect, Locator } from '@playwright/test';

export type InvoiceStatus = 'unpaid' | 'partial' | 'paid';
export type PayMethod = 'card' | 'cash' | 'check' | 'bank_transfer';

export class InvoicesPage {
  constructor(public page: Page) {}

  /* ------------------------------------------------------------------ *
   * Navigation
   * ------------------------------------------------------------------ */
  // Open the app and confirm the home page loaded
  async goto() {
    await this.page.goto('https://fieldesk.netlify.app/');
    await expect(this.page).toHaveTitle(/FieldDesk/);
  }

  // Navigate to the Invoices section via the sidebar
  async openInvoices() {
    await this.page.getByTestId('nav-invoices').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Invoices');
  }

  async openDashboard() {
    await this.page.getByTestId('nav-dashboard').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Dashboard');
  }

  async reload() {
    await this.page.reload();
    await expect(this.page).toHaveTitle(/FieldDesk/);
  }

  /* ------------------------------------------------------------------ *
   * Locators
   * ------------------------------------------------------------------ */
  get invoicesTable() {
    return this.page.getByTestId('invoices-table');
  }

  get pageTitle() {
    return this.page.getByTestId('page-title');
  }

  get toast() {
    return this.page.getByTestId('toast');
  }

  get panel() {
    return this.page.getByTestId('panel');
  }

  get emptyState() {
    return this.page.getByTestId('empty-state');
  }

  /* --- invoice detail --- */
  get detailTitle() {
    return this.page.getByTestId('invoice-detail-title');
  }

  get detailStatus() {
    return this.page.getByTestId('invoice-detail-status');
  }

  get detailTotal() {
    return this.page.getByTestId('invoice-detail-total');
  }

  get detailPaid() {
    return this.page.getByTestId('invoice-detail-paid');
  }

  get detailBalance() {
    return this.page.getByTestId('invoice-detail-balance');
  }

  get itemsTable() {
    return this.page.getByTestId('invoice-items-table');
  }

  get paymentsTable() {
    return this.page.getByTestId('payments-table');
  }

  get lockedDeleteNote() {
    return this.page.getByTestId('invoice-delete-locked-note');
  }

  get addPaymentButton() {
    return this.page.getByTestId('btn-add-payment');
  }

  get deleteInvoiceButton() {
    return this.page.getByTestId('btn-delete-invoice');
  }

  /* --- payment form --- */
  get paymentAmountInput() {
    return this.page.getByTestId('input-payment-amount');
  }

  get paymentDateInput() {
    return this.page.getByTestId('input-payment-date');
  }

  get paymentNoteInput() {
    return this.page.getByTestId('input-payment-note');
  }

  get savePaymentButton() {
    return this.page.getByTestId('btn-save-payment');
  }

  /* ------------------------------------------------------------------ *
   * Invoices list
   * ------------------------------------------------------------------ */
  // The row of an invoice in the list, located by its invoice number (INV-1234)
  invoiceRow(number: string): Locator {
    return this.invoicesTable.locator('tbody tr').filter({ hasText: number });
  }

  async countInvoices(): Promise<number> {
    return this.invoicesTable.locator('tbody tr[data-testid^="invoice-row-"]').count();
  }

  // Open the detail page of an invoice from the list
  async openInvoice(number: string) {
    await this.invoiceRow(number).locator('a.row-link').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Invoice Detail');
  }

  // Click Delete on an invoice row and wait for the confirmation dialog
  async clickDeleteInvoice(number: string) {
    await this.invoiceRow(number).getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(this.page.getByTestId('confirm-overlay')).toBeVisible();
  }

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
   * Invoice detail
   * ------------------------------------------------------------------ */
  // The invoice number shown on the detail page (INV-1234)
  async invoiceNumber(): Promise<string> {
    return (await this.detailTitle.innerText()).trim();
  }

  // The job an invoice was created from
  async openJobOfInvoice() {
    await this.page.getByTestId('page-content').locator('a.row-link', { hasText: 'Water heater' }).first().click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Job Detail');
  }

  // Go back to the invoices list with the breadcrumb
  async backToInvoices() {
    await this.page.locator('.breadcrumb a').click();
    await expect(this.page.getByTestId('page-title')).toHaveText('Invoices');
  }

  /* ------------------------------------------------------------------ *
   * Payment form
   * ------------------------------------------------------------------ */
  async clickAddPayment() {
    await this.addPaymentButton.click();
    await expect(this.panel).toContainText('Record Payment');
  }

  async fillPaymentAmount(amount: number | string) {
    await this.paymentAmountInput.fill(String(amount));
  }

  async selectPayMethod(method: PayMethod) {
    await this.page.getByTestId(`pay-method-${method}`).click();
  }

  async fillPaymentDate(date: string) {
    await this.paymentDateInput.fill(date);
  }

  async fillPaymentNote(note: string) {
    await this.paymentNoteInput.fill(note);
  }

  async savePayment() {
    await this.savePaymentButton.click();
  }

  // Close the payment form without recording anything
  async cancelPaymentForm() {
    await this.panel.getByRole('button', { name: 'Cancel' }).click();
    await this.waitForPanelClosed();
  }

  // The app removes the slide-over from the page a moment after it is closed,
  // waiting for it keeps a new panel from being wiped by the old one
  async waitForPanelClosed() {
    await expect(this.panel).toHaveCount(0);
  }

  /* ------------------------------------------------------------------ *
   * Payment history
   * ------------------------------------------------------------------ */
  // A row of the payment history, located by its amount
  paymentRow(amount: string): Locator {
    return this.paymentsTable.locator('tbody tr').filter({ hasText: amount });
  }

  async countPayments(): Promise<number> {
    return this.paymentsTable.locator('tbody tr').count();
  }

  // Click Delete on a payment of the history and wait for the confirmation
  async clickDeletePayment(amount: string) {
    await this.paymentRow(amount).getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(this.page.getByTestId('confirm-overlay')).toBeVisible();
  }

  /* ------------------------------------------------------------------ *
   * Dashboard stats
   * ------------------------------------------------------------------ */
  async outstandingBalance(): Promise<string> {
    return this.page.getByTestId('stat-outstanding').locator('.stat-value').innerText();
  }

  async totalCollected(): Promise<string> {
    return this.page.getByTestId('stat-collected').locator('.stat-value').innerText();
  }

  /* ------------------------------------------------------------------ *
   * Assertions
   * ------------------------------------------------------------------ */
  async assertToast(message: string) {
    await expect(this.toast).toHaveText(message);
  }

  async assertInvoiceInList(number: string) {
    await expect(this.invoiceRow(number)).toHaveCount(1);
  }

  async assertInvoiceNotInList(number: string) {
    await expect(this.invoicesTable).not.toContainText(number);
  }

  async assertInvoiceRowContains(number: string, text: string) {
    await expect(this.invoiceRow(number)).toContainText(text);
  }

  async assertInvoiceStatus(number: string, status: InvoiceStatus) {
    await expect(this.invoiceRow(number).getByTestId('status-tag')).toHaveAttribute('data-status', status);
  }

  async assertDetailStatus(status: InvoiceStatus) {
    await expect(this.detailStatus.getByTestId('status-tag')).toHaveAttribute('data-status', status);
  }

  async assertDetailTitle(number: string) {
    await expect(this.detailTitle).toHaveText(number);
  }

  async assertDetailTotal(total: string) {
    await expect(this.detailTotal).toHaveText(total);
  }

  async assertDetailPaid(paid: string) {
    await expect(this.detailPaid).toHaveText(paid);
  }

  async assertDetailBalance(balance: string) {
    await expect(this.detailBalance).toHaveText(balance);
  }

  async assertDetailItemsContains(text: string) {
    await expect(this.itemsTable).toContainText(text);
  }

  async assertNoPayments() {
    await expect(this.paymentsTable).toContainText('No payments recorded yet.');
  }

  async assertPaymentRecorded(amount: string) {
    await expect(this.paymentRow(amount)).toHaveCount(1);
  }

  async assertPaymentNotRecorded(amount: string) {
    await expect(this.paymentRow(amount)).toHaveCount(0);
  }

  async assertPanelClosed() {
    await expect(this.panel).toHaveCount(0);
  }

  async assertPanelOpen() {
    await expect(this.panel).toBeVisible();
  }
}
