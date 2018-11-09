import React, { Component } from 'react'
import { StyleSheet, View, ActivityIndicator, Alert, TouchableOpacity, Platform } from 'react-native'
import {
  Container, Button, Icon, Text
} from 'native-base'
import moment from 'moment'
import MapView from 'react-native-maps'
import { NavigationActions } from 'react-navigation'
import KeepAwake from 'react-native-keep-awake'
import RNPinScreen from 'react-native-pin-screen'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import _ from 'lodash'

import { whiteColor, orangeColor, dateSelectHeaderHeight, websocketWarningHeight } from "../../styles/common"
import DateSelectHeader from '../../components/DateSelectHeader'
import TasksMapView from '../../components/TasksMapView'
import Preferences from '../../Preferences'
import {
  loadTasks,
  selectFilteredTasks,
  selectIsTasksLoading,
  selectIsTasksLoadingFailure,
  selectTaskSelectedDate,
} from '../../redux/Courier'
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation'

class TasksPage extends Component {

  constructor(props) {
    super(props)

    this.state = {
      task: null,
      loading: false,
      loadingMessage: this.props.t('LOADING'),
      geolocation: null,
      polyline: [],
    }

    this.onMapReady = this.onMapReady.bind(this)
    this.refreshTasks = this.refreshTasks.bind(this)
  }

  componentDidMount() {

    Preferences.getKeepAwake().then(keepAwake => {
      if (keepAwake) {
        if (Platform.OS === 'ios') {
          KeepAwake.activate()
        } else {
          RNPinScreen.pin()
        }
      }
    })

    this.refreshTasks(this.props.selectedDate)
  }

  componentWillUnmount() {

    BackgroundGeolocation.stop()
    BackgroundGeolocation.events.forEach(event => BackgroundGeolocation.removeAllListeners(event))

    if (Platform.OS === 'ios') {
      KeepAwake.deactivate()
    } else {
      RNPinScreen.unpin()
    }

  }

  componentDidUpdate(prevProps, prevState) {
    const { tasksLoadingError, navigation } = this.props

    if (tasksLoadingError && !prevProps.tasksLoadingError) {
      Alert.alert(
        this.props.t('FAILED_TASK_LOAD'),
        this.props.t('TRY_LATER'),
        [
          {
            text: 'OK', onPress: () => {
              navigation.dispatch(NavigationActions.back())
            }
          },
        ],
        { cancelable: false }
      )
    }
  }

  onGeolocationChange(geolocation) {
    this.setState({ geolocation })
  }

  refreshTasks (selectedDate) {
    this.props.loadTasks(this.props.httpClient, selectedDate)
  }

  setParentParams(params) {
    this.props.navigation.dispatch(NavigationActions.setParams({
      params,
      key: 'CourierHome',
    }))
  }

  onMapReady () {

    BackgroundGeolocation.on('start', () => {
      this.setParentParams({ tracking: true })
    })

    BackgroundGeolocation.on('stop', () => {
      this.setParentParams({ tracking: false })
    })

    BackgroundGeolocation.on('location', (location) => {

      this.onGeolocationChange(location)

      // handle your locations here
      // to perform long running operation on iOS
      // you need to create background task
      // BackgroundGeolocation.startTask(taskKey => {
      //   // execute long running task
      //   // eg. ajax post location
      //   // IMPORTANT: task has to be ended by endTask
      //   BackgroundGeolocation.endTask(taskKey);
      // });
    })

    BackgroundGeolocation.on('error', (error) => {
      console.log('[ERROR] BackgroundGeolocation error:', error);
    });

    BackgroundGeolocation.on('authorization', (status) => {
      console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(() =>
          Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
            { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
            { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
          ]), 1000);
      }
    });

    BackgroundGeolocation.checkStatus(status => {
      // you don't need to check status before start (this is just the example)
      if (status.isRunning) {
        this.setParentParams({ tracking: true })
      } else {
        BackgroundGeolocation.start()
      }
    });

    // you can also just start without checking for status
    // BackgroundGeolocation.start();
  }

  renderLoader() {

    const { isLoadingTasks } = this.props
    const { loading, loadingMessage } = this.state

    if (isLoadingTasks || loading) {
      return (
        <View style={ styles.loader }>
          <ActivityIndicator
            animating={ true }
            size="large"
            color="#fff"
          />
          <Text style={{ color: '#fff' }}>{
            loadingMessage || this.props.t('LOADING')
          }</Text>
        </View>
      )
    }

    return (
      <View />
    )
  }

  render() {

    const { tasks, selectedDate } = this.props
    const { navigate } = this.props.navigation
    const { geolocation } = this.state

    const navigationParams = { geolocation }

    return (
      <Container>
        <DateSelectHeader
          buttonsEnabled={true}
          toDate={this.refreshTasks}
          selectedDate={selectedDate}
        />
        <View style={ styles.container }>
          <TasksMapView
            tasks={ tasks }
            onMapReady={ () => this.onMapReady() }
            onMarkerCalloutPress={ task => navigate('CourierTask', { ...navigationParams, task }) }>
          </TasksMapView>
        </View>
        { this.renderLoader() }
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    top: dateSelectHeaderHeight
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 52, 52, 0.4)',
    zIndex: 20
  },
  websocketWarning: {
    backgroundColor: orangeColor,
    justifyContent: 'center',
    alignItems: 'center',
    height: websocketWarningHeight,
    zIndex: 2,
  },
  websocketWarningText: {
    color: whiteColor
  }
})

function mapStateToProps (state) {
  return {
    httpClient: state.app.httpClient,
    tasks: selectFilteredTasks(state),
    selectedDate: selectTaskSelectedDate(state),
    isLoadingTasks: selectIsTasksLoading(state),
    tasksLoadingError: selectIsTasksLoadingFailure(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    loadTasks: (client, selectedDate) => dispatch(loadTasks(client, selectedDate)),
    send: (msg) => dispatch(send(msg)),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(translate()(TasksPage))
