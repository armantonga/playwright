import { test } from '@playwright/test';
import { QuotesPage } from '../../../pages/QuotesPage';

let quotesPage!: QuotesPage;

test.beforeEach(async ({ page }) => {
  quotesPage = new QuotesPage(page);
});

// Open the quotes list of the app
async function openQuotesList() {
  await quotesPage.goto();
  await quotesPage.openQuotes();
}

const SENT_QUOTE = 'Bathroom remodel — plumbing rough-in';
const DRAFT_QUOTE = 'Tankless water heater upgrade';

test.describe('Update quote', () => {
  test('Update title, customer, status and expiry of a quote', async () => {
    const updatedTitle = `Tankless upgrade v2 ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickEditQuote(DRAFT_QUOTE);
    await quotesPage.assertFormPrefilled(DRAFT_QUOTE, 'cust_002', 'draft', '2026-07-16');

    await quotesPage.fillTitle(updatedTitle);
    await quotesPage.selectCustomer('Marisol Reyes');
    await quotesPage.selectStatus('approved');
    await quotesPage.fillExpires('2026-08-15');
    await quotesPage.saveQuote();

    await quotesPage.assertQuoteUpdated(updatedTitle, 'Marisol Reyes', 'approved');
    await quotesPage.assertQuoteNotCreated(DRAFT_QUOTE);

    await quotesPage.openQuoteDetail(updatedTitle);
    await quotesPage.assertDetailExpires('Aug 15, 2026');
    await quotesPage.assertDetailCustomer('Marisol Reyes');
  });

  test('Update only the title keeps customer, status and total untouched', async () => {
    const updatedTitle = `Remodel estimate ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickEditQuote(SENT_QUOTE);
    await quotesPage.fillTitle(updatedTitle);
    await quotesPage.saveQuote();

    await quotesPage.assertQuoteUpdated(updatedTitle, 'Priya Anand', 'sent');
    await quotesPage.assertRowKept(updatedTitle, '$1,730.00');
  });

  test('Update a line item recalculates the amount and the total', async () => {
    await openQuotesList();
    await quotesPage.clickEditQuote(SENT_QUOTE);
    await quotesPage.assertEditorItemAmount(0, '$1,520.00');
    await quotesPage.assertEditorTotal('$1,730.00');

    await quotesPage.fillLineItem(0, 'Rough-in Labor', '20', '95');
    await quotesPage.assertEditorItemAmount(0, '$1,900.00');
    await quotesPage.assertEditorTotal('$2,110.00');
    await quotesPage.saveQuote();

    await quotesPage.assertQuoteUpdated(SENT_QUOTE, 'Priya Anand', 'sent');
    await quotesPage.assertRowKept(SENT_QUOTE, '$2,110.00');

    await quotesPage.openQuoteDetail(SENT_QUOTE);
    await quotesPage.assertDetailItem('Rough-in Labor', '20', '$95.00', '$1,900.00');
    await quotesPage.assertDetailTotal('$2,110.00');
  });

  test('Remove a line item recalculates the total', async () => {
    await openQuotesList();
    await quotesPage.clickEditQuote(SENT_QUOTE);
    await quotesPage.removeLineItem(1);
    await quotesPage.assertEditorTotal('$1,520.00');
    await quotesPage.saveQuote();

    await quotesPage.assertQuoteUpdated(SENT_QUOTE, 'Priya Anand', 'sent');
    await quotesPage.assertRowKept(SENT_QUOTE, '$1,520.00');

    await quotesPage.openQuoteDetail(SENT_QUOTE);
    await quotesPage.assertDetailItem('Rough-in Labor', '16', '$95.00', '$1,520.00');
    await quotesPage.assertDetailTotal('$1,520.00');
  });

  test('Update quote - cancel does not save changes', async () => {
    const neverSaved = `Never saved ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickEditQuote(DRAFT_QUOTE);
    await quotesPage.fillTitle(neverSaved);
    await quotesPage.selectStatus('declined');
    await quotesPage.cancelQuoteForm();

    await quotesPage.assertQuoteNotCreated(neverSaved);
    await quotesPage.assertQuoteStillPresent(DRAFT_QUOTE);
    await quotesPage.assertRowStatus(DRAFT_QUOTE, 'draft');
  });

  test('Update quote from the detail page stays on the detail page', async () => {
    const updatedTitle = `Roof inspection ${Date.now()}`;

    await openQuotesList();
    await quotesPage.openQuoteDetail(DRAFT_QUOTE);
    await quotesPage.clickEditQuoteFromDetail();
    await quotesPage.assertFormPrefilled(DRAFT_QUOTE, 'cust_002', 'draft', '2026-07-16');

    await quotesPage.fillTitle(updatedTitle);
    await quotesPage.saveQuote();

    await quotesPage.assertToast('Quote updated');
    await quotesPage.assertDetailTitle(updatedTitle);
  });
});
