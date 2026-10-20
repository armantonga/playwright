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

test.describe('Quotes list', () => {
  test('Seeded quotes are listed with customer, status, created date and total', async () => {
    await openQuotesList();

    await quotesPage.assertQuoteCount(2);
    await quotesPage.assertRowTitle(DRAFT_QUOTE);
    await quotesPage.assertRowCustomer(DRAFT_QUOTE, 'Dale Whitfield');
    await quotesPage.assertRowStatus(DRAFT_QUOTE, 'draft');
    await quotesPage.assertRowTotal(DRAFT_QUOTE, '$1,450.00');

    await quotesPage.assertRowTitle(SENT_QUOTE);
    await quotesPage.assertRowCustomer(SENT_QUOTE, 'Priya Anand');
    await quotesPage.assertRowStatus(SENT_QUOTE, 'sent');
    await quotesPage.assertRowTotal(SENT_QUOTE, '$1,730.00');
  });

  test('Quotes list is sorted newest first', async () => {
    await openQuotesList();

    await quotesPage.assertFirstQuoteIs(DRAFT_QUOTE);
    await quotesPage.assertSecondQuoteIs(SENT_QUOTE);
  });

  for (const status of ['draft', 'sent', 'approved', 'declined']) {
    test(`Status tag of a ${status} quote carries the ${status} value`, async () => {
      const title = `${status} status quote ${Date.now()}`;

      await openQuotesList();
      await quotesPage.clickNewQuote();
      await quotesPage.fillTitle(title);
      await quotesPage.selectCustomer('Marisol Reyes');
      await quotesPage.selectStatus(status);
      await quotesPage.saveQuote();

      await quotesPage.assertQuoteCreated(title);
      await quotesPage.assertRowStatus(title, status);
      await quotesPage.assertRowStatusText(title, status.charAt(0).toUpperCase() + status.slice(1));
    });
  }
});

test.describe('Quote detail', () => {
  test('Seeded quote detail shows title, customer, items, total and expiry', async () => {
    await openQuotesList();
    await quotesPage.openQuoteDetailById('quo_2001');

    await quotesPage.assertDetailTitle(SENT_QUOTE);
    await quotesPage.assertDetailStatus('sent');
    await quotesPage.assertDetailCustomer('Priya Anand');
    await quotesPage.assertDetailItem('Rough-in Labor', '16', '$95.00', '$1,520.00');
    await quotesPage.assertDetailItem('Copper Pipe (50ft)', '1', '$210.00', '$210.00');
    await quotesPage.assertDetailTotal('$1,730.00');
    await quotesPage.assertDetailExpires('Jul 12, 2026');
  });

  test('Quote detail shows an em dash when the quote has no expiry date', async () => {
    const title = `No expiry quote ${Date.now()}`;

    await openQuotesList();
    await quotesPage.clickNewQuote();
    await quotesPage.fillTitle(title);
    await quotesPage.selectCustomer('Priya Anand');
    await quotesPage.saveQuote();
    await quotesPage.assertQuoteCreated(title);

    await quotesPage.openQuoteDetail(title);
    await quotesPage.assertDetailExpires('—');
  });

  test('Quote detail is reachable from the title link of the list', async () => {
    await openQuotesList();
    await quotesPage.openQuoteDetail(DRAFT_QUOTE);

    await quotesPage.assertDetailTitle(DRAFT_QUOTE);
    await quotesPage.assertDetailCustomer('Dale Whitfield');
    await quotesPage.assertDetailTotal('$1,450.00');
  });
});
