import React, { Component } from 'react'
import { View } from 'react-native'
import { Icon, Text } from 'native-base'
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation'

import i18n from '../../i18n'
import HeaderRightButton from '../dispatch/HeaderRightButton'
import navigation, { defaultNavigationOptions, headerLeft } from '..'
import HeaderButton from '../../components/HeaderButton'

const Tabs = createBottomTabNavigator({
  DispatchUnassignedTasks: {
    screen: navigation.DispatchUnassignedTasks,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('DISPATCH_UNASSIGNED_TASKS'),
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        return (
          <Icon type="FontAwesome" name="clock-o" style={{ color: tintColor }} />
        )
      },
    })
  },
  DispatchTaskLists: {
    screen: navigation.DispatchTaskLists,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('DISPATCH_TASK_LISTS'),
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        return (
          <Icon type="FontAwesome" name="user" style={{ color: tintColor }} />
        )
      }
    })
  },
}, {
  tabBarOptions: {
    showLabel: true,
    showIcon: true
  }
})

const MainNavigator = createStackNavigator({
  DispatchHome: {
    screen: Tabs,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('DISPATCH'),
      headerLeft: headerLeft(navigation),
      headerRight: (
        <HeaderRightButton onPress={ () => navigation.navigate('DispatchDate') } />
      )
    })
  },
  DispatchTaskList: {
    screen: navigation.DispatchTaskList,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('DISPATCH_TASK_LIST', { username: navigation.state.params.taskList.username }),
    })
  },
  Task: {
    screen: navigation.CourierTaskPage,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('DISPATCH_TASK', { id: navigation.state.params.task.id }),
      headerRight: (
        <HeaderButton
          iconType="FontAwesome5" iconName="file-signature"
          iconStyle={{ fontSize: 18 }}
          onPress={ () => navigation.navigate('TaskSignature', { task: navigation.getParam('task') }) } />
      )
    }),
  },
  TaskComplete: {
    screen: navigation.CourierTaskComplete,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('END', { id: navigation.state.params.task.id }),
    })
  }
}, {
  initialRouteKey: 'DispatchHome',
  initialRouteName: 'DispatchHome',
  defaultNavigationOptions
})

const AddTaskNavigator = createStackNavigator({
  DispatchAddTaskHome: {
    screen: navigation.DispatchAddTask,
    navigationOptions: ({ navigation }) => ({
      // Use header = null to get rid of the header
      // The screen's header will be used
      header: null,
    })
  },
  DispatchEditAddress: {
    screen: navigation.DispatchEditAddress,
    navigationOptions: ({ navigation }) => ({
      // Use header = null to get rid of the header
      // The screen's header will be used
      header: null,
    })
  }
}, {
  initialRouteName: 'DispatchAddTaskHome',
  defaultNavigationOptions
})

export default createStackNavigator({
  Main: {
    screen: MainNavigator,
    navigationOptions: ({ navigation }) => ({
      // Use header = null to get rid of the header
      // The screen's header will be used
      header: null,
    })
  },
  DispatchPickUser: {
    screen: navigation.DispatchPickUser,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('DISPATCH_PICK_USER'),
    })
  },
  DispatchAddTask: {
    screen: AddTaskNavigator,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('DISPATCH_ADD_TASK'),
    })
  },
  DispatchDate: {
    screen: navigation.DispatchDate,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('DISPATCH_DATE'),
    })
  },
  DispatchAssignTask: {
    screen: navigation.DispatchAssignTask,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('DISPATCH_ASSIGN_TASK'),
    })
  },
  DispatchTaskSignature: {
    screen: navigation.CourierSignature,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('SIGNATURE')
    })
  }
}, {
  mode: 'modal',
  defaultNavigationOptions
})
