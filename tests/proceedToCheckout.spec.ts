import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CheckOutPage } from '../pages/Checkout';
import { PaymentPage } from '../pages/PaymentPage';

const EMAIL = 'armantesting0@gmail.com';
const PASSWORD = '!Acorn321';

let cartPage!: CartPage;
let productsPage!: ProductsPage;
let checkOutPage!: CheckOutPage;
let paymentPage!: PaymentPage;

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);

  cartPage = new CartPage(page);
  productsPage = new ProductsPage(page);
  checkOutPage = new CheckOutPage(page);
  paymentPage = new PaymentPage(page);

  await loginPage.goto();
  await loginPage.login(EMAIL, PASSWORD);

});

test ('Proceed to checkout @regression', async({page}) => {
    await productsPage.navigateProducts();
    await productsPage.assertOnProductsPage();
    await productsPage.searchProduct('Men Tshirt');
    await productsPage.addToCart('2');
    await productsPage.assertAddedItemtoCart();
    await productsPage.continueShopping();
    await cartPage.navigateCart();
    await cartPage.assertOnCartPage();
    await cartPage.clickProceedToCheckout()
    await checkOutPage.assertOnCheckoutPage();
    await checkOutPage.assertOders('Men Tshirt', 'Rs. 400', 'Rs. 400' );
    await page.locator('textarea')
        .fill('Please deliver this asap.');
    await checkOutPage.clickPlaceOrder();
    await paymentPage.assertPaymentPage();   
    await paymentPage.fillCardDetails(
      'Test User',        //card name
      '4111111111111111', //card number
      '311',              //card cvc
      '12',               //expiryMonth
      '2087'              //expiryYear
    ); 
    await paymentPage.clickPayAndConfirmOrder();
    await paymentPage.assertPaymentDonePage();



} )