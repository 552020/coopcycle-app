import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Modal,
} from 'react-native';
import {
  Container,
  Header, Footer, Title, Content,
  Left, Right, Body,
  List, ListItem,
  InputGroup, Input,
  Icon, Picker, Button, Text,
  Card, CardItem
} from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import LoginForm from '../components/LoginForm'
import CartFooter from '../components/CartFooter'
import { formatPrice } from '../Cart'

const AppUser = require('../AppUser');

class CartPage extends Component {

  constructor(props) {
    super(props);

    const { cart } = this.props.navigation.state.params

    this.state = {
      cart: cart,
      loading: false,
      loginModalVisible: false,
      modalVisible: false,
      editing: null,
    };
  }

  _renderRow(item) {
    return (
      <ListItem key={ item.key } onPress={() => this.setState({ editing: item, modalVisible: true })}>
        <Body>
          <Text>{ item.name }</Text>
          <Text note>{ formatPrice(item.price) } € x { item.quantity }</Text>
        </Body>
        <Right>
          <Button danger transparent onPress={() => {

            const { cart } = this.state
            const { onCartUpdate } = this.props.navigation.state.params

            cart.deleteItem(item)

            onCartUpdate(cart)
            this.setState({ cart })

          }}>
            <Icon name="trash" />
          </Button>
        </Right>
      </ListItem>
    )
  }

  onSubmit() {

    const { navigate } = this.props.navigation
    const { deliveryAddress } = this.props.navigation.state.params
    const { cart } = this.state

    AppUser.load()
      .then((user) => {
        if (user.hasCredentials()) {
          navigate('CartAddress', { cart, deliveryAddress })
        } else {
          this.setState({ loginModalVisible: true })
        }
      });
  }

  onLoginSuccess(user) {
    const { navigate } = this.props.navigation
    const { deliveryAddress } = this.props.navigation.state.params
    const { cart } = this.state

    this.setState({ loginModalVisible: false })
    navigate('CartAddress', { cart, deliveryAddress })
  }

  onLoginFail(message) {
    console.log('onLoginFail', message)
  }

  decrement() {
    if (this.state.editing.quantity > 0) {
      this.state.editing.decrement()

      const cart = this.state.editing.cart.clone()

      const { onCartUpdate } = this.props.navigation.state.params
      onCartUpdate(cart)

      if (this.state.editing.quantity === 0) {
        this.setState({
          cart: cart,
          editing: null,
          modalVisible: false,
        })
      } else {
        this.setState({ cart })
      }
    }
  }

  increment() {
    this.state.editing.increment()

    const cart = this.state.editing.cart.clone()

    const { onCartUpdate } = this.props.navigation.state.params
    onCartUpdate(cart)

    this.setState({ cart })
  }

  renderModal() {
    return (
      <Modal
        animationType={ 'slide' }
        transparent={ true }
        visible={ this.state.modalVisible }
        onRequestClose={ () => this.setState({ modalVisible: false }) }>
        <View style={ styles.modalWrapper }>
          <Container>
            <Header>
              <Left>
                <Button transparent onPress={ () => this.setState({ modalVisible: false }) }>
                  <Icon name="close" style={{ color: '#fff' }} />
                </Button>
              </Left>
              <Body>
                <Title>{ this.state.editing ? this.state.editing.name : '' }</Title>
              </Body>
              <Right />
            </Header>
            <Content>
              <Grid>
                <Row style={{ paddingVertical: 30, paddingHorizontal: 10 }}>
                  <Col>
                    <Card>
                      <CardItem>
                        <Body>
                          <Text style={{ textAlign: 'center' }}>
                            {this.props.t('CHANGE_QUANT')}
                          </Text>
                        </Body>
                      </CardItem>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <View style={ styles.modalDecrement }>
                      <Button bordered rounded onPress={ () => this.decrement() }>
                        <Icon name="remove" />
                      </Button>
                    </View>
                  </Col>
                  <Col>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Text>{ this.state.editing ? this.state.editing.quantity : '0' }</Text>
                    </View>
                  </Col>
                  <Col>
                    <View style={ styles.modalIncrement }>
                      <Button bordered rounded onPress={ () => this.increment() }>
                        <Icon name="add" />
                      </Button>
                    </View>
                  </Col>
                </Row>
                <Row style={{ paddingVertical: 30 }}>
                  <Col>
                    <View style={{ paddingHorizontal: 10, marginTop: 20 }}>
                      <Button bordered block onPress={() => this.setState({ editing: null, modalVisible: false })}>
                        <Text>{this.props.t('SUBMIT')}</Text>
                      </Button>
                    </View>
                  </Col>
                </Row>
              </Grid>
            </Content>
          </Container>
        </View>
      </Modal>
    );
  }

  renderLoginModal() {
    return (
      <Modal
        animationType={ 'slide' }
        transparent={ true }
        visible={ this.state.loginModalVisible }
        onRequestClose={() => this.setState({ loginModalVisible: false })}>
        <View style={ styles.modalWrapper }>
          <Container>
            <Content>
              <LoginForm
                client={ this.props.httpClient }
                onRequestStart={ () => this.setState({ loading: true }) }
                onRequestEnd={ () => this.setState({ loading: false }) }
                onLoginSuccess={ this.onLoginSuccess.bind(this) }
                onLoginFail={ this.onLoginFail.bind(this) } />
            </Content>
          </Container>
        </View>
      </Modal>
    )
  }

  renderTotal() {

    const { cart } = this.state

    return (
      <List>
        <ListItem>
          <Body>
            <Text>{this.props.t('TOTAL_ITEMS')}</Text>
          </Body>
          <Right>
            <Text style={{ fontWeight: 'bold' }}>{ formatPrice(cart.totalItems) } €</Text>
          </Right>
        </ListItem>
        <ListItem>
          <Body>
            <Text>{this.props.t('TOTAL_DELIVERY')}</Text>
          </Body>
          <Right>
            <Text style={{ fontWeight: 'bold' }}>{ formatPrice(cart.totalDelivery) } €</Text>
          </Right>
        </ListItem>
        <ListItem>
          <Body>
            <Text>{this.props.t('TOTAL')}</Text>
          </Body>
          <Right>
            <Text style={{ fontWeight: 'bold' }}>{ formatPrice(cart.total) } €</Text>
          </Right>
        </ListItem>
      </List>
    )
  }

  render() {

    const { restaurant, deliveryAddress } = this.props.navigation.state.params
    const { cart } = this.state

    return (
      <Container>
        <Content style={ styles.content }>
          { this.renderModal() }
          { this.renderLoginModal() }
          <Title style={ styles.title }>{this.props.t('YOUR_CART')}</Title>
          <List style={{ marginBottom: 20 }}>
            { cart.items.map(this._renderRow.bind(this)) }
          </List>
          <Title style={ styles.title }>{this.props.t('TOTAL')}</Title>
          { this.renderTotal() }
        </Content>
        <CartFooter
          cart={ cart }
          onSubmit={ this.onSubmit.bind(this) }  />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#fff'
  },
  title: {
    textAlign: 'left',
    color: '#d9d9d9',
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16
  },
  modalWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff'
  },
  modalDecrement: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
  },
  modalIncrement: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  }
});

function mapStateToProps(state) {
  return {
    httpClient: state.app.httpClient
  }
}

module.exports = connect(mapStateToProps)(translate()(CartPage))
