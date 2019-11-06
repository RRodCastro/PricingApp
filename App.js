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
import { PRODUCTS } from './assets/data/products'

const store = createStore(appReducers);
const { width: winWidth, height: winHeight } = Dimensions.get('window');

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoadingComplete: false,
      productCode: '',
      inventoryPrice: '',
      salePrice: '',
      hasDiscount: false,
      employeeCode: '',
      hasEmployeeCode: false,
      hasCameraPermission: null,
      hasLocationPermission: null,
      isSavingData: false,
      cameraViewOpen: false,
      photo :'',
      photoId: '',
      pictureTaked: false,
      hasStoredCatalog: false,
      storedCatalog: []
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
      console.log("value ... ")
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
    try {
      const today = (new Date()).toISOString().split('T')[0]
      let lastCatalogFetch = await AsyncStorage.getItem('LastCatalogFetch');
      console.log("last catalog fetch " ,lastCatalogFetch)
      console.log("today ", today)
      try {
        const testCatalogFetch = new Date(lastCatalogFetch)

        if ( new Date(testCatalogFetch) > new Date(today) ){
          lastCatalogFetch = null
        }
      } catch(error){
        lastCatalogFetch = today
      }
      if (lastCatalogFetch !== null ) {
        if (lastCatalogFetch != today && (today.split("-")[2] == 15 || today.split("-")[2] == 30 )  ) {
          const response = await fetch(
            'http://172.16.18.41:5000/getCatalog',
            {
              method: 'GET',
              credentials: 'same-origin'
            }
          ).then(response => response.json())

          if (response && 'catalog' in response){
            try {
              await AsyncStorage.setItem("LastCatalogFetch", today)
              await AsyncStorage.setItem("StoredCatalog", JSON.stringify(response.catalog))
              this.setState({storedCatalog: response.catalog})
            }
            catch(error){
              console.log(error)
            }
          }
        } else {
          try{
            const storedCatalog = await AsyncStorage.getItem('StoredCatalog');
            if (storedCatalog){
              this.setState({storedCatalog: JSON.parse(storedCatalog) })
            }
          } catch(error) {
            console.log(error)
          }
        }
      } else {
    
        // IF non data, fetch catalog
        const response = await fetch(
          'http://172.16.18.41:5000/getCatalog',
          {
            method: 'GET',
            credentials: 'same-origin'
          }
        ).then(response => response.json())
        console.log("response in else ")
        console.log(response)
        if (response && 'catalog' in response){
          try {
            await AsyncStorage.setItem("LastCatalogFetch", today)
            await AsyncStorage.setItem("StoredCatalog", JSON.stringify(response.catalog))
            this.setState({storedCatalog: response.catalog})
          }
          catch(error){
            console.log(error)
          }
        }
        else {
          console.log("no data because catalog doesnt exists...")
        }
      }
    } catch(error) {
      console.log("error")
    }

  };
 

  loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/hpLogo.png')
      ]),
      Font.loadAsync({
        ...Ionicons.FontAwesome,
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
      this._retrieveData()
    ] 
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
    const findProduct = (PRODUCTS.concat(this.state.storedCatalog)).find((ele) => ele.key == this.state.productCode.split(",")[0])
    if (!findProduct) {
      alert("Debe seleccionar un producto del listado")
    } else {
    const productCode = this.state.productCode.split(",")[0]
    this.setState({ isSavingData: true })
    let lat = ''
    let long = ''
    try {
      const location = await Location.getCurrentPositionAsync({});
      if (!location){
        lat =''
        long = ''
      } else {
        lat = location.coords.latitude
        long = location.coords.longitude
      }
    } catch(error) {
      console.log("error ", error)
    }

    const newData = new FormData();
    
    capturedImage = this.state.photoId
    newData.append('employeeCode', this.state.employeeCode)
    newData.append('sku', productCode)
    newData.append('invPrice', this.state.inventoryPrice)
    newData.append('salePrice', this.state.salePrice)
    newData.append('discount', this.state.hasDiscount ? 1 : 0)
    newData.append('latlng', `${lat},${long}`)
    if (this.state.photoId){
      const today = new Date().getTime()
      const photo = {
        uri: this.state.photoId,
        type: 'image/jpeg',
        name: `${this.state.employeeCode}$${productCode}$${today}`,
      };
      newData.append('image', photo)
    }
    
    try {
      const response = await fetch(
        'http://172.16.18.41:5000/storeData',
        {
          method: 'POST',
          credentials: 'same-origin',
          body: newData
        }
      );
      this.setState({ isSavingData: false, salePrice: '', inventoryPrice: '', photoId: '', pictureTaked: false })
      Alert.alert("Enviado", "Datos enviados")
    } catch (error) {
      Alert.alert("Error", "Por favor intente de nuevo")
      this.setState({ isSavingData: false })
    }
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
      const image = await this.camera.takePictureAsync({skipProcessing: false, quality: 0.5 });
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
              films: PRODUCTS.concat(this.state.storedCatalog) 
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
activityContainer: {
  flex: 1,
  justifyContent: 'center'
},
activityHorizontal: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  padding: 10
}
});
