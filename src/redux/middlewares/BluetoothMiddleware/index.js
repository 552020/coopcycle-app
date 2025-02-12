import BleManager from 'react-native-ble-manager'
import { NativeModules, NativeEventEmitter, Platform } from 'react-native'
import SunmiPrinter from '@heasy/react-native-sunmi-printer'
import { bluetoothEnabled, bluetoothDisabled, bluetoothStopScan, sunmiPrinterDetected, printerConnected } from '../../Restaurant/actions'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

export default ({ dispatch }) => {

  BleManager.start({ showAlert: false })
    .then(() => {

      const didUpdateState = bleManagerEmitter.addListener('BleManagerDidUpdateState', ({ state }) => {
        if (state === 'on') {
          dispatch(bluetoothEnabled())
        } else {
          dispatch(bluetoothDisabled())
        }
      })

      const connectPeripheral = bleManagerEmitter.addListener('BleManagerConnectPeripheral', (peripheral) => {
        // TODO Dispatch action
      })

      const stopScan = bleManagerEmitter.addListener('BleManagerStopScan', ({ state }) => {
        dispatch(bluetoothStopScan())
      })

      // Check state on startup
      BleManager.checkState()

      BleManager
        .getConnectedPeripherals([])
        // Even if the method is named "getConnectedPeripherals",
        // the peripherals are actually not connected (?)
        // We need to reconnect them anyways
        .then(devices =>
          devices.forEach(device =>
            BleManager.connect(device.id)
              .then(() => dispatch(printerConnected(device)))
          )
        )

    })

  if (Platform.OS === 'android') {
    SunmiPrinter.hasPrinter()
      .then(hasPrinter => {
        if (hasPrinter) {
          dispatch(sunmiPrinterDetected())
        }
      })
  }

  return (next) => (action) => next(action)
}
