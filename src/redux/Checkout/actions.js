import { createAction } from 'redux-actions'
import { StackActions, CommonActions } from '@react-navigation/native'
import _ from 'lodash'
import {  createPaymentMethod, handleCardAction } from '@stripe/stripe-react-native'

import NavigationHolder from '../../NavigationHolder'
import i18n from '../../i18n'
import { selectCartFulfillmentMethod } from './selectors'
import { selectIsAuthenticated, selectUser } from '../App/selectors'
import { loadAddressesSuccess } from '../Account/actions'
import { isFree } from '../../utils/order'

/*
 * Action Types
 */

export const REMOVE_ITEM = 'REMOVE_ITEM'
export const UPDATE_ITEM_QUANTITY = 'UPDATE_ITEM_QUANTITY'

export const SET_ADDRESS = '@checkout/SET_ADDRESS'
export const SET_ADDRESS_OK = '@checkout/SET_ADDRESS_OK'
export const SET_TIMING = '@checkout/SET_TIMING'
export const SET_CART_VALIDATION = '@checkout/SET_CART_VALIDATION'
export const CLEAR = '@checkout/CLEAR'
export const RESET_RESTAURANT = '@checkout/RESET_RESTAURANT'

export const INIT_REQUEST = '@checkout/INIT_REQUEST'
export const INIT_SUCCESS = '@checkout/INIT_SUCCESS'
export const INIT_FAILURE = '@checkout/INIT_FAILURE'

export const LOAD_RESTAURANTS_REQUEST = '@checkout/LOAD_RESTAURANTS_REQUEST'
export const LOAD_RESTAURANTS_SUCCESS = '@checkout/LOAD_RESTAURANTS_SUCCESS'
export const LOAD_RESTAURANTS_FAILURE = '@checkout/LOAD_RESTAURANTS_FAILURE'

export const CHECKOUT_REQUEST = '@checkout/CHECKOUT_REQUEST'
export const CHECKOUT_SUCCESS = '@checkout/CHECKOUT_SUCCESS'
export const CHECKOUT_FAILURE = '@checkout/CHECKOUT_FAILURE'

export const SHOW_ADDRESS_MODAL = '@checkout/SHOW_ADDRESS_MODAL'
export const HIDE_ADDRESS_MODAL = '@checkout/HIDE_ADDRESS_MODAL'

export const UPDATE_CART_SUCCESS = '@checkout/UPDATE_CART_SUCCESS'

export const SET_CHECKOUT_LOADING = '@checkout/SET_CHECKOUT_LOADING'

export const ADD_ITEM_REQUEST = '@checkout/ADD_ITEM_REQUEST'
export const ADD_ITEM_REQUEST_FINISHED = '@checkout/ADD_ITEM_REQUEST_FINISHED'

export const SHOW_EXPIRED_SESSION_MODAL = '@checkout/SHOW_EXPIRED_SESSION_MODAL'
export const HIDE_EXPIRED_SESSION_MODAL = '@checkout/HIDE_EXPIRED_SESSION_MODAL'
export const SESSION_EXPIRED = '@checkout/SESSION_EXPIRED'
export const SET_ADDRESS_MODAL_HIDDEN = '@checkout/SET_ADDRESS_MODAL_HIDDEN'
export const SET_ADDRESS_MODAL_MESSAGE = '@checkout/SET_ADDRESS_MODAL_MESSAGE'

export const LOAD_PAYMENT_METHODS_REQUEST = '@checkout/LOAD_PAYMENT_METHODS_REQUEST'
export const LOAD_PAYMENT_METHODS_SUCCESS = '@checkout/LOAD_PAYMENT_METHODS_SUCCESS'
export const LOAD_PAYMENT_METHODS_FAILURE = '@checkout/LOAD_PAYMENT_METHODS_FAILURE'

export const LOAD_PAYMENT_DETAILS_REQUEST = '@checkout/LOAD_PAYMENT_DETAILS_REQUEST'
export const LOAD_PAYMENT_DETAILS_SUCCESS = '@checkout/LOAD_PAYMENT_DETAILS_SUCCESS'
export const LOAD_PAYMENT_DETAILS_FAILURE = '@checkout/LOAD_PAYMENT_DETAILS_FAILURE'

export const UPDATE_CUSTOMER_GUEST = '@checkout/UPDATE_CUSTOMER_GUEST'

export const HIDE_MULTIPLE_SERVERS_IN_SAME_CITY_MODAL = '@checkout/HIDE_MULTIPLE_SERVERS_IN_SAME_CITY_MODAL'

/*
 * Action Creators
 */

export const clear = createAction(CLEAR)
export const setAddressOK = createAction(SET_ADDRESS_OK)
export const setTiming = createAction(SET_TIMING)
export const setCartValidation = createAction(SET_CART_VALIDATION, (isValid, violations = []) => ({ isValid, violations }))

export const initRequest = createAction(INIT_REQUEST)
export const initSuccess = createAction(INIT_SUCCESS, (cart, token, restaurant = null) => ({ cart, token, restaurant }))
export const initFailure = createAction(INIT_FAILURE)
export const resetRestaurant = createAction(RESET_RESTAURANT)

export const loadRestaurantsRequest = createAction(LOAD_RESTAURANTS_REQUEST)
export const loadRestaurantsSuccess = createAction(LOAD_RESTAURANTS_SUCCESS)
export const loadRestaurantsFailure = createAction(LOAD_RESTAURANTS_FAILURE)

export const checkoutRequest = createAction(CHECKOUT_REQUEST)
export const checkoutSuccess = createAction(CHECKOUT_SUCCESS)
export const checkoutFailure = createAction(CHECKOUT_FAILURE)

export const showAddressModal = createAction(SHOW_ADDRESS_MODAL)
export const hideAddressModal = createAction(HIDE_ADDRESS_MODAL)

export const updateCartSuccess = createAction(UPDATE_CART_SUCCESS)
export const updateCustomerGuest = createAction(UPDATE_CUSTOMER_GUEST)

export const setCheckoutLoading = createAction(SET_CHECKOUT_LOADING)

export const addItemRequest = createAction(ADD_ITEM_REQUEST)
export const addItemRequestFinished = createAction(ADD_ITEM_REQUEST_FINISHED)

export const removeItemRequest = createAction(REMOVE_ITEM)

export const showExpiredSessionModal = createAction(SHOW_EXPIRED_SESSION_MODAL)
export const hideExpiredSessionModal = createAction(HIDE_EXPIRED_SESSION_MODAL)

export const sessionExpired = createAction(SESSION_EXPIRED)
export const setAddressModalHidden = createAction(SET_ADDRESS_MODAL_HIDDEN)
export const setAddressModalMessage = createAction(SET_ADDRESS_MODAL_MESSAGE)

export const loadPaymentMethodsRequest = createAction(LOAD_PAYMENT_METHODS_REQUEST)
export const loadPaymentMethodsSuccess = createAction(LOAD_PAYMENT_METHODS_SUCCESS)
export const loadPaymentMethodsFailure = createAction(LOAD_PAYMENT_METHODS_FAILURE)

export const loadPaymentDetailsRequest = createAction(LOAD_PAYMENT_DETAILS_REQUEST)
export const loadPaymentDetailsSuccess = createAction(LOAD_PAYMENT_DETAILS_SUCCESS)
export const loadPaymentDetailsFailure = createAction(LOAD_PAYMENT_DETAILS_FAILURE)

export const hideMultipleServersInSameCityModal = createAction(HIDE_MULTIPLE_SERVERS_IN_SAME_CITY_MODAL)

function validateAddress(httpClient, cart, address) {

  if (!address.isPrecise) {
    return Promise.reject(i18n.t('ADDRESS_NOT_PRECISE_ENOUGH'))
  }

  const latitude = address.geo.latitude
  const longitude = address.geo.longitude

  return new Promise((resolve, reject) => {
    httpClient
      .get(`${cart.restaurant}/can-deliver/${latitude},${longitude}`, {}, { anonymous: true })
      .then(resolve)
      .catch(() => reject(i18n.t('CHECKOUT_ADDRESS_NOT_VALID')))
  })
}

function createHttpClient(state) {
  const { httpClient } = state.app
  if (httpClient.credentials.token && httpClient.credentials.refreshToken) {
    return httpClient
  }

  const { token } = state.checkout

  return httpClient.cloneWithToken(token)
}

let listeners = []

function replaceListeners(cb) {
  listeners = [ cb ]
}

function addListener(cb) {
  listeners.push(cb)
}

function notifyListeners(address) {
  listeners.forEach(cb => {
    if (typeof cb === 'function') {
      cb(address)
    }
  })
  listeners = []
}

// This action may be dispatched several times "recursively"
export function addItem(item, quantity = 1, options) {

  return (dispatch, getState) => {

    const { httpClient } = getState().app
    const { address, cart, isAddressOK } = getState().checkout

    const fulfillmentMethod = selectCartFulfillmentMethod(getState())

    if (fulfillmentMethod === 'delivery' && (!address || !isAddressOK)) {

      // We don't have an adress
      // Stop here an ask for address
      if (!address) {
        // When the address is set,
        // re-dispatch the same action
        replaceListeners(() => dispatch(addItem(item, quantity, options)))
        dispatch(showAddressModal(i18n.t('CHECKOUT_PLEASE_ENTER_ADDRESS')))
        return
      }

      // When isAddressOK === null,
      // it means we have an address, but it hasn't been validated yet
      if (isAddressOK === null) {

        dispatch(addItemRequest(item))

        validateAddress(httpClient, cart, address)
          // When the address is valid,
          // re-dispatch the same action
          .then(() => {
            dispatch(_setAddress(address))
            dispatch(setAddressOK(true))

            addListener(() => {
              dispatch(addItemRequestFinished(item))
              dispatch(addItem(item, quantity, options))
            })
            dispatch(syncAddress())
          })
          .catch((reason) => {

            dispatch(setAddressOK(false))
            dispatch(addItemRequestFinished(item))

            replaceListeners(() => dispatch(addItem(item, quantity, options)))
            dispatch(showAddressModal(reason))
          })

        return
      }

      dispatch(showAddressModal())
      return
    }

    dispatch(addItemRequest(item))
    dispatch(queueAddItem(item, quantity, options))
  }
}

function queueAddItem(item, quantity = 1, options = []) {

  return {
    queue: 'ADD_ITEM',
    callback: (next, dispatch, getState) => {

      const { cart } = getState().checkout
      const httpClient = createHttpClient(getState())

      dispatch(setCheckoutLoading(true))

      httpClient
        .post(`${cart['@id']}/items`, {
          product: item.identifier,
          quantity,
          options,
        })
        .then(res => {
          dispatch(setCheckoutLoading(false))
          dispatch(addItemRequestFinished(item))
          dispatch(updateCartSuccess(res))
        })
        .catch(e => {
          dispatch(setCheckoutLoading(false))
          dispatch(addItemRequestFinished(item))
          dispatch(sessionExpired())
        })
        .finally(next)
    },
  }
}

export function addItemWithOptions(item, quantity = 1, options = []) {
  return addItem(item, quantity, options)
}

const fetchValidation = _.throttle((dispatch, getState) => {

  const httpClient = createHttpClient(getState())
  const { cart } = getState().checkout

  // No need to validate when cart is empty
  if (cart.items.length === 0) {
    return
  }

  const doTiming = () => new Promise((resolve) => {
    httpClient
      .get(`${cart['@id']}/timing`)
      .then(timing => dispatch(setTiming(timing)))
      // .catch(error => dispatch(setCartValidation(false, error.violations)))
      .finally(resolve)
  })

  const doValidate = () => new Promise((resolve) => {
    httpClient
      .get(`${cart['@id']}/validate`)
      .then(() => dispatch(setCartValidation(true)))
      .catch(error => {
        if (error.response && error.response.status === 400) {
          dispatch(setCartValidation(false, error.response.data.violations))
        } else {
          dispatch(setCartValidation(false, [ { message: i18n.t('TRY_LATER') } ]))
        }
      })
      .finally(resolve)
  })

  dispatch(setCheckoutLoading(true))

  Promise.all([ doTiming(), doValidate() ])
    .then(() => dispatch(setCheckoutLoading(false)))

}, 500)

const updateItemQuantity = createAction(UPDATE_ITEM_QUANTITY, (item, quantity) => ({ item, quantity }))

function syncItem(item) {

  return {
    queue: 'UPDATE_CART',
    callback: (next, dispatch, getState) => {

      const httpClient = createHttpClient(getState())
      const { cart } = getState().checkout

      // We make sure to get item from state,
      // because it may have been updated
      const itemFromState = _.find(cart.items, it => it.id === item.id)
      if (!itemFromState) {
        next()
        return
      }

      dispatch(setCheckoutLoading(true))

      httpClient
        // FIXME We should have the "@id" property
        .put(`${cart['@id']}/items/${item.id}`, {
          quantity: itemFromState.quantity,
        })
        .then(res => {
          dispatch(updateCartSuccess(res))
          dispatch(setCheckoutLoading(false))

          fetchValidation.cancel()
          fetchValidation(dispatch, getState)
        })
        .catch(e => {
          dispatch(setCheckoutLoading(false))
          dispatch(sessionExpired())
        })
        .finally(next)
    },
  }
}

const syncItemDebounced = _.debounce((dispatch, item) => dispatch(syncItem(item)), 350)

export function incrementItem(item) {

  return (dispatch, getState) => {
    const quantity = item.quantity + 1
    // Dispatch an action to "virtually" change the item quantity,
    // so that the user has a UI feedback
    dispatch(updateItemQuantity(item, quantity))
    syncItemDebounced(dispatch, item)
  }
}

export function decrementItem(item) {

  return (dispatch, getState) => {
    const quantity = item.quantity - 1
    // Dispatch an action to "virtually" change the item quantity,
    // so that the user has a UI feedback
    dispatch(updateItemQuantity(item, quantity))
    syncItemDebounced(dispatch, item)
  }
}

function queueRemoveItem(item) {

  return {
    queue: 'UPDATE_CART',
    callback: (next, dispatch, getState) => {

      const httpClient = createHttpClient(getState())
      const { cart } = getState().checkout

      dispatch(setCheckoutLoading(true))

      httpClient
        // FIXME We should have the "@id" property
        .delete(`${cart['@id']}/items/${item.id}`)
        .then(res => {
          dispatch(updateCartSuccess(res))
          dispatch(setCheckoutLoading(false))

          fetchValidation.cancel()
          fetchValidation(dispatch, getState)
        })
        .catch(e => {
          dispatch(setCheckoutLoading(false))
          dispatch(sessionExpired())
        })
        .finally(next)
    },
  }
}

export function removeItem(item) {

  return (dispatch, getState) => {
    // Dispatch an action to "virtually" remove the item,
    // so that the user has a UI feedback
    dispatch(removeItemRequest(item))

    dispatch(queueRemoveItem(item))
  }
}

export function validate() {

  return (dispatch, getState) => {
    replaceListeners(() => {
      fetchValidation(dispatch, getState)
    })
    dispatch(syncAddress())
  }
}

const _setAddress = createAction(SET_ADDRESS)

function syncAddress() {

  return {
    queue: 'UPDATE_CART',
    callback: (next, dispatch, getState) => {

      const httpClient = createHttpClient(getState())
      const { address, cart } = getState().checkout

      dispatch(setCheckoutLoading(true))

      httpClient.put(cart['@id'], { shippingAddress: address })
        .then(res => {
          dispatch(updateCartSuccess(res))
          dispatch(setCheckoutLoading(false))
          dispatch(hideAddressModal())
          notifyListeners(address)
        })
        .catch(e => {
          dispatch(setCheckoutLoading(false))
          dispatch(hideAddressModal())
          dispatch(sessionExpired())
        })
        .finally(next)
    },
  }
}

export function setAddress(address) {

  return (dispatch, getState) => {

    const { httpClient } = getState().app
    const { cart } = getState().checkout

    if (cart.restaurant) {

      dispatch(setCheckoutLoading(true))

      validateAddress(httpClient, cart, address)
        .then(() => {
          dispatch(_setAddress(address))
          dispatch(setAddressOK(true))
          dispatch(syncAddress())
        })
        .catch((reason) => {
          dispatch(setAddressOK(false))
          dispatch(setAddressModalMessage(reason))
          dispatch(setCheckoutLoading(false))
        })
      }
  }
}

function wrapRestaurantsWithTiming(restaurants) {

  return (dispatch, getState) => {

    const { httpClient } = getState().app

    const promises = restaurants.map(restaurant => new Promise((resolve) => {
      httpClient.get(restaurant['@id'] + '/timing', {}, { anonymous: true })
        .then(res => resolve(res))
        .catch(e => resolve({ delivery: null, collection: null }))
    }))

    Promise
      .all(promises)
      .then(values => {
        const restaurantsWithTiming = _.map(restaurants, (restaurant, index) => ({
          ...restaurant,
          timing: values[index],
        }))
        dispatch(loadRestaurantsSuccess(restaurantsWithTiming))
      })
  }
}

export function searchRestaurantsForAddress(address, options = {}) {

  return (dispatch, getState) => {

    const { httpClient } = getState().app

    let queryString = `coordinate=${address.geo.latitude},${address.geo.longitude}`
    dispatch(loadRestaurantsRequest())

    const uri = options && options.baseURL ? `${options.baseURL}/api/restaurants` : '/api/restaurants'

    httpClient.get(uri + (queryString ? `?${queryString}` : ''), {}, { anonymous: true })
      .then(res => {
        dispatch(_setAddress(address))
        dispatch(wrapRestaurantsWithTiming(res['hydra:member']))
      })
      .catch(e => dispatch(loadRestaurantsFailure(e)))
  }
}

export function searchRestaurants(options = {}) {

  return (dispatch, getState) => {

    const { httpClient } = getState().app

    dispatch(loadRestaurantsRequest())

    const uri = options && options.baseURL ? `${options.baseURL}/api/restaurants` : '/api/restaurants'

    const reqs = [
      httpClient.get(uri, {}, { anonymous: true }),
    ]

    if (selectIsAuthenticated(getState())) {
      reqs.push(httpClient.get('/api/me'))
    }

    Promise.all(reqs)
      .then(values => {
        if (values.length === 2) {
          const addresses = values[1].addresses.map(address => ({
            ...address,
            isPrecise: true,
          }))
          dispatch(loadAddressesSuccess(addresses))
        }
        dispatch(wrapRestaurantsWithTiming(values[0]['hydra:member']))
      })
      .catch(e => dispatch(loadRestaurantsFailure(e)))
  }
}

export function init(restaurant) {

  return (dispatch, getState) => {

    const { httpClient } = getState().app

    dispatch(initRequest(restaurant))

    const reqs = []

    reqs.push(httpClient.post('/api/carts/session', {
      restaurant: restaurant['@id'],
    }))

    if (typeof restaurant.hasMenu === 'string') {
      reqs.push(httpClient.get(restaurant.hasMenu, {}, { anonymous: true }))
    }

    Promise.all(reqs)
      .then(values => {
        const session = values[0]

        const args = [
          session.cart,
          session.token,
        ]

        if (values.length === 2) {
          const menu = values[1]
          const restaurantWithMenu = {
            ...restaurant,
            hasMenu: menu,
          }
          args.push(restaurantWithMenu)
        }

        dispatch(initSuccess(...args))
      })
  }
}

export function mercadopagoCheckout(payment) {
  /**
   * Helper function to handle errors
   */
  function handleError(dispatch, error) {
    dispatch(checkoutFailure(error))
    // We navigate back to the MoreInfos screen. Should we navigate to another screen?
    NavigationHolder.navigate('CheckoutMoreInfos', {});
  }

  return (dispatch, getState) => {
    const { cart } = getState().checkout;

    const {id, status, statusDetail} = payment;

    if (status !== 'approved') {
      handleError(dispatch, {status, statusDetail});
      return;
    }

    const params = {
      paymentId: id,
      paymentMethodId: 'CARD',
    }

    const httpClient = createHttpClient(getState())

    httpClient
      .put(cart['@id'] + '/pay', params)
      .then(order => {
        handleSuccessNav(dispatch, order);
      })
      .catch(orderUpdateError => {
        handleError(dispatch, orderUpdateError)
      })
  }
}

function handleSuccessNav(dispatch, order) {
  // First, reset checkout stack
  NavigationHolder.dispatch(StackActions.popToTop())
  // Then, navigate to order screen
  NavigationHolder.dispatch(CommonActions.navigate({
    name: 'AccountNav',
    // We skip the AccountOrders screen
    params: {
      screen: 'AccountOrders',
      initial: false,
      params: {
        screen: 'AccountOrder',
        initial: false,
        params: { order },
      },
    },
  }))

  // Make sure to clear AFTER navigation has been reset
  dispatch(clear())
  dispatch(checkoutSuccess(order))
}

function handleSuccess(dispatch, httpClient, cart, paymentIntentId) {
  httpClient
    .put(cart['@id'] + '/pay', { paymentIntentId })
    .then(o => handleSuccessNav(dispatch, o))
    .catch(e => dispatch(checkoutFailure(e)))
}

/**
 * @see https://stripe.com/docs/payments/accept-a-payment?platform=react-native&ui=custom
 * @see https://stripe.com/docs/payments/accept-a-payment-synchronously?platform=react-native
 * @see https://github.com/stripe/stripe-react-native/blob/master/example/src/screens/NoWebhookPaymentScreen.tsx
 */
export function checkout(cardholderName) {

  return (dispatch, getState) => {

    const { cart } = getState().checkout
    const user = selectUser(getState())

    const httpClient = createHttpClient(getState())

    dispatch(checkoutRequest())

    if (isFree(cart)) {
      httpClient
        .put(cart['@id'] + '/pay', {})
        .then(o => handleSuccessNav(dispatch, o))
        .catch(e => dispatch(checkoutFailure(e)))

      return
    }

    createPaymentMethod({
      type: 'Card',
      billingDetails: {
        email: user.email,
        name: cardholderName,
        phone: cart.fulfillmentMethod === 'delivery' ? cart.shippingAddress.telephone : '',
      },
    })
    .then(({ paymentMethod, error }) => {
      if (error) {
        dispatch(checkoutFailure(error))
      } else {
        httpClient
          .put(cart['@id'] + '/pay', { paymentMethodId: paymentMethod.id })
          .then(stripeResponse => {
            if (stripeResponse.requiresAction) {
              handleCardAction(stripeResponse.paymentIntentClientSecret)
                .then(({ error, paymentIntent }) => {
                  if (error) {
                    dispatch(checkoutFailure(error))
                  } else {
                    handleSuccess(dispatch, httpClient, cart, paymentIntent.id)
                  }
                })
                .catch(e => {
                  dispatch(checkoutFailure(e))
                })
            } else {
              handleSuccess(dispatch, httpClient, cart, stripeResponse.paymentIntentId)
            }
          })
          .catch(e => dispatch(checkoutFailure(e)))
      }
    })
    .catch(e => dispatch(checkoutFailure(e)))
  }
}

export function assignCustomer({email, telephone}) {

  return async (dispatch, getState) => {

    const { cart, token } = getState().checkout
    const { user } = getState().app

    if (cart.customer) {
      return
    }

    const httpClient = createHttpClient(getState())

    dispatch(checkoutRequest())

    let body = {}

    if (user.isGuest()) {
      body = {
        guest: true,
        email,
        telephone,
      };
    }

    return httpClient
      .put(cart['@id'] + '/assign', body, {
        headers: {
          'X-CoopCycle-Session': `Bearer ${token}`,
        },
      })
      .then(res => {
        if (user.isGuest()) {
          dispatch(updateCustomerGuest({email, telephone}))
        }
        dispatch(updateCartSuccess(res))
        dispatch(checkoutSuccess())
      })
      .catch(e => dispatch(checkoutFailure(e)))
  }
}

export function resetSearch(options = {}) {

  return (dispatch, getState) => {
    dispatch(_setAddress(''))
    dispatch(searchRestaurants(options))
  }
}

const doUpdateCart = (dispatch, httpClient, cart, payload, cb) => {
  httpClient
    .put(cart['@id'], payload)
    .then(res => {
      dispatch(updateCartSuccess(res))
      dispatch(checkoutSuccess())
      _.isFunction(cb) && cb(res)
    })
    .catch(e => dispatch(checkoutFailure(e)))
}

export function updateCart(payload, cb) {

  return (dispatch, getState) => {

    const httpClient = createHttpClient(getState())

    const { cart } = getState().checkout

    if (payload.shippingAddress) {
      const shippingAddress = {
        ...cart.shippingAddress,
        ...payload.shippingAddress,
      }
      payload = {
        ...payload,
        shippingAddress,
      }
    }

    dispatch(checkoutRequest())

    // For "collection" fulfillment
    // We store the phone number at the user level
    if (payload.telephone) {

      const { telephone, ...payloadWithoutTelephone } = payload

      httpClient
        .put(cart.customer, { telephone })
        .then(res => doUpdateCart(dispatch, httpClient, cart, payloadWithoutTelephone, cb))
        .catch(e => dispatch(checkoutFailure(e)))

    } else {
      doUpdateCart(dispatch, httpClient, cart, payload, cb)
    }
  }
}

export function setDate(shippingTimeRange, cb) {

  return (dispatch, getState) => {

    const httpClient = createHttpClient(getState())

    const { cart } = getState().checkout

    dispatch(checkoutRequest())

    httpClient
      .put(cart['@id'], {
        shippingTimeRange,
      })
      .then(res => {
        dispatch(updateCartSuccess(res))
        setTimeout(() => {
          dispatch(checkoutSuccess())
          _.isFunction(cb) && cb()
        }, 250)
      })
      .catch(e => dispatch(checkoutFailure(e)))
  }
}

export function setDateAsap(cb) {

  return (dispatch, getState) => {

    const httpClient = createHttpClient(getState())

    const { cart } = getState().checkout

    dispatch(checkoutRequest())

    httpClient
      .put(cart['@id'], {
        shippingTimeRange: null,
      })
      .then(res => {
        dispatch(updateCartSuccess(res))
        setTimeout(() => {
          dispatch(checkoutSuccess())
          _.isFunction(cb) && cb()
        }, 250)
      })
      .catch(e => dispatch(checkoutFailure(e)))
  }
}

export function setFulfillmentMethod(method) {

  return (dispatch, getState) => {

    const httpClient = createHttpClient(getState())

    const { address, cart } = getState().checkout

    dispatch(checkoutRequest())

    httpClient
      .put(cart['@id'], {
        fulfillmentMethod: method,
      })
      .then(res => {
        httpClient
          .get(`${cart['@id']}/timing`)
          .then(timing => {
            dispatch(setCheckoutLoading(false))
            dispatch(setTiming(timing))
            dispatch(updateCartSuccess(res))

            if (method === 'delivery') {
              if (!cart.shippingAddress) {
                if (!address) {
                  dispatch(showAddressModal(i18n.t('CHECKOUT_PLEASE_ENTER_ADDRESS')))
                } else {
                  dispatch(updateCartSuccess({
                    ...res,
                    shippingAddress: address,
                  }))
                }
              }
            } else {
              dispatch(hideAddressModal())
              notifyListeners()
            }
          })
          .catch(e => dispatch(checkoutFailure(e)))
      })
      .catch(e => {
        dispatch(setCheckoutLoading(false))
      })
  }
}

export function loadPaymentMethods(method) {

  return (dispatch, getState) => {

    const httpClient = createHttpClient(getState())

    const { cart } = getState().checkout

    dispatch(loadPaymentMethodsRequest())

    httpClient
      .get(`${cart['@id']}/payment_methods`)
      .then(res => dispatch(loadPaymentMethodsSuccess(res)))
      .catch(e => dispatch(loadPaymentMethodsFailure(e)))
  }
}

export function checkoutWithCash() {

  return (dispatch, getState) => {

    const { httpClient } = getState().app
    const { cart } = getState().checkout

    dispatch(checkoutRequest())

    httpClient
      .put(cart['@id'] + '/pay', { cashOnDelivery: true })
      .then(order => {
        handleSuccessNav(dispatch, order)
      })
      .catch(e => dispatch(checkoutFailure(e)))
  }
}

export function loadPaymentDetails() {

  return (dispatch, getState) => {

    const httpClient = createHttpClient(getState())

    const { cart } = getState().checkout

    dispatch(loadPaymentDetailsRequest())

    httpClient
      .get(`${cart['@id']}/payment`)
      .then(res => dispatch(loadPaymentDetailsSuccess(res)))
      .catch(e => dispatch(loadPaymentDetailsFailure(e)))
  }
}
