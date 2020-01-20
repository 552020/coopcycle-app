import React, { Component } from 'react';
import { Dimensions, StyleSheet, View, TouchableOpacity } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import {
  Container, Content, Footer,
  Left,
  Icon, Text, Button,
  Card, CardItem,
} from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import moment from 'moment'
import { phonecall } from 'react-native-communications'
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber'
import { SwipeRow } from 'react-native-swipe-list-view'

import OrderItems from '../../components/OrderItems'
import { acceptOrder, setCurrentOrder, printOrder } from '../../redux/Restaurant/actions'
import material from '../../../native-base-theme/variables/material'

const phoneNumberUtil = PhoneNumberUtil.getInstance()

class OrderScreen extends Component {

  constructor(props) {
    super(props)
    this.state = {
      openValue: 0,
    }
    this.onSwipeValueChange = this.onSwipeValueChange.bind(this)
    this.onRowOpen = this.onRowOpen.bind(this)
  }

  componentDidFocus(payload) {
    this.props.setCurrentOrder(this.props.order)
  }

  componentWillBlur(payload) {
    this.props.setCurrentOrder(null)
  }

  _print() {
    const { order } = this.props
    this.props.printOrder(order)
  }

  renderActionButtons() {

    const { order } = this.props
    const { navigate } = this.props.navigation

    if (order.state === 'new') {
      return (
        <View style={{ backgroundColor: '#fefefe' }}>
          <View style={{ padding: 20 }} onLayout={ event => this.setState({ openValue: (event.nativeEvent.layout.width * 0.7) }) }>
            <SwipeRow
              leftOpenValue={ this.state.openValue }
              rightOpenValue={ (this.state.openValue * -1) }
              onRowOpen={ this.onRowOpen }
              onSwipeValueChange={ this.onSwipeValueChange }>
              <View style={ styles.swipeBg }>
                <Text>{ this.props.t('RESTAURANT_ORDER_BUTTON_ACCEPT') }</Text>
                <Text>{ this.props.t('RESTAURANT_ORDER_BUTTON_REFUSE') }</Text>
              </View>
              <View style={ styles.swipeFg }>
                <Icon type="FontAwesome" name="angle-double-left" />
                <Icon type="FontAwesome" name="angle-double-right" />
              </View>
            </SwipeRow>
          </View>
          <Text note style={{ textAlign: 'center', marginBottom: 20 }}>{ this.props.t('SWIPE_TO_ACCEPT_REFUSE') }</Text>
        </View>
      )
    }

    if (order.state === 'accepted') {
      return (
        <Footer style={{ backgroundColor: '#fbfbfb' }}>
          <Grid>
            <Row>
              <Col style={{ padding: 10 }}>
                <TouchableOpacity
                  style={ [ styles.footerBtn, styles.refuseBtn ] }
                  onPress={() => navigate('RestaurantOrderCancel', { order })}>
                  <Text style={ styles.refuseBtnText }>
                    { this.props.t('RESTAURANT_ORDER_BUTTON_CANCEL') }
                  </Text>
                </TouchableOpacity>
              </Col>
              <Col style={{ padding: 10 }}>
                <TouchableOpacity
                  style={ [ styles.footerBtn, styles.delayBtn ] }
                  onPress={() => navigate('RestaurantOrderDelay', { order })}>
                  <Text style={ styles.delayBtnText }>
                    { this.props.t('RESTAURANT_ORDER_BUTTON_DELAY') }
                  </Text>
                </TouchableOpacity>
              </Col>
            </Row>
          </Grid>
        </Footer>
      )
    }
  }

  renderHeading() {

    const { order } = this.props

    if (order.state !== 'refused' && order.state !== 'cancelled') {

      const preparationExpectedAt = moment.parseZone(order.preparationExpectedAt).format('LT')
      const pickupExpectedAt = moment.parseZone(order.pickupExpectedAt).format('LT')

      return (
        <View style={{ flex: 2, marginBottom: 15 }}>
          <View style={{ flex: 1 }}>
            <View style={ styles.dateContainer }>
              <Icon name="md-clock" />
              <Text>{ this.props.t('RESTAURANT_ORDER_PREPARATION_EXPECTED_AT', { date: preparationExpectedAt }) }</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={ styles.dateContainer }>
              <Icon name="md-bicycle" />
              <Text>{ this.props.t('RESTAURANT_ORDER_PICKUP_EXPECTED_AT', { date: pickupExpectedAt }) }</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            { this.renderButtons() }
          </View>
        </View>
      )
    }
  }

  renderNotes() {

    const { order } = this.props

    if (order.notes) {
      return (
        <Card>
          <CardItem>
            <Left>
              <Icon name="quote" />
              <Text note>{ order.notes }</Text>
            </Left>
          </CardItem>
        </Card>
      )
    }
  }

  renderButtons() {

    const { order, thermalPrinterConnected } = this.props

    let phoneNumber
    let isPhoneValid = false

    try {
      phoneNumber = phoneNumberUtil.parse(order.customer.telephone)
      isPhoneValid = true
    } catch (e) {}

    return (
      <View style={ styles.dateContainer }>
        { thermalPrinterConnected && (
        <Button small iconLeft onPress={ () => this._print() }>
          <Icon type="FontAwesome" name="print" />
          <Text>{ this.props.t('RESTAURANT_ORDER_PRINT') }</Text>
        </Button>
        )}
        { !thermalPrinterConnected && (
        <Button small light iconLeft onPress={ () => this.props.navigation.navigate('RestaurantPrinter') }>
          <Icon type="FontAwesome" name="print" />
          <Text>{ this.props.t('RESTAURANT_ORDER_CONNECT_PRINTER') }</Text>
        </Button>
        )}
        { isPhoneValid && (
        <Button small iconLeft success
          onPress={ () => phonecall(order.customer.telephone, true) }>
          <Icon name="call" />
          <Text>{ phoneNumberUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL) }</Text>
        </Button>
        )}
      </View>
    )
  }

  onSwipeValueChange({ key, value }) {
    // TODO Animate color
  }

  onRowOpen(value) {
    if (value > 0) {
      this.props.acceptOrder(this.props.httpClient, this.props.order)
    } else {
      this.props.navigation.navigate('RestaurantOrderRefuse', { order: this.props.order })
    }
  }

  render() {

    const { order } = this.props

    return (
      <View style={{ flex: 1 }}>
        <NavigationEvents
          onDidFocus={ this.componentDidFocus.bind(this) }
          onWillBlur={ this.componentWillBlur.bind(this) } />
        { this.renderHeading() }
        <View style={{ flex: 8 }}>
          <OrderItems order={ order } />
          { this.renderNotes() }
        </View>
        { this.renderActionButtons() }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  footerBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  refuseBtn: {
    borderColor: material.brandDanger,
  },
  refuseBtnText: {
    color: material.brandDanger,
    fontWeight: 'bold',
  },
  acceptBtn: {
     borderColor: material.brandSuccess,
  },
  acceptBtnText: {
    color: material.brandSuccess,
    fontWeight: 'bold',
  },
  delayBtn: {
     borderColor: '#333',
  },
  delayBtnText: {
    color: '#333',
    fontWeight: 'bold',
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: material.contentPadding,
  },
  swipeBg: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: "#e7e7e7",
    paddingHorizontal: 30,
  },
  swipeFg: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 30,
    borderWidth: 1,
    borderColor: "#e7e7e7",
    backgroundColor: '#ffffff',
  },
});

function mapStateToProps(state, ownProps) {
  return {
    httpClient: state.app.httpClient,
    order: state.restaurant.order || ownProps.navigation.state.params.order,
    thermalPrinterConnected: !!state.restaurant.printer,
    printer: state.restaurant.printer,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    acceptOrder: (client, order) => dispatch(acceptOrder(client, order)),
    setCurrentOrder: (order) => dispatch(setCurrentOrder(order)),
    printOrder: (order) => dispatch(printOrder(order)),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(withTranslation()(OrderScreen))
