import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux'
import appReducers from './reducers/reducers';
import { AsyncStorage } from 'react-native';import AppNavigator from './navigation/AppNavigator';
import { Camera } from 'expo-camera';
import * as location from 'expo-location';
import * as Permissions from 'expo-permissions';

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
      employeeCode: '',
      hasEmployeeCode: false,
      hasCameraPermission: null,
      hasLocationPermission: null
    }
  }

  async componentWillMount(){
    const { statusCamera } = await Permissions.askAsync(Permissions.CAMERA);
    const { statusLocation } = await Permissions.askAsync(Permissions.LOCATION);
    this.setState({ hasCameraPermission: statusCamera === 'granted', hasLocationPermission: statusLocation === 'granted' });
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('HPCode');
      if (value !== null) {
        const employeeCode = value
        const hasEmployeeCode = true
        this.setState({hasEmployeeCode:true, employeeCode: value})
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
      if (!!this.state.employeeCode){
      Alert.alert("Guardado")
      await AsyncStorage.setItem('HPCode', this.state.employeeCode);
      const hasEmployeeCode = true
      this.setState({hasEmployeeCode})
    }
    else {
      Alert.alert("Error", "Debe ingresar código de empleado")
    }
    } catch (error) {
      console.log(error)
    }
  };

  _clearStoredData = async() => {

    try{
      await AsyncStorage.removeItem('HPCode')
      const hasEmployeeCode = false
      this.setState({hasEmployeeCode})
    } catch (error){
      console.log(error)
    }
  }

  _storeApiData = async() => {
   const data = JSON.stringify(
     {
       'employeeCode': this.state.employeeCode,
       'sku': this.state.currentCode,
       'invPrice': this.state.inventoryPrice,
       'salePrice': this.state.salePrice
    }
    )
    try{
      const response = await fetch(
        `http://172.16.18.33:5000/hello`,
        {
          method: 'POST',
          credentials: 'same-origin',
          body: data
        }
      );
      const responseJson = await response.json()
      console.log(responseJson)
      return true

    } catch(error){
      console.log(error)
    }

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
        break;
      case "RemoveButton":
        this._clearStoredData()
        break;
      case "inventoryPrice":
        const inventoryPrice = newState
        this.setState({inventoryPrice})
        break;
      case "Disccount":
        const hasDiscount = newState
        this.setState({hasDiscount})
        break;
      case "salePrice":
        const salePrice = newState
        this.setState({salePrice})
        break;
      case "employeeCode":
        const employeeCode = newState
        this.setState({employeeCode})
        break;
      case "sendEmployeeCode":
        this._storeData()
        break;
      case "storeApiData":
        this._storeApiData()
        break;


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
