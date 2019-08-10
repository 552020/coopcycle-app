import Enzyme, { shallow, render, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import NavigationHolder from './src/NavigationHolder'

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() })

jest.mock('react-native-languages', () => ({
  __esModule: true,
  default: {
    language: 'en',
    languages: ['en'],
  },
}));

jest.mock('rn-fetch-blob', () => ({
  fetch: () => {}
}));

jest.mock('react-native-ble-plx', () => {
  class BleManager {}

  return {
    BleManager: BleManager,
    State: 'Unknown'
  }
})

jest.mock('tipsi-stripe', () => ({
  __esModule: true,
  default: {
    setOptions: () => {},
    createTokenWithCard: params => {}
  },
}))

// Avoid 'is not defined' errors when running tests
global.FormData = require('FormData')

// mock 'fetch' globally
global.fetch = require('jest-fetch-mock')

const fakeNavigator = {
  dispatch: (action) => {}
}

NavigationHolder.setTopLevelNavigator(fakeNavigator)
