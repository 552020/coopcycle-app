import { createSelector } from 'reselect'
import { find } from 'lodash'
import moment from 'moment'
import _ from 'lodash'
import { matchesDate } from '../../utils/order'

const _selectDate = state => state.restaurant.date
const _selectOrders = state => state.restaurant.orders
const _selectSpecialOpeningHoursSpecification = state => state.restaurant.specialOpeningHoursSpecification

export const selectSpecialOpeningHoursSpecification = createSelector(
  _selectDate,
  _selectSpecialOpeningHoursSpecification,
  (date, specialOpeningHoursSpecification) => {

    if (specialOpeningHoursSpecification.length === 0) {

      return null
    }

    return find(specialOpeningHoursSpecification, openingHoursSpecification => {

      return date.isSame(moment(openingHoursSpecification.validFrom, 'YYYY-MM-DD'), 'day')
    })
  }
)

export const selectNewOrders = createSelector(
  _selectDate,
  _selectOrders,
  (date, orders) => _.sortBy(
    _.filter(orders, o => matchesDate(o, date) && o.state === 'new'),
    [ o => moment.parseZone(o.pickupExpectedAt) ]
  )
)

export const selectAcceptedOrders = createSelector(
  _selectDate,
  _selectOrders,
  (date, orders) => _.sortBy(
    _.filter(orders, o => matchesDate(o, date) && o.state === 'accepted' && !o.assignedTo),
    [ o => moment.parseZone(o.pickupExpectedAt) ]
  )
)

export const selectPickedOrders = createSelector(
  _selectDate,
  _selectOrders,
  (date, orders) => _.sortBy(
    _.filter(orders, o => matchesDate(o, date) && o.state === 'accepted' && !!o.assignedTo),
    [ o => moment.parseZone(o.pickupExpectedAt) ]
  )
)

export const selectCancelledOrders = createSelector(
  _selectDate,
  _selectOrders,
  (date, orders) => _.sortBy(
    _.filter(orders, o => matchesDate(o, date) && (o.state === 'refused' || o.state === 'cancelled')),
    [ o => moment.parseZone(o.pickupExpectedAt) ]
  )
)

export const selectFulfilledOrders = createSelector(
  _selectDate,
  _selectOrders,
  (date, orders) => _.filter(orders, o => matchesDate(o, date) && o.state === 'fulfilled')
)
