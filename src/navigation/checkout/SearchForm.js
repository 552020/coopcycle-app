import React, {Component} from 'react';
import {Box, Button, FormControl, HStack, Input, Stack, Switch, Text, VStack} from 'native-base';
import {withTranslation} from 'react-i18next';
import i18n from '../../i18n';
import {applyRestaurantsFilters, clearRestaurantsFilters} from '../../redux/Checkout/actions';
import {connect} from 'react-redux';
import {filterActive} from '../../redux/Checkout/selectors';

class SearchForm extends Component {

    constructor(props) {
      super(props);
      this.state = {
        loading: false,
        query: null,
      };
    }

    _setFilter = () => {
      this.setState({loading: true})
      this.props.applyRestaurantsFilters({
        query: this.state.query,
      })
      this.props.navigation.goBack()
      this.setState({loading: false})
    }

    _clearFilter = () => {
      this.props.clearRestaurantsFilters()
      this.props.navigation.goBack()
    }

  render() {

    return <Box padding={5}><FormControl>
      <Stack space={5}>
        <Stack>
          <Input size="xl" p={2} onChangeText={(q) => this.setState({...{query: q}})} placeholder={i18n.t('SEARCH')} />
        </Stack>
        <HStack alignItems="center" space={4}>
          <Switch size="md" />
          <Text>Végan</Text>
        </HStack>
        <HStack alignItems="center" space={4}>
          <Switch size="md" />
          <Text>Sans arachides</Text>
        </HStack>
        <VStack><Button onPress={this._setFilter} isLoading={this.state.loading} colorScheme="success">{i18n.t('FILTER')}</Button></VStack>
        <VStack><Button onPress={this._clearFilter} isDisabled={!this.props.filterActive} colorScheme="success">{i18n.t('RESET')}</Button></VStack>
       </Stack>
    </FormControl></Box>
  }
}


function mapStateToProps(state) {

  return {
    restaurantsFilter: state.checkout.restaurantsFilter,
    filterActive: filterActive(state),
  }
}

function mapDispatchToProps(dispatch) {

  return {
    applyRestaurantsFilters: (filter) => dispatch(applyRestaurantsFilters(filter)),
    clearRestaurantsFilters: () => dispatch(clearRestaurantsFilters())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SearchForm))
