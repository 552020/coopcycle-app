import React, { Component } from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Icon, Text, Thumbnail } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid'
import slugify from 'slugify'
import moment from 'moment'
import _ from 'lodash'
import { translate } from 'react-i18next'

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 15,
    backgroundColor: '#fff'
  },
  item: {
    paddingVertical: 10,
    borderBottomColor: '#f7f7f7',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  restaurantNameText: {
    marginBottom: 5
  }
});

class RestaurantList extends Component {

  renderItem(restaurant) {

    const { deliveryDay } = this.props

    let firstDeliveryDate = moment(restaurant.availabilities[0])

    if (deliveryDay) {
      firstDeliveryDate = _.find(restaurant.availabilities, availability => moment(availability).isSame(deliveryDay, 'day'))
    }

    // Add 30 minutes to make sure there is time
    firstDeliveryDate = firstDeliveryDate.add(30, 'minutes')

    return (
      <TouchableOpacity style={ styles.item } onPress={ () => this.props.onItemClick(restaurant, firstDeliveryDate) }>
        <Grid>
          <Col size={ 1 }>
            <Thumbnail size={60} source={{ uri: restaurant.image }} />
          </Col>
          <Col size={ 4 } style={{ paddingLeft: 10 }}>
            <Text style={ styles.restaurantNameText }>{ restaurant.name }</Text>
            <Text note>{ restaurant.address.streetAddress }</Text>
            <Text note style={{ fontWeight: 'bold' }}>
              { `${this.props.t('FROM')}  ${moment(firstDeliveryDate).format('dddd LT')}` }
            </Text>
          </Col>
        </Grid>
      </TouchableOpacity>
    )
  }

  render() {

    if (this.props.restaurants.length === 0) {

      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="search" style={{ color: '#cccccc' }} />
          <Text note>{ this.props.t('ENTER_ADDRESS') }</Text>
        </View>
      )
    }

    return (
      <View style={ styles.wrapper }>
        <FlatList
          data={ this.props.restaurants }
          keyExtractor={ (item, index) => item['@id'] }
          renderItem={ ({ item }) => this.renderItem(item) } />
      </View>
    )
  }
}

export default translate()(RestaurantList)
