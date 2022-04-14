import React from 'react'
import { ImageBackground, StyleSheet, View, Animated } from 'react-native'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import {Text, Center, HStack, Skeleton, VStack, Button, Heading} from 'native-base';
import _ from 'lodash'
import moment from 'moment'

import CartFooter from './components/CartFooter'
import ExpiredSessionModal from './components/ExpiredSessionModal'

import Menu from '../../components/Menu'

import {
  init,
  addItem,
  hideAddressModal,
  resetRestaurant,
  setAddress,
  initOrSelectCart,
} from '../../redux/Checkout/actions'
import DangerAlert from '../../components/DangerAlert';
import { shouldShowPreOrder } from '../../utils/checkout'
import {useQuery} from 'react-query';
import i18n from '../../i18n';

const GroupImageHeader = ({ restaurant, scale }) => {

  return (
    <Animated.View style={{
      width: '100%',
      height: '100%',
      }}>
      <ImageBackground source={{ uri: restaurant.image }} style={{ width: '100%', height: '100%' }}>
        <View style={ styles.overlay }>
          <View style={{ height: 60, justifyContent: 'center' }}>
            <Text style={ styles.restaurantName } numberOfLines={ 1 }>{ restaurant.name }</Text>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const LoadingPhantom = () => <Center w="100%">
  <HStack w="95%" space={8} p="4">
    <VStack flex="3" space="4">
      <Skeleton flex={1} />
      <Skeleton.Text flex={1} noOfLines={2} lineHeight={2} />
      <HStack space="2" alignItems="center">
        <Skeleton size="4" rounded="full" />
        <Skeleton h="3" flex="2" rounded="full" />
        <Skeleton h="3" flex="1" rounded="full" startColor="cyan.300" />
      </HStack>
    </VStack>
    <Skeleton flex="1" h="100" w="100" rounded="md" />
  </HStack>
  <HStack w="95%" space={8} p="4">
    <VStack flex="3" space="4">
      <Skeleton flex={1} />
      <Skeleton.Text flex={1} noOfLines={2} lineHeight={2} />
      <HStack space="2" alignItems="center">
        <Skeleton size="4" rounded="full" />
        <Skeleton h="3" flex="2" rounded="full" />
        <Skeleton h="3" flex="1" rounded="full" />
      </HStack>
    </VStack>
    <Skeleton flex="1" h="100" w="100" rounded="md" />
  </HStack>
  <HStack w="95%" space={8} p="4">
    <VStack flex="3" space="4">
      <Skeleton flex={1} />
      <Skeleton.Text flex={1} noOfLines={2} lineHeight={2} />
      <HStack space="2" alignItems="center">
        <Skeleton size="4" rounded="full" />
        <Skeleton h="3" flex="2" rounded="full" />
        <Skeleton h="3" flex="1" rounded="full" startColor="amber.300" />
      </HStack>
    </VStack>
    <Skeleton flex="1" h="100" w="100" rounded="md" />
  </HStack>
</Center>

function hasValidTiming(timing) {
  return timing !== null && timing.range[0] !== timing.range[1]
}

function renderNotAvailableWarning(restaurant, isAvailable) {
  if (isAvailable) {
    return (
      <DangerAlert
        text={`${i18n.t('RESTAURANT_CLOSED_AND_NOT_AVAILABLE', {
          datetime: moment(restaurant.nextOpeningDate).calendar(moment(), {
            sameElse: 'llll',
          }),
        })}`}
      />
    )
  }
}

function renderClosedNowWarning(restaurant, isAvailable) {
  if (isAvailable && shouldShowPreOrder(restaurant)) {
    return (
      <DangerAlert
        text={`${i18n.t('RESTAURANT_CLOSED_BUT_OPENS', {
          datetime: moment(restaurant.nextOpeningDate).calendar(moment(), {
            sameElse: 'llll',
          }),
        })}`}
      />
    )
  }
}

function Restaurant(props) {
  const { navigate } = props.navigation
  const { isCartEmpty, httpClient, restaurant } = props
  const isAvailable = (hasValidTiming(restaurant.timing.collection)) ||
  hasValidTiming(restaurant.timing.delivery)

  const { isLoading, isError, data } = useQuery(['menus', restaurant.hasMenu], async () => {
    return await httpClient.get(restaurant.hasMenu, {}, { anonymous: true })
  })

  //TODO: improve failed view
  if (isError) {
    return <Center w="95%">
      <Heading>{i18n.t('AN_ERROR_OCCURRED')} </Heading>
      <Text>{i18n.t('TRY_LATER')}</Text>
      <Button>{i18n.t('RETRY')}</Button>
    </Center>
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 60 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 60 }}>
          <GroupImageHeader restaurant={ restaurant } />
        </View>
        {renderNotAvailableWarning(restaurant, isAvailable)}
        {renderClosedNowWarning(restaurant, isAvailable)}
        { isLoading && LoadingPhantom() }
        { !isLoading && <Menu
          restaurant={ restaurant }
          menu={ data }
          onItemClick={ menuItem => navigate('CheckoutProductDetails', { product: menuItem, restaurant }) }
          isItemLoading={ menuItem => {
            return _.includes(props.loadingItems, menuItem.identifier)
          } } />}
      </View>
      { !isCartEmpty && (
        <CartFooter
          onSubmit={ () => navigate('CheckoutSummary') }
          cart={props.cart}
          testID="cartSubmit"
          disabled={ isLoading } />
      )}
      <ExpiredSessionModal
        onModalHide={ () => navigate('CheckoutHome') } />
    </View>
  )
}



const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor:'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantName: {
    color: '#ffffff',
    fontFamily: 'Raleway-Regular',
    fontWeight: 'bold',
  },
});

function mapStateToProps(state, ownProps) {

  const restaurant = ownProps.route.params?.restaurant
  const cart = state.checkout.carts[restaurant['@id']]?.cart
  const isCartEmpty = !state.checkout.carts[restaurant['@id']] ? true : cart.items.length === 0

  return {
    isCartEmpty,
    restaurant,
    cart,
    address: state.checkout.address,
    loadingItems: state.checkout.itemRequestStack,
    isExpiredSessionModalVisible: state.checkout.isExpiredSessionModalVisible,
    httpClient: state.app.httpClient,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    resetRestaurant: restaurant => dispatch(resetRestaurant(restaurant)),
    addItem: item => dispatch(addItem(item)),
    setAddress: address => dispatch(setAddress(address)),
    hideAddressModal: () => dispatch(hideAddressModal()),
    initOrSelectCart: restaurant => dispatch(initOrSelectCart(restaurant)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Restaurant))
