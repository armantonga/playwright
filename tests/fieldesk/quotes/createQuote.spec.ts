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

test.describe('Create quote', () => {
  test('Create quote with line items', async () => {
    const title = `Kitchen faucet replacement ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickNewQuote();
    await quotesPage.fillTitle(title);
    await quotesPage.selectCustomer('Marisol Reyes');
    await quotesPage.selectStatus('sent');
    await quotesPage.fillExpires('2026-12-31');
    await quotesPage.addLineItem();
    await quotesPage.fillLineItem(0, 'Faucet unit', '2', '85.50');
    await quotesPage.assertEditorItemAmount(0, '$171.00');
    await quotesPage.assertEditorTotal('$171.00');
    await quotesPage.saveQuote();

    await quotesPage.assertQuoteCreated(title);
    await quotesPage.assertRowCustomer(title, 'Marisol Reyes');
    await quotesPage.assertRowStatus(title, 'sent');
    await quotesPage.assertRowTotal(title, '$171.00');
  });

  test('Create quote without line items', async () => {
    const title = `Site survey only ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickNewQuote();
    await quotesPage.fillTitle(title);
    await quotesPage.selectCustomer('Dale Whitfield');
    await quotesPage.assertEditorHasNoItems();
    await quotesPage.assertEditorTotal('$0.00');
    await quotesPage.saveQuote();

    await quotesPage.assertQuoteCreated(title);
    await quotesPage.assertRowTotal(title, '$0.00');

    await quotesPage.openQuoteDetail(title);
    await quotesPage.assertDetailTotal('$0.00');
    await quotesPage.assertDetailHasNoItems();
  });

  test('Create quote with multiple line items calculates every amount and the total', async () => {
    const title = `Bathroom rough-in quote ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickNewQuote();
    await quotesPage.fillTitle(title);
    await quotesPage.selectCustomer('Priya Anand');
    await quotesPage.addLineItem();
    await quotesPage.fillLineItem(0, 'Rough-in Labor', '16', '95');
    await quotesPage.addLineItem();
    await quotesPage.fillLineItem(1, 'Copper Pipe (50ft)', '1', '210');
    await quotesPage.assertEditorItemAmount(0, '$1,520.00');
    await quotesPage.assertEditorItemAmount(1, '$210.00');
    await quotesPage.assertEditorTotal('$1,730.00');
    await quotesPage.saveQuote();

    await quotesPage.assertQuoteCreated(title);
    await quotesPage.assertRowTotal(title, '$1,730.00');

    await quotesPage.openQuoteDetail(title);
    await quotesPage.assertDetailItem('Rough-in Labor', '16', '$95.00', '$1,520.00');
    await quotesPage.assertDetailItem('Copper Pipe (50ft)', '1', '$210.00', '$210.00');
    await quotesPage.assertDetailTotal('$1,730.00');
  });

  test('Create quote without a title shows a validation message', async () => {
    await openQuotesList();
    await quotesPage.clickNewQuote();
    await quotesPage.selectCustomer('Marisol Reyes');
    await quotesPage.saveQuote();

    await quotesPage.assertToast('Quote title is required');
    await quotesPage.assertPanelOpen();
    await quotesPage.assertQuoteCount(2);
  });

  test('Create quote without a customer shows a validation message', async () => {
    const title = `Quote without customer ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickNewQuote();
    await quotesPage.fillTitle(title);
    await quotesPage.saveQuote();

    await quotesPage.assertToast('Please select a customer');
    await quotesPage.assertPanelOpen();
    await quotesPage.assertQuoteNotCreated(title);
    await quotesPage.assertQuoteCount(2);
  });

  test('Create quote - cancel does not create a quote', async () => {
    const title = `Cancelled quote ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickNewQuote();
    await quotesPage.fillTitle(title);
    await quotesPage.selectCustomer('Dale Whitfield');
    await quotesPage.addLineItem();
    await quotesPage.fillLineItem(0, 'Diagnostic visit', '1', '75');
    await quotesPage.cancelQuoteForm();

    await quotesPage.assertQuoteNotCreated(title);
    await quotesPage.assertQuoteCount(2);
  });

  test('Create quote defaults to draft status and no expiry date', async () => {
    const title = `Default settings quote ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickNewQuote();
    await quotesPage.assertFormStatus('draft');
    await quotesPage.assertFormExpires('');
    await quotesPage.fillTitle(title);
    await quotesPage.selectCustomer('Priya Anand');
    await quotesPage.saveQuote();

    await quotesPage.assertQuoteCreated(title);
    await quotesPage.assertRowStatus(title, 'draft');

    await quotesPage.openQuoteDetail(title);
    await quotesPage.assertDetailStatus('draft');
    await quotesPage.assertDetailExpires('—');
  });

  test('New quote is listed first because the list is sorted newest first', async () => {
    const title = `Newest quote ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickNewQuote();
    await quotesPage.fillTitle(title);
    await quotesPage.selectCustomer('Marisol Reyes');
    await quotesPage.saveQuote();

    await quotesPage.assertQuoteCreated(title);
    await quotesPage.assertFirstQuoteIs(title);
    await quotesPage.assertRowCreatedToday(title);
  });

  test('Create quote with an empty line item keeps it as an untitled item', async () => {
    const title = `Untitled item quote ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickNewQuote();
    await quotesPage.fillTitle(title);
    await quotesPage.selectCustomer('Dale Whitfield');
    await quotesPage.addLineItem();
    await quotesPage.fillLineItem(0, '', '0', '40');
    await quotesPage.assertEditorItemAmount(0, '$0.00');
    await quotesPage.saveQuote();

    await quotesPage.assertQuoteCreated(title);

    await quotesPage.openQuoteDetail(title);
    await quotesPage.assertDetailItem('Untitled item', '0', '$40.00', '$0.00');
  });

  test('Create quote drops a completely empty line item', async () => {
    const title = `Empty row quote ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickNewQuote();
    await quotesPage.fillTitle(title);
    await quotesPage.selectCustomer('Dale Whitfield');
    await quotesPage.addLineItem();
    await quotesPage.fillLineItem(0, '', '0', '0');
    await quotesPage.saveQuote();

    await quotesPage.assertQuoteCreated(title);
    await quotesPage.assertRowTotal(title, '$0.00');

    await quotesPage.openQuoteDetail(title);
    await quotesPage.assertDetailHasNoItems();
  });
});
