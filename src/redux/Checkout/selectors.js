import { createSelector } from 'reselect'
import _ from 'lodash'

export const selectDeliveryTotal = createSelector(
  state => state.checkout.cart,
  (cart) => {

    if (!cart.adjustments.hasOwnProperty('delivery')) {
      return 0
    }

    return _.reduce(cart.adjustments.delivery, function(total, adj) {
      return total + adj.amount
    }, 0)
  }
)

