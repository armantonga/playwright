# FieldDesk — Playwright test suite

End to end tests for the **FieldDesk** field service app (https://fieldesk.netlify.app/)
written with Playwright Test and the Page Object Model.

## Covered features

| Area | Folder | Specs |
| --- | --- | --- |
| Customers | `tests/fieldesk/customers` | `createCustomer`, `updateCustomer`, `deleteCustomer` |
| Jobs | `tests/fieldesk/jobs` | `createJob`, `updateJob`, `deleteJob`, `jobDetail`, `jobFromQuote` |
| Quotes | `tests/fieldesk/quotes` | `createQuote`, `updateQuote`, `deleteQuote`, `quotesList`, `quoteToJob` |
| Invoices | `tests/fieldesk/invoices` | `invoicesList`, `createInvoice`, `invoiceDetail`, `deleteInvoice` |
| Payments | `tests/fieldesk/payment` | `recordPayment`, `deletePayment` |

## Project layout

```
pages/                  page objects (one per feature)
  fixtures/             shared helpers used by several specs
tests/fieldesk/         the test cases
  customers/
  jobs/
  quotes/
  invoices/
  payment/
playwright.config.ts    base url, reporter and browser projects
```

## Running the tests

```bash
npm install
npx playwright install --with-deps

npx playwright test                 # everything
npx playwright test tests/fieldesk # only the fieldesk suite
npx playwright test --ui            # interactive mode
npx playwright show-report          # open the html report
```

The app keeps its data in the browser local storage, every test starts with the
seeded data of a fresh browser context.
