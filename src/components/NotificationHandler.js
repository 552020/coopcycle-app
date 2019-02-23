import React, { Component } from 'react'
import { Alert, FlatList, View, StyleSheet, TouchableOpacity } from 'react-native'
import { Button, Icon, Text } from 'native-base'
import { connect } from 'react-redux'
import { withNamespaces } from 'react-i18next'
import Sound from 'react-native-sound'
import moment from 'moment'
import Modal from 'react-native-modal'
import { NavigationActions, StackActions } from 'react-navigation'

import PushNotification from '../notifications'
import NavigationHolder from '../NavigationHolder'

import { setRemotePushToken, clearNotifications, pushNotification } from '../redux/App/actions'
import { loadTasks } from '../redux/Courier'
import { loadOrderAndNavigate, loadOrderAndPushNotification } from '../redux/Restaurant/actions'

// Make sure sound will play even when device is in silent mode
Sound.setCategory('Playback')

class NotificationHandler extends Component {

  constructor(props) {
    super(props)

    this.state = {
      sound: null,
      isSoundReady: false
    }
  }

  _onTasksChanged(date) {
    if (this.props.currentRoute !== 'CourierTaskList') {
      NavigationHolder.navigate('CourierTaskList', {})
    }

    this.props.loadTasks(this.props.httpClient, moment(date))
  }

  _loadSound() {
    const bell = new Sound('misstickle__indian_bell_chime.wav', Sound.MAIN_BUNDLE, (error) => {

      if (error) {
        return
      }

      bell.setNumberOfLoops(-1)

      this.setState({
        sound: bell,
        isSoundReady: true
      })
    })
  }

  _startSound() {
    const { sound, isSoundReady } = this.state
    if (isSoundReady) {
      sound.play((success) => {
        if (!success) {
          sound.reset()
        }
      })
    }
  }

  _stopSound() {
    const { sound, isSoundReady } = this.state
    if (isSoundReady) {
      sound.stop(() => {})
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.notifications !== prevProps.notifications) {
      if (this.props.notifications.length > 0) {
        this._startSound()
      } else {
        this._stopSound()
      }
    }
  }

  componentDidMount() {

    this._loadSound()

    PushNotification.configure({
      onRegister: token => this.props.setRemotePushToken(token),
      onNotification: notification => {
        const { event } = notification.data

        if (event && event.name === 'order:created') {
          const { restaurant, date, order } = event.data
          if (notification.foreground) {
            this.props.loadOrderAndPushNotification(order)
          } else {
            this.props.loadOrderAndNavigate(order)
          }
        }

        if (event && event.name === 'tasks:changed') {
          if (notification.foreground) {
            this.props.pushNotification('tasks:changed', { date: event.data.date })
          } else {
            this._onTasksChanged(event.data.date)
          }
        }

      }
    })
  }

  componentWillUnmount() {
    PushNotification.removeListeners()
  }

  _keyExtractor(item, index) {

    switch (item.event) {
      case 'order:created':
        return `order:created:${item.params.order.id}`
      case 'tasks:changed':
        return `tasks:changed:${moment()}`
    }
  }

  renderItem(notification) {
    switch (notification.event) {
      case 'order:created':

        return this.renderOrderCreated(notification.params.order)
      case 'tasks:changed':

        return this.renderTasksChanged(notification.params.date)
    }
  }

  _navigateToOrder(order) {

    const resetAction = StackActions.reset({
      index: 1,
      actions: [
        NavigationActions.navigate({
          routeName: 'RestaurantHome',
          params: {
            restaurant: order.restaurant,
            // We don't want to load orders again when navigating
            loadOrders: false
          }
        }),
        NavigationActions.navigate({
          routeName: 'RestaurantOrder',
          params: { order }
        }),
      ]
    })

    this._stopSound()
    this.props.clearNotifications()

    NavigationHolder.dispatch(NavigationActions.navigate({
      routeName: 'RestaurantNav',
      action: resetAction,
    }))
  }

  _navigateToTasks(date) {

    this._stopSound()
    this.props.clearNotifications()

    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: 'CourierHome',
          action: NavigationActions.navigate({
            routeName: 'CourierTaskList',
          }),
        }),
      ]
    })

    NavigationHolder.dispatch(NavigationActions.navigate({
      routeName: 'CourierNav',
      action: resetAction,
    }))

    this.props.loadTasks(this.props.httpClient, moment(date))
  }

  renderOrderCreated(order) {

    return (
      <TouchableOpacity style={ styles.item } onPress={ () => this._navigateToOrder(order) }>
        <Text>
          { this.props.t('NOTIFICATION_ORDER_CREATED_TITLE') }
        </Text>
        <Icon type="FontAwesome" name="chevron-right" />
      </TouchableOpacity>
    )
  }

  renderTasksChanged(date) {

    return (
      <TouchableOpacity style={ styles.item } onPress={ () => this._navigateToTasks(date) }>
        <Text>
          { this.props.t('NOTIFICATION_TASKS_CHANGED_TITLE') }
        </Text>
        <Icon type="FontAwesome" name="chevron-right" />
      </TouchableOpacity>
    )
  }

  renderModalContent() {

    return (
      <View style={ styles.modalContent }>
        <View>
          <View style={ styles.heading }>
            <Icon name="notifications" style={{ color: 'white', marginRight: 10 }} />
            <Text style={{ color: 'white' }}>{ this.props.t('NEW_NOTIFICATION') }</Text>
          </View>
        </View>
        <FlatList
          data={ this.props.notifications }
          keyExtractor={ this._keyExtractor }
          renderItem={ ({ item }) => this.renderItem(item) } />
        <TouchableOpacity style={ styles.footer } onPress={ () => this.props.clearNotifications() }>
          <Text style={{ color: '#FF4136' }}>
            { this.props.t('CLOSE') }
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {

    return (
      <Modal isVisible={ this.props.isModalVisible }>
        { this.renderModalContent() }
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
    backgroundColor: '#39CCCC',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)"
  },
  item: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomColor: '#f7f7f7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})

function mapStateToProps(state) {

  return {
    httpClient: state.app.httpClient,
    currentRoute: state.app.currentRoute,
    isModalVisible: state.app.notifications.length > 0,
    notifications: state.app.notifications,
  }
}

function mapDispatchToProps (dispatch) {

  return {
    loadOrderAndNavigate: order => dispatch(loadOrderAndNavigate(order)),
    loadOrderAndPushNotification: order => dispatch(loadOrderAndPushNotification(order)),
    loadTasks: (httpClient, date) => dispatch(loadTasks(httpClient, date)),
    setRemotePushToken: token => dispatch(setRemotePushToken(token)),
    clearNotifications: () => dispatch(clearNotifications()),
    pushNotification: (event, params) => dispatch(pushNotification(event, params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withNamespaces('common')(NotificationHandler))
