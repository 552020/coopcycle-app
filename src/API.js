import i18n from './i18n'
import axios from 'axios'
import qs from 'qs'
import _ from 'lodash'

let subscribers = []
let isRefreshingToken = false

function onTokenFetched(token) {
  subscribers.forEach(callback => callback(token))
  subscribers = []
}

function addSubscriber(callback) {
  subscribers.push(callback)
}

function Client(httpBaseURL, model) {
  this.httpBaseURL = httpBaseURL
  this.model = model

  this.axios = axios.create({
    baseURL: httpBaseURL,
  })

  // @see https://gist.github.com/Godofbrowser/bf118322301af3fc334437c683887c5f
  // @see https://www.techynovice.com/setting-up-JWT-token-refresh-mechanism-with-axios/
  this.axios.interceptors.response.use(
    response => response,
    error => {

      if (error.response && error.response.status === 401) {

        console.log('Request is not authorized')

        try {

          const req = error.config

          return new Promise((resolve, reject) => {

            addSubscriber(token => {
              console.log('Retrying request…')
              req.headers['Authorization'] = `Bearer ${token}`
              resolve(axios(req))
            })

            if (!isRefreshingToken) {

              isRefreshingToken = true

              console.log('Refreshing token…')

              this.refreshToken()
                .then(token => onTokenFetched(token))
                // Make sure to reject the Promise that was returned
                .catch(e => reject(error))
                .finally(() => {
                  isRefreshingToken = false
                })
            }
          })

        } catch (e) {
          return Promise.reject(e)
        }
      }

      return Promise.reject(error)
    }
  )
}

Client.prototype.getBaseURL = function() {
  return this.httpBaseURL
}

Client.prototype.getToken = function() {
  return this.model.token
}

Client.prototype.createRequest = function(method, url, data) {

  const headers = {
    'Content-Type': 'application/json',
  }

  let req = {
    method,
    url,
    headers,
  }

  if (data) {
    req['data'] = data
  }

  return req
}

Client.prototype.createAuthorizedRequest = function(method, url, data, options = {}) {

  let headers = {
    'Content-Type': 'application/ld+json',
  }

  if (this.model.token) {
    headers['Authorization'] = `Bearer ${this.model.token}`
  }

  if (options.headers) {
    headers = {
      ...headers,
      ...options.headers,
    }
  }

  let req = {
    method,
    url,
    headers,
  }

  // Make sure the request body is not empty for POST/PUT
  if (['POST', 'PUT'].includes(method.toUpperCase()) && !data) {
    data = {}
  }

  if (data && typeof data === 'object') {
    req['data'] = JSON.stringify(data)
  }
  if (data && typeof data === 'string') {
    req['data'] = data
  }

  return req
}

Client.prototype.request = function(method, uri, data, options = {}) {
  console.log(method + ' ' + uri);
  const req = this.model ? this.createAuthorizedRequest(method, uri, data, options) : this.createRequest(method, uri, data, options);

  return this.axios.request(req);
}

Client.prototype.get = function(uri, data) {

  return enhanceRequest(this, 'GET', uri, data);
}

Client.prototype.post = function(uri, data) {

  return enhanceRequest(this, 'POST', uri, data);
}

Client.prototype.put = function(uri, data, options = {}) {

  return enhanceRequest(this, 'PUT', uri, data);
}

Client.prototype.delete = function(uri) {

  return enhanceRequest(this, 'DELETE', uri);
}

function enhanceRequest(client, method, uri, data, options = {}) {

  return new Promise((resolve, reject) => {
    client.request(method, uri, data, options)
      .then(response => resolve(response.data))
      .catch(error => {
        if (error.response) {
          reject(error.response.data)
        } else {
          reject(error)
        }
      })
  })
}

Client.prototype.refreshToken = function() {

  return new Promise((resolve, reject) => {
    if (!this.model.refreshToken) {
      reject('No refresh token')
      return
    }

    refreshToken(this.httpBaseURL, this.model.refreshToken)
      .then(credentials => {

        console.log('Storing new credentials in DB...')
        this.model.token = credentials.token
        this.model.refreshToken = credentials.refresh_token

        return this.model.save()
      })
      .then(model => resolve(model.token))
      .catch(e => reject(e))
  })
}

Client.prototype.checkToken = function() {
  const req = this.createAuthorizedRequest('GET', '/api/token/check')

  return new Promise((resolve, reject) => {

    axios(req)
      .then(response => resolve())
      .catch(error => reject())
  })
}

Client.prototype.register = function (data) {
  return register(this.httpBaseURL, data)
    .then((credentials) => {

      const enabled =
        credentials.hasOwnProperty('enabled') ? credentials.enabled : true

      Object.assign(this.model, {
        username: data.username,
        email: data.email,
        token: credentials.token,
        refreshToken: credentials.refresh_token,
        roles: credentials.roles,
        enabled,
      })

      return this.model.save()
    })
}

Client.prototype.confirmRegistration = function(token) {
  const req = {
    method: 'GET',
    url: `${this.httpBaseURL}/api/register/confirm/${token}`,
  }

  return new Promise((resolve, reject) => {
    axios(req)
      .then(response => resolve(response.data))
      .catch(error => {
        if (error.response) {
          reject({ status: error.response.status })
        } else {
          reject({ status: 500 })
        }
      })
  }).then(updateUserData(this.model))
}

Client.prototype.login = function(username, password) {
  return login(this.httpBaseURL, username, password)
    .then(updateUserData(this.model))
}

Client.prototype.resetPassword = function(username) {
  const req = {
    method: 'POST',
    url: `${this.httpBaseURL}/api/resetting/send-email`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify({
      username: username,
    }),
  }

  return new Promise((resolve, reject) => {
    axios(req)
      .then(response => resolve(response.data))
      .catch(error => {
        if (error.response) {
          reject({status: error.response.status})
        } else {
          reject({status: 500})
        }
      })
  })
}

Client.prototype.setNewPassword = function(token, password) {
  const req = {
    method: 'POST',
    url: `${this.httpBaseURL}/api/resetting/reset/${token}`,
    data: qs.stringify({
      password: password,
    }),
  }

  return new Promise((resolve, reject) => {
    axios(req)
      .then(response => resolve(response.data))
      .catch(error => {
        if (error.response) {
          reject({status: error.response.status})
        } else {
          reject({status: 500})
        }
      })
  }).then(updateUserData(this.model))
}

Client.prototype.cloneWithModel = function(model) {
  return new Client(this.getBaseURL(), model)
}

let updateUserData = model => {
  return credentials => {
    const enabled = credentials.hasOwnProperty('enabled') ? credentials.enabled : true

    Object.assign(model, {
      username: credentials.username,
      email: credentials.email,
      token: credentials.token,
      refreshToken: credentials.refresh_token,
      roles: credentials.roles,
      enabled,
    })

    return model.save()
  }
}

var register = function(baseURL, data) {
  const req = {
    method: 'POST',
    url: `${baseURL}/api/register`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify(_.mapKeys(data, (value, key) => `_${key}`)),
  }

  return new Promise((resolve, reject) => {
    axios(req)
      .then(response => resolve(response.data))
      .catch(error => {
        if (error.response) {
          reject({ status: error.response.status })
        } else {
          reject({ status: 500 })
        }
      })
  })
}

var login = function(baseURL, username, password) {
  const req = {
    method: 'POST',
    url: `${baseURL}/api/login_check`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify({
      '_username': username,
      '_password': password,
    }),
  }

  return new Promise((resolve, reject) => {
    axios(req)
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        if (error.response) {
          reject(error.response.data)
        } else {
          reject({ message: 'An error has occured' })
        }
      })
  })
}

var refreshToken = function(baseURL, refreshToken) {

  const req = {
    method: 'POST',
    url: `${baseURL}/api/token/refresh`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify({
      'refresh_token': refreshToken,
    }),
  }

  return new Promise((resolve, reject) => {

    axios(req)
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        if (error.response) {
          reject(error.response.data.message)
        } else {
          reject('An error has occured')
        }
      })
  })
}

const ERROR_NETWORK_REQUEST_FAILED = 'ERROR_NETWORK_REQUEST_FAILED'
const ERROR_NOT_COMPATIBLE = 'ERROR_NOT_COMPATIBLE'
const ERROR_INVALID_HOSTNAME = 'ERROR_INVALID_HOSTNAME'
const ERROR_MAINTENANCE_ON = 'ERROR_MAINTENANCE_ON'

const errorMessages = {
  [ERROR_NETWORK_REQUEST_FAILED]: 'NET_FAILED',
  [ERROR_NOT_COMPATIBLE]: 'SERVER_INCOMPATIBLE',
  [ERROR_INVALID_HOSTNAME]: 'SERVER_INVALID',
  [ERROR_MAINTENANCE_ON]: 'SERVER_UNDER_MAINTENANCE',
}

const resolveBaseURL = function(server) {
  return new Promise((resolve, reject) => {

    if (server.trim().length === 0) {
      reject(createError(ERROR_INVALID_HOSTNAME))
      return
    }

    // There is no way to "ping" the server in JavaScript, because of same-origin policy.
    // Here, we don't really try HTTPS, and fallback to HTTP
    // Actually, the HTTP "fallback" is for development, i.e localhost for ex.
    if (!server.startsWith('http://') && !server.startsWith('https://')) {
      axios
        .head(`https://${server}/api`)
        .then(response => resolve(`https://${server}`))
        .catch(error => resolve(`http://${server}`))
    } else {
      resolve(server)
    }
  });
}

const createError = function(code) {
  if (errorMessages.hasOwnProperty(code)) {
    return {
      message: i18n.t(errorMessages[code]),
    }
  }

  return {
    message: i18n.t('TRY_LATER'),
  }
}

const checkServer = function(server) {
  return new Promise((resolve, reject) => {
    resolveBaseURL(server)
      .then((baseURL) => {

        console.log('Base URL is ' + baseURL)

        axios
          .get(`${baseURL}/api`, {
            headers: {
              'Content-Type': 'application/json',
            },
          })
          .then(response => {
            // {
            //   "@context":"/api/contexts/Entrypoint",
            //   "@id":"/api",
            //   "@type":"Entrypoint",
            //   "apiUser":"/api/me",
            //   "restaurant":"/api/restaurants",
            //   "deliveryAddress":"/api/delivery_addresses",
            //   "order":"/api/orders",
            //   "orderItem":"/api/order_items",
            //   "product":"/api/products"
            // }
            if (response.data.hasOwnProperty('@context')
            &&  response.data.hasOwnProperty('@id')
            &&  response.data.hasOwnProperty('@type')) {
              resolve(baseURL);
            } else {
              reject(createError(ERROR_NOT_COMPATIBLE))
            }
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status === 503) {
                reject(createError(ERROR_MAINTENANCE_ON))
              } else {
                reject(createError(ERROR_NOT_COMPATIBLE))
              }
            } else if (error.request) {
              reject(createError(ERROR_NETWORK_REQUEST_FAILED))
            } else {
              // TODO Handle this case
            }
          })

      })
      .catch(err => reject(err))
  });
}

module.exports = {
  checkServer,
  createClient: (httpBaseURL, model) => {
    return new Client(httpBaseURL, model)
  },
  resolveErrorMessage: data => {
    let message = 'An error occured'
    if (data.hasOwnProperty('@context') && data['@context'] === '/api/contexts/ConstraintViolationList') {
      message = data['hydra:description']
    }
    if (data.hasOwnProperty('message')) {
      message = data.message
    }

    return message
  },
}
