import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import ReduxAsyncQueue from 'redux-async-queue'
import { composeWithDevTools } from 'redux-devtools-extension'
import { createLogger } from 'redux-logger'
import reducers from './reducers'
import PreferencesMiddleware from './middlewares/PreferencesMiddleware'
import WsMiddleware from './middlewares/WebSocketMiddleware'

const middlewares = [ thunk, ReduxAsyncQueue, PreferencesMiddleware, WsMiddleware() ]

if (process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger({ collapsed: true }))
}

export default createStore(
  reducers,
  composeWithDevTools(applyMiddleware(...middlewares))
)


export const observeStore = (store, selector, onChange) => {
  let currentState = null

  const handleChange = () => {
    const nextState = selector(store.getState())

    if (nextState !== currentState) {
      currentState = nextState
      onChange(currentState)
    }
  }

  const unsubscribe = store.subscribe(handleChange)
  handleChange()
  return unsubscribe
}
