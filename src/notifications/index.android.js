import messaging from '@react-native-firebase/messaging'
import _ from 'lodash'

/**
 * App behavior when receiving messages that include both notification and data payloads
 * depends on whether the app is in the background or the foreground—essentially,
 * whether or not it is active at the time of receipt.
 *
 * When in the background, apps receive the notification payload in the notification tray,
 * and only handle the data payload when the user taps on the notification.
 *
 * When in the foreground, your app receives a message object with both payloads available.
 *
 * @see https://rnfirebase.io/docs/v4.2.x/messaging/receiving-messages
 * @see https://rnfirebase.io/docs/v4.2.x/messaging/device-token
 * @see https://rnfirebase.io/docs/v4.2.x/notifications/receiving-notifications
 * @see https://rnfirebase.io/messaging/usage
 */

export const parseNotification = (remoteMessage, isForeground) => {

  let data = remoteMessage.data

  if (data.event && _.isString(data.event)) {
    data.event = JSON.parse(data.event)
  }

  return {
    foreground: isForeground,
    data,
  }
}

let notificationOpenedAppListener = () => {}
let notificationListener = () => {}
let dataListener = () => {}
let tokenRefreshListener = () => {}

class PushNotification {

  static configure(options) {

    // Notification was received in the background (and opened by a user)
    notificationOpenedAppListener = messaging()
      .onNotificationOpenedApp(remoteMessage => {
        options.onNotification(
          parseNotification(remoteMessage, false)
        )
      })

    // Notification was received in the foreground
    // in the current implementation, server sends both
    // "notification + data" and "data-only" messages (with the same data),
    // handle only "notification + data" messages when the app is in the foreground
    notificationListener = messaging()
      .onMessage(remoteMessage => {
        // @see https://rnfirebase.io/messaging/usage#foreground-state-messages
        if (remoteMessage.notification) {
          options.onNotification(
            parseNotification(remoteMessage, true)
          )
        }
      })

    // @see https://rnfirebase.io/messaging/usage#usage
    // On Android, you do not need to request user permission.
    messaging()
      .getToken()
      .then(fcmToken => options.onRegister(fcmToken))

    tokenRefreshListener = messaging()
      .onTokenRefresh(fcmToken => options.onRegister(fcmToken))
  }

  static removeListeners() {
    notificationOpenedAppListener()
    notificationListener()
    dataListener()
    tokenRefreshListener()
  }

}

export default PushNotification
