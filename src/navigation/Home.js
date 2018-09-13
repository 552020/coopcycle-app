import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
} from 'react-native'
import {
  Container, Header, Title, Content,
  Left, Right, Body,
  Text, Icon,
} from 'native-base'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'
import { Col, Row, Grid } from 'react-native-easy-grid';
import { translate } from 'react-i18next'

const styles = StyleSheet.create({
  restaurant: {
    backgroundColor: '#f5f5f5',
  },
  restaurantTitle: {
    fontWeight: 'bold',
    fontSize: scale(18),
    marginBottom: verticalScale(5)
  },
  restaurantText: {
    color: '#8a8a8a',
    fontSize: scale(14)
  },
  content: {
    backgroundColor: '#fff',
  },
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimerRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent:'center',
    marginBottom: verticalScale(5),
  }
});

export class Home extends Component {
  render() {
    const { height, width } = Dimensions.get('window')
    return (
      <Container>
        <Content style={ styles.content }>
          <View style={ styles.restaurant }>
            <Grid>
              <Col size={ 25 }>
                <View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent:'center' }}>
                  <Icon name="restaurant" style={{ color: '#e4022d' }} />
                </View>
              </Col>
              <Col size={ 75 } style={{ padding: moderateScale(20) }}>
                <Text style={styles.restaurantTitle}>{this.props.t('FIND_RESTAURANT')}</Text>
                <Text style={styles.restaurantText}>{this.props.t('SEARCH_NEARBY')}</Text>
              </Col>
            </Grid>
          </View>
          <View style={ styles.wrapper }>
            <Image
              style={{ width: width, height: width / 3.58 }}
              source={require('../assets/images/home-bg.png')} />
            <Grid style={{ paddingHorizontal: scale(20), marginTop: verticalScale(20) }}>
              <Row style={ styles.disclaimerRow }>
                <Text style={{ fontWeight: 'bold' }}>{`${this.props.t('WELCOME')} !`}</Text>
              </Row>
              <Row style={ styles.disclaimerRow }>
                <Text style={{ textAlign: 'center' }}>{`${this.props.t('ALPHA_DISCLAIMER')}.`}</Text>
              </Row>
              <Row style={ styles.disclaimerRow }>
                <Text style={{ textAlign: 'center' }}>{this.props.t('UPDATE_REMINDER')}</Text>
              </Row>
            </Grid>
          </View>
        </Content>
      </Container>
    )
  }
}

export default translate()(Home)
