import numbro from 'numbro'

let CURRENCY_SYMBOL = '€'

export function setCurrencyCode(currencyCode) {
    CURRENCY_SYMBOL = (0).toLocaleString("en", {
        style: "currency",
        currency: currencyCode.toUpperCase()
    }).slice(0,1)
}

export function formatPrice(price) {

  return numbro(price / 100).formatCurrency({ mantissa: 2, currencySymbol: CURRENCY_SYMBOL })
}
