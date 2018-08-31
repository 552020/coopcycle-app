import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import {
  Container, Header, Title, Content, Footer,
  Left, Right, Body,
  Icon, Text, Button
} from 'native-base';
import { connectStyle } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import moment from 'moment/min/moment-with-locales'

import { formatPrice } from '../../Cart'
import LoaderOverlay from '../../components/LoaderOverlay'
import OrderSummary from '../../components/OrderSummary'
import { acceptOrder } from '../../redux/Restaurant/actions'
import { localeDetector } from '../../i18n'
import material from '../../../native-base-theme/variables/material'

moment.locale(localeDetector())

class OrderScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentWillReceiveProps(newProps) {
    // Go back when loading has finished
    if (this.props.loading === true && newProps.loading === false) {
      this.props.navigation.goBack()
    }
  }

  renderButtons() {

    const { order } = this.props.navigation.state.params
    const { navigate } = this.props.navigation

    if (order.state === 'new') {
      return (
        <Footer style={{ backgroundColor: '#fbfbfb' }}>
          <Grid>
            <Row>
              <Col style={{ padding: 10 }}>
                <TouchableOpacity
                  style={ [ styles.footerBtn, styles.refuseBtn ] }
                  onPress={() => navigate('RestaurantOrderRefuse', { order })}>
                  <Text style={ styles.refuseBtnText }>
                    { this.props.t('RESTAURANT_ORDER_BUTTON_REFUSE') }
                  </Text>
                </TouchableOpacity>
              </Col>
              <Col style={{ padding: 10 }}>
                <TouchableOpacity
                  style={ [ styles.footerBtn, styles.acceptBtn ] }
                  onPress={() => this.props.acceptOrder(this.props.httpClient, order)}>
                  <Text style={ styles.acceptBtnText }>
                    { this.props.t('RESTAURANT_ORDER_BUTTON_ACCEPT') }
                  </Text>
                </TouchableOpacity>
              </Col>
            </Row>
          </Grid>
        </Footer>
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

  render() {

    const { navigate } = this.props.navigation

    const { order } = this.props.navigation.state.params

    const preparationExpectedAt = moment(order.preparationExpectedAt).format('LT')
    const pickupExpectedAt = moment(order.pickupExpectedAt).format('LT')

    return (
      <Container>
        <Grid>
          <Row size={ 3 }>
            <Col>
              <Row>
                <View style={ styles.dateContainer }>
                  <Icon name="md-clock" />
                  <Text>{ this.props.t('RESTAURANT_ORDER_PREPARATION_EXPECTED_AT', { date: preparationExpectedAt }) }</Text>
                </View>
              </Row>
              <Row>
                <View style={ styles.dateContainer }>
                  <Icon name="md-bicycle" />
                  <Text>{ this.props.t('RESTAURANT_ORDER_PICKUP_EXPECTED_AT', { date: pickupExpectedAt }) }</Text>
                </View>
              </Row>
            </Col>
          </Row>
          <Row size={ 9 }>
            <Content padder>
              <OrderSummary order={ order } />
            </Content>
          </Row>
        </Grid>
        { this.renderButtons() }
        <LoaderOverlay loading={ this.props.loading } />
      </Container>
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
    fontWeight: 'bold'
  },
  acceptBtn: {
     borderColor: material.brandSuccess,
  },
  acceptBtnText: {
    color: material.brandSuccess,
    fontWeight: 'bold'
  },
  delayBtn: {
     borderColor: '#333',
  },
  delayBtnText: {
    color: '#333',
    fontWeight: 'bold'
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: material.contentPadding
  }
});

function mapStateToProps(state) {
  return {
    user: state.app.user,
    httpClient: state.app.httpClient,
    loading: state.restaurant.isFetching
  }
}

function mapDispatchToProps(dispatch) {
  return {
    acceptOrder: (client, order) => dispatch(acceptOrder(client, order)),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(translate()(OrderScreen))
