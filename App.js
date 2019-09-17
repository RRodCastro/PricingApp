import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux'
import appReducers from './reducers/reducers';
import { AsyncStorage } from 'react-native';import AppNavigator from './navigation/AppNavigator';


const store = createStore(appReducers);

export default class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isLoadingComplete: false,
      currentCode: '',
      inventoryPrice: '',
      salePrice: '',
      hasDiscount: false,
      employeeCode: ''
    }
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('HPCode');
      if (value !== null) {
        const employeeCode = value
        this.setState({employeeCode})
        console.log("something..")
        employeeCode = value
        console.log(value);
      }
      else{
        console.log("none data..")
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  loadResourcesAsync = async() => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/hpLogo.png')
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Ionicons.FontAwesome,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free to
        // remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ],
    this._retrieveData()
    );
  }
  
  handleLoadingError = error => {
    // In this case, you might want to report the error to your error reporting
    // service, for example Sentry
    console.warn(error);
  }

  handleFinishLoading = () => {
    this.setState({isLoadingComplete: true});
  }

  _storeData = async () => {
    try {
      await AsyncStorage.setItem('HPCode', 'I like to save it.');
      const employeeCode = '9008'
      this.setState({employeeCode})
    } catch (error) {
      console.log(error)
    }
  };


  stateReducer = (reducer, newState) => {
    switch(reducer){
      default:

      case "ProductCode":
        const currentCode = newState
        this.setState({currentCode})
        break;
      case "SumbitButton":
        alert("Sending...")
        this._storeData()
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
    console.log("current state")
    console.log(this.state.employeeCode)
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
