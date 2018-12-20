import React from 'react'
import { View } from 'react-native'
import { Icon } from 'native-base'
import HeaderButton from '../components/HeaderButton'

import Home from './Home'
import DispatchUnassignedTasks from './dispatch/UnassignedTasks'
import DispatchTaskLists from './dispatch/TaskLists'
import DispatchTaskList from './dispatch/TaskList'
import DispatchAddUser from './dispatch/AddUser'
import DispatchAddTask from './dispatch/AddTask'
import DispatchDate from './dispatch/Date'
import DispatchAssignTask from './dispatch/AssignTask'
import { primaryColor,  whiteColor, fontTitleName } from '../styles/common'

export default {
  RestaurantsPage: require('./RestaurantsPage'),
  RestaurantPage: require('./RestaurantPage'),
  RestaurantList: require('./restaurant/List'),
  RestaurantDashboard: require('./restaurant/Dashboard'),
  RestaurantOrder: require('./restaurant/Order'),
  RestaurantOrderRefuse: require('./restaurant/OrderRefuse'),
  RestaurantOrderDelay: require('./restaurant/OrderDelay'),
  RestaurantOrderCancel: require('./restaurant/OrderCancel'),
  RestaurantDate: require('./restaurant/Date'),
  RestaurantSettings: require('./restaurant/Settings'),
  RestaurantProducts: require('./restaurant/Products'),
  RestaurantOpeningHours: require('./restaurant/OpeningHours'),
  CheckoutProductOptions: require('./checkout/ProductOptions'),
  CheckoutEditItem: require('./checkout/EditItem'),
  CheckoutLogin: require('./checkout/Login'),
  CartPage: require('./CartPage'),
  CartAddressPage: require('./CartAddressPage'),
  CourierTasksPage: require('./courier/TasksPage'),
  CourierTaskListPage: require('./courier/TaskListPage'),
  CourierTaskPage: require('./courier/TaskPage'),
  CourierTaskHistoryPage: require('./courier/TaskHistoryPage'),
  CourierTaskComplete: require('./courier/CompleteTask'),
  CourierSettings: require('./courier/Settings'),
  CourierSettingsTags: require('./courier/Tags'),
  AccountPage: require('./AccountPage'),
  AccountAddressesPage: require('./account/AccountAddressesPage'),
  AccountOrdersPage: require('./account/AccountOrdersPage'),
  AccountDetailsPage: require('./account/AccountDetailsPage'),
  CreditCardPage: require('./CreditCardPage'),
  OrderTrackingPage: require('./OrderTrackingPage'),
  DispatchUnassignedTasks,
  DispatchTaskLists,
  DispatchTaskList,
  DispatchAddUser,
  DispatchAddTask,
  DispatchDate,
  DispatchAssignTask,
  Loading: require('./Loading'),
  Home,
  ConfigureServer: require('./ConfigureServer')
}

export const defaultNavigationOptions = {
  headerStyle: {
    backgroundColor: primaryColor,
  },
  headerBackTitleStyle: {
    color: whiteColor,
    fontWeight: 'normal',
    fontFamily: fontTitleName
  },
  headerTintColor: whiteColor,
  headerTitleStyle: {
    color: whiteColor,
    // fontWeight needs to be defined or it doesn't work
    // @see https://github.com/react-community/react-navigation/issues/542#issuecomment-345289122
    fontWeight: 'normal',
    fontFamily: fontTitleName
  },
}

export const headerLeft = navigation => {
  return (
    <HeaderButton iconName="menu" onPress={ () => navigation.toggleDrawer() } />
  )
}
