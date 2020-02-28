import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import React from 'react';
import { StyleSheet, View, Alert, TouchableWithoutFeedback, Dimensions, Image } from 'react-native';
import { Provider } from 'react-redux';
import { createStore } from 'redux'
import appReducers from './reducers/reducers';
import { AsyncStorage } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PRODUCTS } from './assets/data/products'
import { CLIENTS } from "./assets/data/clients";

const store = createStore(appReducers);
const { width: winWidth, height: winHeight } = Dimensions.get('window');

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoadingComplete: false,
      productCode: '',
      clientCode: '',
      inventoryPrice: '',
      salePrice: '',
      hpSalePrice: '',
      hasDiscount: false,
      employeeCode: '',
      hasEmployeeCode: false,
      hasCameraPermission: null,
      hasLocationPermission: null,
      isSavingData: false,
      cameraViewOpen: false,
      invoiceCameraViewOpen: false,
      photo: '',
      photoId: '',
      pictureTaked: false,
      hasStoredCatalog: false,
      storedCatalog: [],
      storedClients: [],
      invoiceTaked: false,
      invoiceId: '',
      pictureTaking: false,
      lat: '',
      long: '',
      observations: '',
      brand: 'Tolsen',
      fetchingCatalog: false
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

  _getLocationAsync = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: 4 });
      if (!location) {
        lat = ''
        long = ''
      } else {
        lat = location.coords.latitude
        long = location.coords.longitude
        this.setState({ lat, long })
      }
    } catch (error) {
      console.log("error ", error)
    }
  }

  _retriveCatalog = async () => {

    const today = (new Date()).toISOString().split('T')[0]

    const lastClientFetch = await AsyncStorage.getItem('LastClientFetch');

    if (lastClientFetch != today) {


      this.setState({ fetchingCatalog: true })
      const catalog = await fetch(
        'http://192.168.137.1:5000/getCatalog',
        {
          method: 'GET',
          credentials: 'same-origin'
        }
      ).then(response => response.json())


      const clients = await fetch(
        'http://192.168.137.1:5000/getClients',
        {
          method: 'GET',
          credentials: 'same-origin'
        }
      ).then(response => response.json())



      await AsyncStorage.setItem("LastClientFetch", today)

      this.setState({ fetchingCatalog: false, storedCatalog: catalog.catalog, storedClients: clients.catalog })

      await AsyncStorage.setItem("StoredCatalog", JSON.stringify(catalog.catalog))

      await AsyncStorage.setItem("StoredClients", JSON.stringify(clients.catalog))
    }
    else {
      Alert.alert("", "Catalogo ya actualizado")

    }

  }

  _retrieveData = async () => {
    // Get Employee Code (if exists)
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

    try {
      const today = (new Date()).toISOString().split('T')[0]
      let lastCatalogFetch = await AsyncStorage.getItem('LastCatalogFetch');
      try {
        const testCatalogFetch = new Date(lastCatalogFetch)

        if ((new Date(testCatalogFetch)) > (new Date(today))) {
          lastCatalogFetch = null
        }
      } catch (error) {
        lastCatalogFetch = today
      }
      if (lastCatalogFetch !== null) {
        if (lastCatalogFetch != today && ((new Date(today) - new Date(lastCatalogFetch)) / (1000 * 60 * 60 * 24)) >= 15) {
          const response = await fetch(
            'http://192.168.137.1:5000/getCatalog',
            {
              method: 'GET',
              credentials: 'same-origin'
            }
          ).then(response => response.json())

          if (response && 'catalog' in response) {
            try {
              await AsyncStorage.setItem("LastCatalogFetch", today)
              await AsyncStorage.setItem("StoredCatalog", JSON.stringify(response.catalog))
              this.setState({ storedCatalog: response.catalog })
            }
            catch (error) {
              console.log("error " + error)
            }
          }
        } else {
          try {
            const storedCatalog = await AsyncStorage.getItem('StoredCatalog');
            if (storedCatalog) {
              this.setState({ storedCatalog: JSON.parse(storedCatalog) })
            }
          } catch (error) {
            console.log(error)
          }
        }
      } else {

        // IF non data, fetch catalog
        const response = await fetch(
          'http://192.168.137.1:5000/getCatalog',
          {
            method: 'GET',
            credentials: 'same-origin'
          }
        ).then(response => response.json())
        if (response && 'catalog' in response) {
          try {
            await AsyncStorage.setItem("LastCatalogFetch", today)
            await AsyncStorage.setItem("StoredCatalog", JSON.stringify(response.catalog))
            this.setState({ storedCatalog: response.catalog })
          }
          catch (error) {
            console.log(error)
          }
        }
        else {
          console.log("no data because catalog doesnt exists...")
        }
      }
    } catch (error) {
      console.log("error", error)
    }

    try {
      const today = (new Date()).toISOString().split('T')[0]
      let lastClientFetch = await AsyncStorage.getItem('LastClientFetch');
      try {
        const testCatalogFetch = new Date(lastClientFetch)

        if ((new Date(testCatalogFetch)) > (new Date(today))) {
          lastClientFetch = null
        }
      } catch (error) {
        lastClientFetch = today
      }
      if (lastClientFetch !== null) {
        if (lastClientFetch != today && ((new Date(today) - new Date(lastClientFetch)) / (1000 * 60 * 60 * 24)) >= 15) {
          const response = await fetch(
            'http://192.168.137.1:5000/getClients',
            {
              method: 'GET',
              credentials: 'same-origin'
            }
          ).then(response => response.json())

          if (response && 'catalog' in response) {
            try {
              await AsyncStorage.setItem("LastClientFetch", today)
              await AsyncStorage.setItem("StoredClients", JSON.stringify(response.catalog))
              this.setState({ storedClients: response.catalog })
            }
            catch (error) {
              console.log("error " + error)
            }
          }
        } else {
          try {
            const storedClients = await AsyncStorage.getItem('StoredClients');
            if (storedClients) {
              this.setState({ storedClients: JSON.parse(storedClients) })
            }
          } catch (error) {
            console.log(error)
          }
        }
      } else {

        // IF non data, fetch catalog
        const response = await fetch(
          'http://192.168.137.1:5000/getClients',
          {
            method: 'GET',
            credentials: 'same-origin'
          }
        ).then(response => response.json())
        if (response && 'catalog' in response) {
          try {
            await AsyncStorage.setItem("LastClientFetch", today)
            await AsyncStorage.setItem("StoredClients", JSON.stringify(response.catalog))
            this.setState({ storedClients: response.catalog })
          }
          catch (error) {
            console.log(error)
          }
        }
        else {
          console.log("no data because clients doesnt exists...")
        }
      }
    } catch (error) {
      console.log("error", error)
    }

  };


  loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/hpLogo.png')
      ]),
      this._retrieveData(),
      this._getLocationAsync()
    ]
    );
  }

  handleLoadingError = error => {
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
    const findClient = (CLIENTS.concat(this.state.storedClients)).find((ele) => ele.key == this.state.clientCode.split(",")[0])
    if (!findProduct) {
      Alert.alert("Error", "Debe seleccionar un producto del listado")
    } else if (!findClient) {
      Alert.alert("Error", "Debe seleccionar un cliente del listado")
    } else if (!this.state.inventoryPrice) {
      Alert.alert("Error", "Costo ferretero debe tener información")
    } else if (!this.state.salePrice) {
      Alert.alert("Error", "Precio consumidor final (Competencia) debe tener información")
    } else if (!this.state.hpSalePrice) {
      Alert.alert("Error", "Precio consumidor final (HP) debe tener información")
    } else {
      let employeeCode = ''
      try {
        employeeCode = await AsyncStorage.getItem('HPCode');
      } catch (error) {
        console.log(error)
      }

      if (!this.state.lat && !this.state.long) {
        console.log("getting lat long again... ")
        this._getLocationAsync()
      }

      const productCode = this.state.productCode.split(",")[0]
      const clientCode = this.state.clientCode.split(",")[0]
      this.setState({ isSavingData: true })

      const newData = new FormData();

      capturedImage = this.state.photoId
      newData.append('employeeCode', employeeCode)
      newData.append('sku', productCode)
      newData.append('invPrice', this.state.inventoryPrice)
      newData.append('salePrice', this.state.salePrice)
      newData.append('discount', this.state.hasDiscount ? '1' : '0')
      newData.append('latlng', `${this.state.lat},${this.state.long}`)
      newData.append('sellingpricehp', this.state.hpSalePrice)
      newData.append('obs', this.state.observations)
      newData.append('client', clientCode)
      newData.append('brand', this.state.brand)
      if (this.state.photoId) {
        const today = new Date().getTime()
        const photo = {
          uri: this.state.photoId,
          type: 'image/jpeg',
          name: `${employeeCode}$${productCode}$${today}`,
        };
        newData.append('image', photo)
      }

      if (this.state.invoiceId) {
        const today = new Date().getTime()
        const photo = {
          uri: this.state.invoiceId,
          type: 'image/jpeg',
          name: `invoice$${employeeCode}$${productCode}$${today}`
        };
        newData.append('invoiceImg', photo)
      }
      try {
        const response = await fetch(
          'http://192.168.137.1:5000/storeData',
          {
            method: 'POST',
            credentials: 'same-origin',
            body: newData
          }
        );
        this.setState({ isSavingData: false })
        this.setState({ isSavingData: false, salePrice: '', inventoryPrice: '', photoId: '', pictureTaked: false, productCode: '', clientCode: '', invoiceId: '', invoiceTaked: false, hpSalePrice: '', observations: '', brand: '' })
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
      case "ClientCode":
        const clientCode = newState
        this.setState({ clientCode })
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
      case "takeInvoicePicture":
        this.setState({ invoiceCameraViewOpen: newState })
        break;
      case "hpSalePrice":
        const hpSalePrice = newState
        this.setState({ hpSalePrice })
        break;
      case "observations":
        const observations = newState
        this.setState({ observations })
        break;
      case "brand":
        const brand = newState
        this.setState({ brand })
        break;
      case "refreshCatalog":
        this._retriveCatalog()

        break;
    }
  }

  _takePicture = async (pictureType) => {
    if (this.camera) {
      this.setState({ pictureTaking: true })
      const image = await this.camera.takePictureAsync({ skipProcessing: false, quality: 0.3 });
      this.setState({ pictureTaking: false })
      if (pictureType == "invoiceImage") {
        this.setState({ invoiceId: image.uri, invoiceTaked: true })
      }
      else {
        this.setState({ photoId: image.uri, pictureTaked: true })
      }
    }
  }

  loadCameraView(pictureType) {
    const isInvoiceImage = pictureType == "invoiceImage"
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
          <View style={styles.topToolBar}>
            <View>
              <View style={styles.alignBackButton}>
                <TouchableWithoutFeedback>
                  <Icon
                    onPress={() => { isInvoiceImage ? this.setState({ invoiceCameraViewOpen: false, invoiceTaked: false, invoiceId: '' }) : this.setState({ cameraViewOpen: false, pictureTaked: false, photoId: '' }) }}
                    name="arrow-left"
                    size={30}
                    color="white"
                  />
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>

          <View style={styles.bottomToolbar}>

            <View>

              <View style={styles.alignCenter}>
                <TouchableWithoutFeedback
                  onPressOut={() => !this.state.pictureTaking && this._takePicture(pictureType)}
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

  loadImageView(pictureType) {
    const isInvoiceImage = pictureType === "invoiceImage"
    const capturedImage = isInvoiceImage ? this.state.invoiceId : this.state.photoId
    return (
      <View style={{ flex: 1, position: 'relative' }}>
        <Image
          style={{ zIndex: -1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: winWidth, height: winHeight }}
          source={{ uri: capturedImage }}
        />
        <Icon
          onPress={() => { isInvoiceImage ? this.setState({ invoiceTaked: false, invoiceId: '' }) : this.setState({ pictureTaked: false, photoId: '' }) }}
          style={{ position: 'absolute', top: 50, left: 15, zIndex: 1000 }}
          name="arrow-left"
          size={30}
          color="white"
        />
        <Icon
          onPress={() => { isInvoiceImage ? this.setState({ invoiceTaked: false, invoiceCameraViewOpen: false }) : this.setState({ pictureTaked: false, cameraViewOpen: false }) }}
          style={{ position: 'absolute', bottom: 50, right: 50 }}
          name="check-circle"
          size={60}
          color="#0e887b"
        />
      </View>
    )

  }

  render() {
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
        this.loadCameraView("productImage")
      )
    } else if (this.state.pictureTaked) {
      return (
        this.loadImageView("productImage")
      )
    }
    else if (this.state.invoiceCameraViewOpen & !this.state.invoiceTaked) {
      return (
        this.loadCameraView("invoiceImage")
      )
    }
    else if (this.state.invoiceTaked) {
      return (
        this.loadImageView("invoiceImage")
      )
    }
    else {
      const screenProps = {
        state: this.state,
        stateReducer: this.stateReducer,
        films: PRODUCTS.concat(this.state.storedCatalog).slice(),
        clients: CLIENTS.concat(this.state.storedClients).slice(),
        storedCatalog: this.state.storedCatalog
      }
      return (
        <Provider store={store} >
          <AppNavigator
            screenProps={screenProps}
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
  alignBackButton: {
    marginTop: 30,
    marginLeft: 20
  },
  alignCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topToolBar: {
    width: winWidth,
    position: 'absolute',
    height: 100,
    top: 25,
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
