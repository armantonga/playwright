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

test.describe('Delete quote', () => {
  test('Delete quote from the list', async () => {
    await openQuotesList();
    await quotesPage.clickDeleteQuote(DRAFT_QUOTE);
    await quotesPage.assertDeleteConfirmation(DRAFT_QUOTE);
    await quotesPage.confirmDelete();

    await quotesPage.assertQuoteDeleted(DRAFT_QUOTE);
    await quotesPage.assertQuoteCount(1);
    await quotesPage.assertQuoteStillPresent(SENT_QUOTE);
  });

  test('Delete quote - cancel keeps the quote', async () => {
    await openQuotesList();
    await quotesPage.clickDeleteQuote(DRAFT_QUOTE);
    await quotesPage.cancelDelete();

    await quotesPage.assertQuoteStillPresent(DRAFT_QUOTE);
    await quotesPage.assertQuoteCount(2);
  });

  test('Delete quote from the detail page returns to the quotes list', async () => {
    await openQuotesList();
    await quotesPage.openQuoteDetail(SENT_QUOTE);
    await quotesPage.clickDeleteQuoteFromDetail();
    await quotesPage.confirmDelete();

    await quotesPage.assertQuoteDeleted(SENT_QUOTE);
    await quotesPage.assertQuoteCount(1);
  });
});
