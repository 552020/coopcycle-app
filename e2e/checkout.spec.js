const LOCALES = ['en-US', 'es-ES', 'fr-FR'];

LOCALES.forEach(locale => {

  describe('Checkout', () => {

    beforeEach(async () => {
      await device.relaunchApp({
        newInstance: true,
        permissions: {
          notifications: 'YES',
        },
        delete: true,
        languageAndLocale: {
          language: locale,
          locale
        }
      })
      await device.reloadReactNative()
    })

    it(`should complete checkout in ${locale}`, async () => {

      await expect(element(by.id('chooseCityBtn'))).toBeVisible()

      await device.takeScreenshot(`Home-${locale}`);

      await element(by.id('chooseCityBtn')).tap()

      await expect(element(by.id('moreServerOptions'))).toBeVisible()

      await device.takeScreenshot(`ChooseServer-${locale}`)

      await element(by.id('moreServerOptions')).tap()

      await element(by.id('customServerURL')).typeText('demo.coopcycle.org')
      await element(by.id('submitCustomServer')).tap()

      await expect(element(by.id('checkoutSearch'))).toBeVisible()
      await expect(element(by.id('restaurantList'))).toBeVisible()

      await waitFor(element(by.id('restaurantMatches:2')))
        .toBeVisible()
        .whileElement(by.id('restaurantList')).scroll(80, 'down')
      await element(by.id('restaurantMatches:2')).tap()

      await waitFor(element(by.id('menu'))).toExist().withTimeout(5000)
      await waitFor(element(by.id('menuItem:0:0'))).toExist().withTimeout(5000)
      await waitFor(element(by.id('menuItem:0:1'))).toExist().withTimeout(5000)
      await waitFor(element(by.id('menuItem:0:2'))).toExist().withTimeout(5000)

      await device.takeScreenshot(`Restaurant-${locale}`)

      // Add item
      await element(by.id('menuItem:0:0')).tap()

      await waitFor(element(by.id('addressModal'))).toExist().withTimeout(5000)
      await waitFor(element(by.id('addressModalTypeahead'))).toExist().withTimeout(5000)
      await element(by.id('addressModalTypeahead')).typeText('23 av claude vellefaux')

      await waitFor(element(by.id('placeId:ChIJPSRadeBt5kcR4B2HzbBfZQE'))).toBeVisible().withTimeout(5000)
      await element(by.id('placeId:ChIJPSRadeBt5kcR4B2HzbBfZQE')).tap()

      // Check if footer is present
      await waitFor(element(by.id('cartFooter'))).toExist().withTimeout(5000)
      await expect(element(by.id('cartFooter'))).toBeVisible()

      // Add 2 more items
      await element(by.id('menuItem:0:1')).tap()
      await element(by.id('menuItem:0:2')).tap()

      await waitFor(element(by.id('cartSubmit'))).toExist().withTimeout(5000)
      await element(by.id('cartSubmit')).tap()

      await expect(element(by.id('cartSummarySubmit'))).toBeVisible()
      await element(by.id('cartSummarySubmit')).tap()

      await expect(element(by.id('loginUsername'))).toBeVisible()
      await expect(element(by.id('loginPassword'))).toBeVisible()

      await element(by.id('loginUsername')).typeText('user_1')
      await element(by.id('loginPassword')).typeText('user_1')
      await element(by.id('loginSubmit')).tap()

      await expect(element(by.id('checkoutTelephone'))).toBeVisible()
      await expect(element(by.id('moreInfosSubmit'))).toBeVisible()

      // Append "\n" to make sure virtual keybord is hidden after entry
      // https://github.com/wix/detox/issues/209
      await element(by.id('checkoutTelephone')).typeText('0612345678\n')

      await element(by.id('moreInfosSubmit')).tap()

      await waitFor(element(by.id('creditCardNumber'))).toExist().withTimeout(5000)
      // await expect(element(by.id('creditCardNumber'))).toBeVisible()

      await element(by.id('creditCardNumber')).typeText('4242424242424242')
      await element(by.id('creditCardExpiry')).typeText('1221')
      await element(by.id('creditCardCvc')).typeText('123')

      await element(by.id('creditCardSubmit')).tap()

      // await expect(element(by.id('accountOrder'))).toBeVisible()
    })

  })
})
