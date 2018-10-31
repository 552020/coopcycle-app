import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator
} from 'react-native';
import {
  Container, Header, Title, Content,
  Left, Right, Body,
  Button, Text, Icon, List, ListItem, Thumbnail,
  Card, CardItem
} from 'native-base';
import _ from 'lodash'
import moment from 'moment'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import RestaurantSearch from '../components/RestaurantSearch'
import RestaurantList from '../components/RestaurantList'

class RestaurantsPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      restaurants: props.restaurants || [],
      deliveryAddress: null,
      deliveryDay: null
    }
  }

  request(latitude, longitude, distance) {
    return this.props.httpClient.get('/api/restaurants?coordinate=' + [latitude, longitude] + '&distance=' + distance)
  }

  onChange(deliveryAddress, deliveryDay) {
    if (deliveryAddress) {

      this.setState({ loading: true, restaurants: [] })

      const { latitude, longitude } = deliveryAddress.geo
      this.request(latitude, longitude, 3000)
        .then(data => {

          let restaurants = data['hydra:member']
          if (deliveryDay) {
            restaurants = _.filter(restaurants, restaurant => {
              for (let i = 0; i < restaurant.availabilities.length; i++) {
                if (moment(restaurant.availabilities[i]).isSame(deliveryDay, 'day')) {
                  return true
                }
              }

              return false
            })
          }

          this.setState({ deliveryAddress, deliveryDay, restaurants, loading: false })
        })
    }
  }

  renderWarning() {

    const { deliveryDay, restaurants, loading } = this.state

    if (!loading && deliveryDay && restaurants.length === 0) {
      return (
        <View style={{ paddingHorizontal: 10, marginTop: 30 }}>
          <Card>
            <CardItem>
              <Body>
                <Text>
                  {this.props.t('NO_RESTAURANTS')}
                </Text>
                <Text>
                  {`${this.props.t('SEARCH_WITHOUT_DATE')} ?`}
                </Text>
                <Button block style={{ marginTop: 10 }} onPress={ () => this.restaurantSearch.resetDeliveryDate() }>
                  <Text>{this.props.t('SEARCH_AGAIN')}</Text>
                </Button>
              </Body>
            </CardItem>
          </Card>
        </View>
      )
    }

    return (
      <View />
    )
  }

  render() {

    const { navigate } = this.props.navigation
    const { deliveryAddress, deliveryDay, restaurants } = this.state

    return (
      <Container>
        <Content>
          <RestaurantSearch
            ref={ component => this.restaurantSearch = component }
            onChange={ this.onChange.bind(this) } />
          <RestaurantList
            baseURL={ this.props.baseURL }
            restaurants={ restaurants }
            deliveryDay={ deliveryDay }
            onItemClick={ (restaurant, deliveryDate) => navigate('Restaurant', { restaurant, deliveryAddress, deliveryDate }) } />
          { this.renderWarning() }
          <View style={styles.loader}>
            <ActivityIndicator
              animating={ this.state.loading }
              size="large"
              color="#0000ff"
            />
          </View>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    marginTop: 50,
    // ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

function mapStateToProps(state) {
  return {
    baseURL: state.app.baseURL,
    httpClient: state.app.httpClient
  }
}

module.exports = connect(mapStateToProps)(translate()(RestaurantsPage))
