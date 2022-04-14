import React, {Component} from 'react'
import {FlatList} from 'react-native'
import {Avatar, Box, ChevronRightIcon, HStack, Icon, Image, Stack, Text, View, VStack} from 'native-base'
import {withTranslation} from 'react-i18next'
import {connect} from 'react-redux'
import {Spacer} from 'native-base/src/components/primitives/Flex';
import {darkGreyColor, greyColor, lightGreyColor} from '../../styles/common';
import {TouchableOpacity} from 'react-native-gesture-handler';
import i18n from '../../i18n';
import {formatPrice} from '../../utils/formatting';

class Carts extends Component {

  _renderItem(item, index) {
    const { navigate } = this.props.navigation
    return <><TouchableOpacity onPress={() => navigate('CheckoutSummary', { cart: item.cart, restaurant: item.restaurant }) }>
        <HStack space={4} padding={2}>
        <Avatar size="lg" resizeMode="contain" borderRadius="full" source={{uri: item.restaurant.image}} alt={item.restaurant.name} />
        <VStack>
          <Text bold>{item.restaurant.name}</Text>
          <Text color={darkGreyColor}>{item.cart.items.length} {i18n.t('ITEM')} • {formatPrice(item.cart.total)}</Text>
          <Text color={darkGreyColor}>Livraison: 64 rue Maréchal Joffre</Text>
        </VStack>
        <Spacer/>
          <View style={{flexGrow: 1, justifyContent:'center', alignItems: 'flex-end'}}>
          <ChevronRightIcon />
          </View>
        </HStack>
      </TouchableOpacity>
      <Box marginLeft={20} marginRight={5} borderBottomWidth={1} borderColor={greyColor} />
    </>
  }

  render() {
    return <FlatList data={Object.values(this.props.carts)} renderItem={({ item, index }) => this._renderItem(item, index) } />
  }
}

function mapStateToProps(state) {

  return {
    carts: state.checkout.carts,
  }
}

function mapDispatchToProps(dispatch) {

  return { }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Carts))
