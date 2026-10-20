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

const DRAFT_QUOTE = 'Tankless water heater upgrade';

test.describe('Convert quote to job', () => {
  test('Convert quote to job creates a job with the quote data', async () => {
    await openQuotesList();
    await quotesPage.openQuoteDetail(DRAFT_QUOTE);
    await quotesPage.convertToJob();

    await quotesPage.assertToast('Quote converted to job');
    await quotesPage.assertJobTitle(DRAFT_QUOTE);
    await quotesPage.assertJobStatus('scheduled');
    await quotesPage.assertJobTotal('$1,450.00');
    await quotesPage.assertJobNotes(`Converted from quote: ${DRAFT_QUOTE}`);
  });

  test('Converted quote becomes approved and offers the job instead of the convert button', async () => {
    await openQuotesList();
    await quotesPage.openQuoteDetail(DRAFT_QUOTE);
    await quotesPage.convertToJob();

    await quotesPage.openQuotes();
    await quotesPage.openQuoteDetail(DRAFT_QUOTE);
    await quotesPage.assertDetailStatus('approved');
    await quotesPage.assertConvertedToJob();
  });

  test('Opening the job of a converted quote does not create a second job', async () => {
    await openQuotesList();
    await quotesPage.openJobs();
    await quotesPage.assertJobCount(3);

    await quotesPage.openQuotes();
    await quotesPage.openQuoteDetail(DRAFT_QUOTE);
    await quotesPage.convertToJob();
    await quotesPage.assertJobTitle(DRAFT_QUOTE);

    await quotesPage.openQuotes();
    await quotesPage.openQuoteDetail(DRAFT_QUOTE);
    await quotesPage.viewConvertedJob();
    await quotesPage.assertJobTitle(DRAFT_QUOTE);
    await quotesPage.assertJobNotes(`Converted from quote: ${DRAFT_QUOTE}`);

    await quotesPage.openJobs();
    await quotesPage.assertJobCount(4);
  });
});
