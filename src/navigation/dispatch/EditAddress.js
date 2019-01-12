import React, { Component } from 'react';
import { InteractionManager, View } from 'react-native';
import { translate } from 'react-i18next'
import {
  Container, Content,
  Left, Right,
  Icon, Text, Button,
  Footer, FooterTab
} from 'native-base'

import AddressForm from '../../components/DeliveryAddressForm'

class EditAddress extends Component {

  _onCancel() {
    this.props.navigation.goBack()
  }

  _onSubmit() {
    const { onSubmit } = this.props.navigation.state.params
    const address = this.addressForm.getWrappedInstance().createDeliveryAddress()
    onSubmit(address)
    this.props.navigation.goBack()
  }

  render() {

    const { address } = this.props.navigation.state.params

    return (
      <Container>
        <Content>
          <AddressForm
            ref={ component => this.addressForm = component }
            { ...address }
            extended />
        </Content>
        <Footer style={{ backgroundColor: '#3498DB' }}>
          <FooterTab style={{ backgroundColor: '#3498DB' }}>
            <Button full onPress={ this._onCancel.bind(this) }>
              <Text style={{ fontSize: 18, color: '#fff' }}>{ this.props.t('CANCEL') }</Text>
            </Button>
          </FooterTab>
          <FooterTab style={{ backgroundColor: '#3498DB' }}>
            <Button full onPress={ this._onSubmit.bind(this) }>
              <Text style={{ fontSize: 18, color: '#fff' }}>{ this.props.t('SUBMIT') }</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

export default translate()(EditAddress)
