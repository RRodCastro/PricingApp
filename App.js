import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux'
import appReducers from './reducers/reducers';

import AppNavigator from './navigation/AppNavigator';

const store = createStore(appReducers);

export default class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isLoadingComplete: false,
      currentCode: '',
      inventoryPrice: '',
      salePrice: '',
      hasDiscount: false
    }
  }

  loadResourcesAsync = async() => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
        require('./assets/images/hpLogo.png')
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Ionicons.FontAwesome,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free to
        // remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  }
  
  handleLoadingError = error => {
    // In this case, you might want to report the error to your error reporting
    // service, for example Sentry
    console.warn(error);
  }

  handleFinishLoading = () => {
    this.setState({isLoadingComplete: true});
  }


  stateReducer = (reducer, newState) => {
    switch(reducer){
      default:

      case "ProductCode":
        const currentCode = newState
        this.setState({currentCode})
        break;
      case "SumbitButton":
        alert("Sending...")
        break
      case "inventoryPrice":
        const inventoryPrice = newState
        this.setState({inventoryPrice})
        break
      case "Disccount":
        const hasDiscount = newState
        this.setState({hasDiscount})
        break
      case "salePrice":
        const salePrice = newState
        this.setState({salePrice})

    }
  }
  render(){
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen ){
      return (
        <AppLoading
          startAsync={this.loadResourcesAsync}
          onError={this.handleLoadingError}
          onFinish={this.handleFinishLoading}
        />
      )
    }
    else {
      return (
        <Provider store={ store } >
          <AppNavigator
            screenProps = {{
              state: this.state,
              stateReducer: this.stateReducer
            }}
          />
        </Provider>

      )
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
