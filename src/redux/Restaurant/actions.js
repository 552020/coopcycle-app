import { createAction } from 'redux-actions'

/*
 * Action Types
 */
export const LOAD_MY_RESTAURANTS_REQUEST = 'LOAD_MY_RESTAURANTS_REQUEST'
export const LOAD_MY_RESTAURANTS_SUCCESS = 'LOAD_MY_RESTAURANTS_SUCCESS'
export const LOAD_MY_RESTAURANTS_FAILURE = 'LOAD_MY_RESTAURANTS_FAILURE'

export const LOAD_ORDERS_REQUEST = 'LOAD_ORDERS_REQUEST'
export const LOAD_ORDERS_SUCCESS = 'LOAD_ORDERS_SUCCESS'
export const LOAD_ORDERS_FAILURE = 'LOAD_ORDERS_FAILURE'

export const ACCEPT_ORDER_REQUEST = 'ACCEPT_ORDER_REQUEST'
export const ACCEPT_ORDER_SUCCESS = 'ACCEPT_ORDER_SUCCESS'
export const ACCEPT_ORDER_FAILURE = 'ACCEPT_ORDER_FAILURE'

/*
 * Action Creators
 */
export const loadMyRestaurantsRequest = createAction(LOAD_MY_RESTAURANTS_REQUEST)
export const loadMyRestaurantsSuccess = createAction(LOAD_MY_RESTAURANTS_SUCCESS)
export const loadMyRestaurantsFailure = createAction(LOAD_MY_RESTAURANTS_FAILURE)

export const loadOrdersRequest = createAction(LOAD_ORDERS_REQUEST)
export const loadOrdersSuccess = createAction(LOAD_ORDERS_SUCCESS)
export const loadOrdersFailure = createAction(LOAD_ORDERS_FAILURE)

export const acceptOrderRequest = createAction(ACCEPT_ORDER_REQUEST)
export const acceptOrderSuccess = createAction(ACCEPT_ORDER_SUCCESS)
export const acceptOrderFailure = createAction(ACCEPT_ORDER_FAILURE)

/*
 * Thunk Creators
 */

export function loadMyRestaurants(client) {

  return function (dispatch) {
    dispatch(loadMyRestaurantsRequest())

    return client.get('/api/me/restaurants')
      .then(res => dispatch(loadMyRestaurantsSuccess(res['hydra:member'])))
      .catch(e => dispatch(loadMyRestaurantsFailure(e)))
  }
}

export function loadOrders(client, restaurant) {

  return function (dispatch) {
    dispatch(loadOrdersRequest())

    return client.get(restaurant['@id'] + '/orders')
      .then(res => dispatch(loadOrdersSuccess(res['hydra:member'])))
      .catch(e => dispatch(loadOrdersFailure(e)))
  }
}

export function acceptOrder(client, order) {

  return function (dispatch) {
    dispatch(acceptOrderRequest())

    return client.put(order['@id'] + '/accept')
      .then(res => dispatch(acceptOrderSuccess(res)))
      .catch(e => dispatch(acceptOrderFailure(e)))
  }
}
