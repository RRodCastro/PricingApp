import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, Text, TouchableWithoutFeedback, Dimensions, Image  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux'
import appReducers from './reducers/reducers';
import { AsyncStorage } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/FontAwesome';

const store = createStore(appReducers);
const { width: winWidth, height: winHeight } = Dimensions.get('window');

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoadingComplete: false,
      productCode: 'HP4235-65',
      inventoryPrice: '22.30',
      salePrice: '25.30',
      hasDiscount: false,
      employeeCode: '',
      hasEmployeeCode: false,
      hasCameraPermission: null,
      hasLocationPermission: null,
      isSavingData: false,
      cameraViewOpen: false,
      photo :'',
      photoId: '',
      pictureTaked: false
    }
  }


  async componentWillMount() {
    const { statusCamera } = await Permissions.askAsync(Permissions.CAMERA);
    const { statusLocation } = await Permissions.askAsync(Permissions.LOCATION);
    this.setState({ hasCameraPermission: statusCamera === 'granted', hasLocationPermission: statusLocation === 'granted' });
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + 'photos'
    ).catch(e => {
      console.log(e, 'Directory exists');
    });
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('HPCode');
      if (value !== null) {
        const employeeCode = value
        const hasEmployeeCode = true
        this.setState({ hasEmployeeCode: true, employeeCode: value })
      }
      else {
        console.log("none data..")
      }
    } catch (error) {
      // Error retrieving data
    }
  };
 
  loadResourcesAsync = async () => {
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
    this.setState({ isLoadingComplete: true });
  }

  _storeData = async () => {
    try {
      if (!!this.state.employeeCode) {
        Alert.alert("Guardado")
        await AsyncStorage.setItem('HPCode', this.state.employeeCode);
        const hasEmployeeCode = true
        this.setState({ hasEmployeeCode })
      }
      else {
        Alert.alert("Error", "Debe ingresar código de empleado")
      }
    } catch (error) {
      console.log(error)
    }
  };

  _clearStoredData = async () => {

    try {
      await AsyncStorage.removeItem('HPCode')
      const hasEmployeeCode = false
      this.setState({ hasEmployeeCode })
    } catch (error) {
      console.log(error)
    }
  }

  _storeApiData = async () => {
    this.setState({ isSavingData: true })

    try {
      const location = await Location.getCurrentPositionAsync({});
      if (!location){
        lat =''
        long = ''
      } else {
        lat = location.latitude
        long = location.longitude
      }
    } catch{
      Alert.alert("Error", "No se pudo obtener ubicación...")
    }

    const data = JSON.stringify(
      {
        'employeeCode': this.state.employeeCode,
        'sku': this.state.productCode,
        'invPrice': this.state.inventoryPrice,
        'salePrice': this.state.salePrice,
        'discount': this.state.hasDiscount ? 1 : 0,
        'latlng': `${lat},${long}`
      }
    )
    try {
      const response = await fetch(
        ``,
        {
          method: 'POST',
          credentials: 'same-origin',
          body: data
        }
      );
      this.setState({ isSavingData: false })
      Alert.alert("Enviado", "Datos enviados")
      const responseJson = await response.json()
      console.log(responseJson)
      return true

    } catch (error) {
      Alert.alert("Error", "Por favor intente de nuevo")
      this.setState({ isSavingData: false })

    }

  }



  stateReducer = (reducer, newState) => {
    switch (reducer) {
      default:
      case "ProductCode":
        const productCode = newState
        this.setState({ productCode })
        break;
      case "SumbitButton":
        alert("Sending...")
        break;
      case "RemoveButton":
        this._clearStoredData()
        break;
      case "inventoryPrice":
        const inventoryPrice = newState
        this.setState({ inventoryPrice })
        break;
      case "Disccount":
        const hasDiscount = newState
        this.setState({ hasDiscount })
        break;
      case "salePrice":
        const salePrice = newState
        this.setState({ salePrice })
        break;
      case "employeeCode":
        const employeeCode = newState
        this.setState({ employeeCode })
        break;
      case "sendEmployeeCode":
        this._storeData()
        break;
      case "storeApiData":
        this._storeApiData()
        break;
      case "takePicture":
        this.setState({ cameraViewOpen: newState })
        break;


    }
  }

  _takePicture = async () => {
    if (this.camera){
      const image = await this.camera.takePictureAsync({skipProcessing: true});
      this.setState({photoId: image.uri, pictureTaked: true})
    }
  }

  loadCameraView() {
    return (
      <View style={{ flex: 1 }}>
        <Camera
          ref={ref => {
            this.camera = ref;
          }}
          style={{ flex: 1 }}
          type={Camera.Constants.Type.back}
          autoFocus={Camera.Constants.AutoFocus.on}
        >
          <View style={styles.bottomToolbar}>

          <View> 

          <View style={styles.alignCenter}>
                <TouchableWithoutFeedback
                    onPressOut={() => this._takePicture()}
                  >
                    <View style={[styles.captureBtn]}>
                    </View>
                </TouchableWithoutFeedback>
            </View>

          </View>
          </View>
        </Camera>
      </View>
    )
  }
  
  loadImageView () {
   capturedImage = this.state.photoId
    return (
      <View style={{ flex: 1, position: 'relative' }}>
        <Image
        style={{ zIndex: -1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: winWidth, height: winHeight }}
        source={{uri: capturedImage}}
        />
        <Icon
          onPress={() => { this.setState({pictureTaked: false}) }}
          style={{position: 'absolute', top: 50, left: 15, zIndex: 1000}}
          name="arrow-left"
          size={25}
          color="white"
        />
        <Icon
            onPress={() => { this.setState({pictureTaked: false, cameraViewOpen: false}) }}
            style={{position: 'absolute', bottom: 50, right: 50}}
            name="check-circle"
            size={60}
            color="#0e887b"
        />
      </View>
    )

  }

  render() {
    const { isFocused } = this.props
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this.loadResourcesAsync}
          onError={this.handleLoadingError}
          onFinish={this.handleFinishLoading}
        />
      )
    }
    else if (this.state.cameraViewOpen & !this.state.pictureTaked) {
      return (
        this.loadCameraView()
      )
    } else if(this.state.pictureTaked){
      return (
        this.loadImageView()
      )
    }
    else {
      return (
        <Provider store={store} >
          <AppNavigator
            screenProps={{
              state: this.state,
              stateReducer: this.stateReducer,
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
  alignCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomToolbar: {
    width: winWidth,
    position: 'absolute',
    height: 100,
    bottom: 0,
},
captureBtn: {
  width: 60,
  height: 60,
  borderWidth: 2,
  borderRadius: 60,
  borderColor: "#FFFFFF",
},
captureBtnActive: {
  width: 80,
  height: 80,
},
});
