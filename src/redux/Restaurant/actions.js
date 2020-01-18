import { createAction } from 'redux-actions'
import { NavigationActions, StackActions } from 'react-navigation'
import BleManager from 'react-native-ble-manager'

import DropdownHolder from '../../DropdownHolder'
import NavigationHolder from '../../NavigationHolder'

import { pushNotification } from '../App/actions'
import { encodeForPrinter } from '../../utils/order'

import {
  LOAD_MY_RESTAURANTS_REQUEST,
  LOAD_MY_RESTAURANTS_SUCCESS,
  LOAD_MY_RESTAURANTS_FAILURE,
} from '../App/actions'

/*
 * Action Types
 */

export const LOAD_ORDERS_REQUEST = 'LOAD_ORDERS_REQUEST'
export const LOAD_ORDERS_SUCCESS = 'LOAD_ORDERS_SUCCESS'
export const LOAD_ORDERS_FAILURE = 'LOAD_ORDERS_FAILURE'

export const LOAD_ORDER_REQUEST = 'LOAD_ORDER_REQUEST'
export const LOAD_ORDER_SUCCESS = 'LOAD_ORDER_SUCCESS'
export const LOAD_ORDER_FAILURE = 'LOAD_ORDER_FAILURE'

export const SET_CURRENT_ORDER = 'SET_CURRENT_ORDER'

export const ACCEPT_ORDER_REQUEST = 'ACCEPT_ORDER_REQUEST'
export const ACCEPT_ORDER_SUCCESS = 'ACCEPT_ORDER_SUCCESS'
export const ACCEPT_ORDER_FAILURE = 'ACCEPT_ORDER_FAILURE'

export const REFUSE_ORDER_REQUEST = 'REFUSE_ORDER_REQUEST'
export const REFUSE_ORDER_SUCCESS = 'REFUSE_ORDER_SUCCESS'
export const REFUSE_ORDER_FAILURE = 'REFUSE_ORDER_FAILURE'

export const DELAY_ORDER_REQUEST = 'DELAY_ORDER_REQUEST'
export const DELAY_ORDER_SUCCESS = 'DELAY_ORDER_SUCCESS'
export const DELAY_ORDER_FAILURE = 'DELAY_ORDER_FAILURE'

export const CANCEL_ORDER_REQUEST = 'CANCEL_ORDER_REQUEST'
export const CANCEL_ORDER_SUCCESS = 'CANCEL_ORDER_SUCCESS'
export const CANCEL_ORDER_FAILURE = 'CANCEL_ORDER_FAILURE'

export const CHANGE_STATUS_REQUEST = 'CHANGE_STATUS_REQUEST'
export const CHANGE_STATUS_SUCCESS = 'CHANGE_STATUS_SUCCESS'
export const CHANGE_STATUS_FAILURE = 'CHANGE_STATUS_FAILURE'

export const CHANGE_RESTAURANT = 'CHANGE_RESTAURANT'
export const CHANGE_DATE = 'CHANGE_DATE'

export const LOAD_PRODUCTS_REQUEST = 'LOAD_PRODUCTS_REQUEST'
export const LOAD_PRODUCTS_SUCCESS = 'LOAD_PRODUCTS_SUCCESS'
export const LOAD_PRODUCTS_FAILURE = 'LOAD_PRODUCTS_FAILURE'

export const LOAD_MENUS_REQUEST = 'LOAD_MENUS_REQUEST'
export const LOAD_MENUS_SUCCESS = 'LOAD_MENUS_SUCCESS'
export const LOAD_MENUS_FAILURE = 'LOAD_MENUS_FAILURE'
export const SET_CURRENT_MENU = 'SET_CURRENT_MENU'

export const SET_NEXT_PRODUCTS_PAGE = 'SET_NEXT_PRODUCTS_PAGE'
export const SET_HAS_MORE_PRODUCTS = 'SET_HAS_MORE_PRODUCTS'

export const LOAD_MORE_PRODUCTS_SUCCESS = 'LOAD_MORE_PRODUCTS_SUCCESS'

export const CHANGE_PRODUCT_ENABLED_REQUEST = 'CHANGE_PRODUCT_ENABLED_REQUEST'
export const CHANGE_PRODUCT_ENABLED_SUCCESS = 'CHANGE_PRODUCT_ENABLED_SUCCESS'
export const CHANGE_PRODUCT_ENABLED_FAILURE = 'CHANGE_PRODUCT_ENABLED_FAILURE'

export const CLOSE_RESTAURANT_REQUEST = 'CLOSE_RESTAURANT_REQUEST'
export const CLOSE_RESTAURANT_SUCCESS = 'CLOSE_RESTAURANT_SUCCESS'
export const CLOSE_RESTAURANT_FAILURE = 'CLOSE_RESTAURANT_FAILURE'

export const DELETE_OPENING_HOURS_SPECIFICATION_REQUEST = 'DELETE_OPENING_HOURS_SPECIFICATION_REQUEST'
export const DELETE_OPENING_HOURS_SPECIFICATION_SUCCESS = 'DELETE_OPENING_HOURS_SPECIFICATION_SUCCESS'
export const DELETE_OPENING_HOURS_SPECIFICATION_FAILURE = 'DELETE_OPENING_HOURS_SPECIFICATION_FAILURE'

export const PRINTER_CONNECTED = '@restaurant/PRINTER_CONNECTED'
export const BLUETOOTH_ENABLED = '@restaurant/BLUETOOTH_ENABLED'
export const BLUETOOTH_DISABLED = '@restaurant/BLUETOOTH_DISABLED'
export const BLUETOOTH_START_SCAN = '@restaurant/BLUETOOTH_START_SCAN'
export const BLUETOOTH_STOP_SCAN = '@restaurant/BLUETOOTH_STOP_SCAN'

/*
 * Action Creators
 */

const loadMyRestaurantsRequest = createAction(LOAD_MY_RESTAURANTS_REQUEST)
const loadMyRestaurantsSuccess = createAction(LOAD_MY_RESTAURANTS_SUCCESS)
const loadMyRestaurantsFailure = createAction(LOAD_MY_RESTAURANTS_FAILURE)

export const loadOrdersRequest = createAction(LOAD_ORDERS_REQUEST)
export const loadOrdersSuccess = createAction(LOAD_ORDERS_SUCCESS)
export const loadOrdersFailure = createAction(LOAD_ORDERS_FAILURE)

export const loadOrderRequest = createAction(LOAD_ORDER_REQUEST)
export const loadOrderSuccess = createAction(LOAD_ORDER_SUCCESS)
export const loadOrderFailure = createAction(LOAD_ORDER_FAILURE)

export const loadMenusRequest = createAction(LOAD_MENUS_REQUEST)
export const loadMenusSuccess = createAction(LOAD_MENUS_SUCCESS)
export const loadMenusFailure = createAction(LOAD_MENUS_FAILURE)
export const setCurrentMenu = createAction(SET_CURRENT_MENU, (restaurant, menu) => ({ restaurant, menu }))

export const setCurrentOrder = createAction(SET_CURRENT_ORDER)

export const acceptOrderRequest = createAction(ACCEPT_ORDER_REQUEST)
export const acceptOrderSuccess = createAction(ACCEPT_ORDER_SUCCESS)
export const acceptOrderFailure = createAction(ACCEPT_ORDER_FAILURE)

export const refuseOrderRequest = createAction(REFUSE_ORDER_REQUEST)
export const refuseOrderSuccess = createAction(REFUSE_ORDER_SUCCESS)
export const refuseOrderFailure = createAction(REFUSE_ORDER_FAILURE)

export const delayOrderRequest = createAction(DELAY_ORDER_REQUEST)
export const delayOrderSuccess = createAction(DELAY_ORDER_SUCCESS)
export const delayOrderFailure = createAction(DELAY_ORDER_FAILURE)

export const cancelOrderRequest = createAction(CANCEL_ORDER_REQUEST)
export const cancelOrderSuccess = createAction(CANCEL_ORDER_SUCCESS)
export const cancelOrderFailure = createAction(CANCEL_ORDER_FAILURE)

export const changeStatusRequest = createAction(CHANGE_STATUS_REQUEST)
export const changeStatusSuccess = createAction(CHANGE_STATUS_SUCCESS)
export const changeStatusFailure = createAction(CHANGE_STATUS_FAILURE)

export const changeRestaurant = createAction(CHANGE_RESTAURANT)
export const changeDate = createAction(CHANGE_DATE)

export const loadProductsRequest = createAction(LOAD_PRODUCTS_REQUEST)
export const loadProductsSuccess = createAction(LOAD_PRODUCTS_SUCCESS)
export const loadProductsFailure = createAction(LOAD_PRODUCTS_FAILURE)

export const setNextProductsPage = createAction(SET_NEXT_PRODUCTS_PAGE)
export const loadMoreProductsSuccess = createAction(LOAD_MORE_PRODUCTS_SUCCESS)
export const setHasMoreProducts = createAction(SET_HAS_MORE_PRODUCTS)

export const changeProductEnabledRequest = createAction(CHANGE_PRODUCT_ENABLED_REQUEST, (product, enabled) => ({ product, enabled }))
export const changeProductEnabledSuccess = createAction(CHANGE_PRODUCT_ENABLED_SUCCESS)
export const changeProductEnabledFailure = createAction(CHANGE_PRODUCT_ENABLED_FAILURE, (error, product, enabled) => ({ error, product, enabled }))

export const closeRestaurantRequest = createAction(CLOSE_RESTAURANT_REQUEST)
export const closeRestaurantSuccess = createAction(CLOSE_RESTAURANT_SUCCESS)
export const closeRestaurantFailure = createAction(CLOSE_RESTAURANT_FAILURE)

export const deleteOpeningHoursSpecificationRequest = createAction(DELETE_OPENING_HOURS_SPECIFICATION_REQUEST)
export const deleteOpeningHoursSpecificationSuccess = createAction(DELETE_OPENING_HOURS_SPECIFICATION_SUCCESS)
export const deleteOpeningHoursSpecificationFailure = createAction(DELETE_OPENING_HOURS_SPECIFICATION_FAILURE)

export const printerConnected = createAction(PRINTER_CONNECTED)

export const bluetoothEnabled = createAction(BLUETOOTH_ENABLED)
export const bluetoothDisabled = createAction(BLUETOOTH_DISABLED)
export const bluetoothStartScan = createAction(BLUETOOTH_START_SCAN)
export const bluetoothStopScan = createAction(BLUETOOTH_STOP_SCAN)

/*
 * Thunk Creators
 */

export function loadMyRestaurants() {

  return function (dispatch, getState) {
    const httpClient = getState().app.httpClient
    dispatch(loadMyRestaurantsRequest())

    return httpClient.get('/api/me/restaurants')
      .then(res => dispatch(loadMyRestaurantsSuccess(res['hydra:member'])))
      .catch(e => dispatch(loadMyRestaurantsFailure(e)))
  }
}

export function loadOrders(client, restaurant, date) {

  return function (dispatch) {
    dispatch(loadOrdersRequest())

    return client.get(`${restaurant['@id']}/orders?date=${date}`)
      .then(res => dispatch(loadOrdersSuccess(res['hydra:member'])))
      .catch(e => dispatch(loadOrdersFailure(e)))
  }
}

export function loadMenus(restaurant, date) {

  return function (dispatch, getState) {

    const { app } = getState()
    const { httpClient } = app

    dispatch(loadMenusRequest())

    httpClient.get(`${restaurant['@id']}/menus`)
      .then(res => dispatch(loadMenusSuccess(res['hydra:member'])))
      .catch(e => dispatch(loadMenusFailure(e)))
  }
}

export function activateMenu(restaurant, menu) {

  return function (dispatch, getState) {

    const { app } = getState()
    const { httpClient } = app

    dispatch(loadMenusRequest())

    httpClient.put(`${restaurant['@id']}`, {
      hasMenu: menu['@id'],
    })
      .then(res => dispatch(setCurrentMenu(restaurant, menu)))
      .catch(e => dispatch(loadMenusFailure(e)))
  }
}

export function loadOrderAndNavigate(order) {

  return function (dispatch, getState) {

    const { app } = getState()
    const { httpClient } = app

    dispatch(loadOrderRequest())

    return httpClient.get(order)
      .then(res => {

        dispatch(loadOrderSuccess(res))

        NavigationHolder.dispatch(NavigationActions.navigate({
          routeName: 'RestaurantNav',
          action: NavigationActions.navigate({
            routeName: 'Main',
            params: {
              restaurant: res.restaurant,
              // We don't want to load orders again when navigating
              loadOrders: false,
            },
            // We use push, because if we are already on RestaurantOrder, it opens a new screen
            // @see https://reactnavigation.org/docs/en/navigating.html#navigate-to-a-route-multiple-times
            action: StackActions.push({
              routeName: 'RestaurantOrder',
              params: { order: res },
            }),
          }),
        }))

      })
      .catch(e => dispatch(loadOrderFailure(e)))
  }
}

export function loadOrderAndPushNotification(order) {

  return function (dispatch, getState) {

    const { app } = getState()
    const { httpClient } = app

    dispatch(loadOrderRequest())

    return httpClient.get(order)
      .then(res => {
        dispatch(loadOrderSuccess(res))
        dispatch(pushNotification('order:created', { order: res }))
      })
      .catch(e => dispatch(loadOrderFailure(e)))
  }
}

export function acceptOrder(client, order) {

  return function (dispatch) {
    dispatch(acceptOrderRequest())

    return client.put(order['@id'] + '/accept')
      .then(res => {

        dispatch(acceptOrderSuccess(res))

        DropdownHolder
          .getDropdown()
          .alertWithType('success', 'Commande acceptée !',
            `La commande ${order.number} (#${order.id}) a été acceptée`
          )

      })
      .catch(e => dispatch(acceptOrderFailure(e)))
  }
}

export function refuseOrder(client, order, reason) {

  return function (dispatch) {
    dispatch(refuseOrderRequest())

    return client.put(order['@id'] + '/refuse', { reason })
      .then(res => dispatch(refuseOrderSuccess(res)))
      .catch(e => dispatch(refuseOrderFailure(e)))
  }
}

export function delayOrder(client, order, delay) {

  return function (dispatch) {
    dispatch(delayOrderRequest())

    return client.put(order['@id'] + '/delay', { delay })
      .then(res => dispatch(delayOrderSuccess(res)))
      .catch(e => dispatch(delayOrderFailure(e)))
  }
}

export function cancelOrder(client, order, reason) {

  return function (dispatch) {
    dispatch(cancelOrderRequest())

    return client.put(order['@id'] + '/cancel', { reason })
      .then(res => {

        dispatch(cancelOrderSuccess(res))

        DropdownHolder
          .getDropdown()
          .alertWithType('success', 'Commande annulée !',
            `La commande ${order.number} (#${order.id}) a été annulée`
          )

      })
      .catch(e => dispatch(cancelOrderFailure(e)))
  }
}

export function changeStatus(restaurant, state) {

  return (dispatch, getState) => {

    const { app } = getState()
    const { httpClient } = app

    dispatch(changeStatusRequest())

    return httpClient.put(restaurant['@id'], { state })
      .then(res => dispatch(changeStatusSuccess(res)))
      .catch(e => dispatch(changeStatusFailure(e)))
  }
}

export function loadProducts(client, restaurant) {

  return function (dispatch) {
    dispatch(loadProductsRequest())

    return client.get(`${restaurant['@id']}/products`)
      .then(res => {

        if (res.hasOwnProperty('hydra:view')) {
          const hydraView = res['hydra:view']
          if (hydraView.hasOwnProperty('hydra:next')) {
            dispatch(setNextProductsPage(hydraView['hydra:next']))
            dispatch(setHasMoreProducts(true))
          } else {
            // It means we have reached the last page
            dispatch(setHasMoreProducts(false))
          }
        } else {
          dispatch(setHasMoreProducts(false))
        }

        dispatch(loadProductsSuccess(res['hydra:member']))

      })
      .catch(e => dispatch(loadProductsFailure(e)))
  }
}

export function loadMoreProducts() {

  return function (dispatch, getState) {

    const { httpClient } = getState().app
    const { nextProductsPage, hasMoreProducts } = getState().restaurant

    if (!hasMoreProducts) {
      return
    }

    dispatch(loadProductsRequest())

    return httpClient.get(nextProductsPage)
      .then(res => {

        const hydraView = res['hydra:view']

        if (hydraView.hasOwnProperty('hydra:next')) {
          dispatch(setNextProductsPage(res['hydra:view']['hydra:next']))
          dispatch(setHasMoreProducts(true))
        } else {
          // It means we have reached the last page
          dispatch(setHasMoreProducts(false))
        }

        dispatch(loadMoreProductsSuccess(res['hydra:member']))
      })
      .catch(e => dispatch(loadProductsFailure(e)))
  }
}

export function changeProductEnabled(client, product, enabled) {

  return function (dispatch) {
    dispatch(changeProductEnabledRequest(product, enabled))

    return client.put(product['@id'], { enabled })
      .then(res => dispatch(changeProductEnabledSuccess(res)))
      .catch(e => dispatch(changeProductEnabledFailure(e, product, !enabled)))
  }
}

export function closeRestaurant(restaurant) {

  return (dispatch, getState) => {

    const { app } = getState()
    const { httpClient } = app

    dispatch(closeRestaurantRequest())

    return httpClient.put(`${restaurant['@id']}/close`, {})
      .then(res => dispatch(closeRestaurantSuccess(res)))
      .catch(e => dispatch(closeRestaurantFailure(e)))
  }
}

export function deleteOpeningHoursSpecification(openingHoursSpecification) {

  return function (dispatch, getState) {

    const { app } = getState()
    const { httpClient } = app

    dispatch(deleteOpeningHoursSpecificationRequest())

    return httpClient.delete(openingHoursSpecification['@id'])
      .then(res => dispatch(deleteOpeningHoursSpecificationSuccess(openingHoursSpecification)))
      .catch(e => dispatch(deleteOpeningHoursSpecificationFailure(e)))
  }
}

// const FOODORA_BT_PRINTER = '0F:02:17:A2:32:6A'
// const MTP_II = '02:03:D2:09:33:47'

export function printOrder(order) {

  return (dispatch, getState) => {

    const encoded = encodeForPrinter(order)

    const { printer } = getState().restaurant

    BleManager.isPeripheralConnected(printer, [])
      .then((isConnected) => {
        if (isConnected) {
          BleManager.retrieveServices(printer).then(services => {
            BleManager.writeWithoutResponse(
              printer,
              "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
              "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f",
              Array.from(encoded)
            )
            .then(() => console.log('WRITE OK'))
            .catch((e) => console.log('Error writing to device', e))
          })

        } else {
          console.log('Peripheral is NOT connected!');
        }
      })
  }
}

export function connectPrinter(device) {

  return function (dispatch, getState) {
    BleManager.connect(device.id)
      .then(() => {
        console.log('Connected to device !!!', device)
        dispatch(printerConnected(device.id))
      })
  }
}
