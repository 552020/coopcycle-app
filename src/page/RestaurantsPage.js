import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Navigator,
  TouchableHighlight,
  TouchableOpacity,
  Dimensions,
  Slider,
  ListView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  Container,
  Header,
  Title, Content, Footer, FooterTab, Button, Icon } from 'native-base';
import _ from 'underscore';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import theme from '../theme/coopcycle';
import RestaurantsAPI from '../RestaurantsAPI'

import AppConfig from '../AppConfig.json'

class RestaurantsPage extends Component {
  restaurantsAPI = null;
  constructor(props) {
    super(props);
    this.restaurantsAPI = new RestaurantsAPI(this.props.client)
    this.state = {
      loading: false,
      restaurants: props.restaurants || [],
      user: props.user || null
    };
  }
  _onLoginSuccess(user) {
    this.setState({ user });
  }
  _onLogout(navigator) {
    const user = this.state.user;
    user.logout();

    this.setState({ user });
    navigator.parentNavigator.pop();
  }
  render() {
    return (
      <Navigator
        renderScene={this.renderScene.bind(this)}
        navigator={this.props.navigator} />
    );
  }
  renderListHeader() {
    return (<GooglePlacesAutocomplete
      placeholder="Entrez votre adresse"
      minLength={2} // minimum length of text to search
      autoFocus={false}
      listViewDisplayed='auto'    // true/false/undefined
      fetchDetails={true}
      onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
        let location = details.geometry.location;
        this.setState({
          loading: true,
          // dataSource: this.state.dataSource.cloneWithRows([])
          restaurants: []
        });
        this.restaurantsAPI.nearby(location.lat, location.lng, 3000)
          .then((data) => {
            this.setState({
              loading: false,
              // dataSource: this.state.dataSource.cloneWithRows(data['hydra:member'])
              restaurants: data['hydra:member']
            });
          });
      }}
      getDefaultValue={() => {
        return ''; // text input default value
      }}
      query={{
        // available options: https://developers.google.com/places/web-service/autocomplete
        key: AppConfig.GOOGLE_API_KEY,
        language: 'fr', // language of the results
        types: 'geocode', // default: 'geocode'
      }}
      styles={{
        description: {
          fontWeight: 'bold',
        },
        predefinedPlacesDescription: {
          color: '#1faadb',
        },
      }}
      nearbyPlacesAPI="GoogleReverseGeocoding" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
      GoogleReverseGeocodingQuery={{
        // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
        region: "fr"
      }}
      GooglePlacesSearchQuery={{
        // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
        rankby: 'distance',
        types: 'food',
      }}
      // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
      filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
      />
    );
  }
  renderScene(route, navigator) {

    let topLeftBtn;
    let topRightBtn = (
      <Button transparent> </Button>
    );
    if (this.state.user.isAuthenticated()) {
      topLeftBtn = (
        <Button transparent onPress={() => navigator.parentNavigator.push({
          id: 'AccountPage',
          name: 'Account',
          sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
          passProps: {
            onLogout: this._onLogout.bind(this, navigator)
          }
        })}>
          <Icon name="ios-menu" />
        </Button>
      )
    } else {
      topLeftBtn = (
        <Button transparent onPress={() => navigator.parentNavigator.push({
          id: 'LoginPage',
          name: 'Login',
          sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
          passProps: {
            onLoginSuccess: this._onLoginSuccess.bind(this)
          }
        })}>
          <Text>Connexion</Text>
        </Button>
      )
    }

    if (this.state.user.isAuthenticated() && (this.state.user.hasRole('ROLE_COURIER') || this.state.user.hasRole('ROLE_ADMIN'))) {
      topRightBtn = (
        <Button transparent onPress={() => navigator.parentNavigator.push({
          id: 'CourierPage',
          name: 'Courier',
          sceneConfig: Navigator.SceneConfigs.FloatFromRight
        })}>
          <Icon name="ios-bicycle" />
        </Button>
      )
    }

    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    // currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
    // currentLocationLabel="Current location"
    // predefinedPlaces={[homePlace, workPlace]}

    return (
      <Container>
        <Header>
          {topLeftBtn}
          <Title>Restaurants</Title>
          {topRightBtn}
        </Header>
        <Content theme={theme}>
          <ListView
            dataSource={ ds.cloneWithRows(this.state.restaurants) }
            enableEmptySections
            renderRow={(restaurant) => {
              return (
                <TouchableHighlight
                  onPress={() => {
                    navigator.parentNavigator.push({
                      id: 'RestaurantPage',
                      name: 'Restaurant',
                      sceneConfig: Navigator.SceneConfigs.FloatFromRight,
                      restaurant: restaurant,
                      passProps: {
                        restaurant: restaurant,
                      }
                    });
                  }}>
                  <View style={styles.listViewItem}>
                    <Text>{restaurant.name}</Text>
                  </View>
                </TouchableHighlight>
              );
            }}
            renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
            renderHeader={ this.renderListHeader.bind(this) }
          />
          <View style={styles.loader}>
            <ActivityIndicator
              animating={this.state.loading}
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
    justifyContent: 'center',
    alignItems: 'center'
  },
  listViewItem: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
});

module.exports = RestaurantsPage;