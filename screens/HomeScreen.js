import React, { Component } from 'react'

import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Keyboard
} from 'react-native';

import Autocomplete from './Autocomplete';

import { Button, Input, CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';

const removeDuplicatedKeys = (list) => {
  if(!list){
    return list
  }
  else {
  return list.filter((list, index, self) =>
  index === self.findIndex((t) => ( t.key === list.key)))
  }
}

export default class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: '',
      selectedItem: false,
      selectedClientItem: false,
      storedCatalog: props.screenProps.storedCatalog
    }
  }

  renderFilm(film) {
    return (
      <View>
        {film.map((item, index) => (
          <Text key={index} onPress={() => { this.props.screenProps.stateReducer("ProductCode", `${item.key}, ${item.title}`); Keyboard.dismiss(); this.setState({ selectedItem: true }) }} style={styles.titleText}> {item.key}, {item.title} </Text>
        ))}
      </View>
    );
  }

  renderClient(film) {
    return (
      <View>
        {film.map((item, index) => (
          <Text key={index} onPress={() => { this.props.screenProps.stateReducer("ClientCode", `${item.key}, ${item.title}`); Keyboard.dismiss(); this.setState({ selectedClientItem: true }) }} style={styles.titleText}> {item.key}, {item.title} </Text>
        ))}
      </View>
    );
  }

  findFilm(query) {
    if (query === '' | !Boolean(query)) {
      return [];
    }
    const { films } = this.props.screenProps
    const regex = new RegExp(`^${query}`, 'i');
    if (!!films){
      return films.filter(film => film.title.search(regex) >= 0 | film.key.search(regex) >= 0)
    }
    else {
      return []
    }
  }

  findClient(query) {
    if (query === '' | !Boolean(query)) {
      return [];
    }
    const { clients } = this.props.screenProps
    const regex = new RegExp(`^${query}`, 'i');
    if (!!clients){
      return clients.filter(film => film.title.search(regex) >= 0 | film.key.search(regex) >= 0);
    }else{
      return []
    }
  }

  renderProductSearch() {
    const { productCode } = this.props.screenProps.state
    const films = this.findFilm(productCode);
    const comp = (a, b) => a === b;

    return (
      <View style={styles.container2}>
        <Autocomplete
          hideResults={productCode.length == 0}
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={styles.autocompleteContainer}
          data={films.length === 1 && comp(productCode, films[0].key) ? [] : films}
          defaultValue={productCode}
          onChangeText={text => { this.props.screenProps.stateReducer("ProductCode", text); this.setState({ query: text, selectedItem: false }) }}
          placeholder="Ingresar producto"
          placeholderTextColor="#9c9c9c"
          fontSize={15}
          renderItem={({ title, key }) => {
            (
              <Text>
                {key}
              </Text>
            )
          }
          }
        />
        {films.length > 0 && !this.state.selectedItem &&
          (<View style={styles.descriptionContainer}>
            {films.length > 0 ? (
              this.renderFilm(removeDuplicatedKeys(films).slice(0, 5))
            ) : (
                <View />
              )}
          </View>)
        }

      </View>
    )
  }

  renderClientSearch() {
    const { clientCode } = this.props.screenProps.state
    const clients = this.findClient(clientCode);
    const comp = (a, b) => a === b;

    return (
      <View style={styles.container2}>
        <Autocomplete
          hideResults={clientCode.length == 0}
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={styles.autocompleteContainer}
          data={clients.length === 1 && comp(clientCode, clients[0].key) ? [] : clients}
          defaultValue={clientCode}
          onChangeText={text => { this.props.screenProps.stateReducer("ClientCode", text); this.setState({ query: text, selectedClientItem: false }) }}
          placeholder="Ingresar cliente"
          placeholderTextColor="#9c9c9c"
          fontSize={15}
          renderItem={({ title, key }) => {
            (
              <Text>
                {key}
              </Text>
            )
          }
          }
        />
        {clients.length > 0 && !this.state.selectedClientItem &&
          (<View style={styles.descriptionContainer}>
            {clients.length > 0 ? (
              this.renderClient(removeDuplicatedKeys(clients).slice(0, 5))
            ) : (
                <View />
              )}
          </View>)
        }

      </View>
    )
  }

  renderForm() {
    const { screenProps } = this.props

    return (
      <View>
        <View style={styles.getStartedContainer}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ margin: 10 }}>
              <Text style={{ fontSize: 15, textAlign: 'center', color: 'rgb(134,147,158)', fontWeight: 'bold' }}>Foto Producto</Text>
              <View style={{ flexDirection: "row" }}>
                <Button
                  icon={
                    <Icon
                      name="camera"
                      size={15}
                      color="white"
                    />
                  }
                  onPressOut={() => screenProps.stateReducer("takePicture", true)}
                  buttonStyle={{ width: 70, marginLeft: 15 }}
                >
                </Button>
                {Boolean(screenProps.state.photoId) &&
                  (<Icon
                    style={{ marginLeft: 5, marginTop: 5 }}
                    name="check"
                    size={18}
                    color="green"
                  />)}
              </View>
            </View>
            <View style={{ margin: 10 }}>
              <Text style={{ fontSize: 15, textAlign: 'center', color: 'rgb(134,147,158)', fontWeight: 'bold' }}>Foto Factura</Text>
              <View style={{ flexDirection: "row" }}>
                <Button
                  icon={
                    <Icon
                      name="camera"
                      size={15}
                      color="white"
                    />
                  }
                  onPressOut={() => screenProps.stateReducer("takeInvoicePicture", true)}
                  buttonStyle={{ width: 70, marginLeft: 10 }}
                >
                </Button>
                {Boolean(screenProps.state.invoiceId) &&
                  (<Icon
                    style={{ marginLeft: 5, marginTop: 5 }}
                    name="check"
                    size={18}
                    color="green"
                  />)}
              </View>
            </View>
          </View>
          <View style={{ margin: 10 }}>
            <Input
              keyboardType='numeric'
              value={screenProps.state.salePrice}
              label="Precio Consumidor Final (con iva)"
              onChangeText={(text) => screenProps.stateReducer("salePrice", text)}
              errorMessage={''}
              placeholder={'Producto de Competencia'}
              placeholderTextColor="#9c9c9c"
              inputStyle={{ color: 'white' }}
            >
            </Input>
          </View>
          <View style={{ margin: 10 }}>
            <Input
              keyboardType='numeric'
              value={screenProps.state.inventoryPrice}
              label="Costo Ferretero (con iva)         "
              onChangeText={(text) => screenProps.stateReducer("inventoryPrice", text)}
              errorMessage={''}
              placeholder={'Producto de Competencia'}
              placeholderTextColor="#9c9c9c"
              inputStyle={{ color: 'white' }}
            >
            </Input>
          </View>

          <View style={{ margin: 10 }}>
            <Input
              keyboardType='default'
              value={screenProps.state.brand}
              label="Marca de Competencia         "
              onChangeText={(text) => screenProps.stateReducer("brand", text)}
              errorMessage={''}
              placeholder={'Marca'}
              placeholderTextColor="#9c9c9c"
              inputStyle={{ color: 'white' }}
            >
            </Input>
          </View>

          <View style={{ margin: 10 }}>
            <Input
              keyboardType='default'
              value={screenProps.state.productCode}
              label="Código Producto HP          "
              onChangeText={(text) => screenProps.stateReducer("ProductCode", text)}
              errorMessage={''}
              placeholder={''}
              inputStyle={{ color: 'white', display: "none", borderBottomWidth: 0 }}
            >
            </Input>
            {this.renderProductSearch()}
          </View>

          <View style={{ margin: 10 }}>
            <Input
              keyboardType='default'
              value={screenProps.state.productCode}
              label="Código Cliente                   "
              onChangeText={(text) => screenProps.stateReducer("ProductCode", text)}
              errorMessage={''}
              placeholder={''}
              inputStyle={{ color: 'white', display: "none", borderBottomWidth: 0 }}
            >
            </Input>
            {this.renderClientSearch()}
          </View>

          <View style={{ margin: 10 }}>
            <Input
              keyboardType='numeric'
              value={screenProps.state.hpSalePrice}
              label="Precio Consumidor Final (con iva)"
              onChangeText={(text) => screenProps.stateReducer("hpSalePrice", text)}
              errorMessage={''}
              placeholder={'Producto de HP'}
              placeholderTextColor="#9c9c9c"
              inputStyle={{ color: 'white' }}
            >
            </Input>
          </View>

          <View style={{ margin: 10 }}>
            <Input
              keyboardType='default'
              value={screenProps.state.observations}
              label="Observaciones                                    "
              onChangeText={(text) => screenProps.stateReducer("observations", text)}
              inputStyle={{ color: 'white' }}
            >
            </Input>
          </View>

            <View style={{ marginTop: 10, marginLeft: 5 }}>
              <Text style={{ fontSize: 15, textAlign: 'center', color: 'rgb(134,147,158)', fontWeight: 'bold' }}>¿Producto ofertado?    </Text>
              <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                <CheckBox
                  center
                  title="Si"
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  checked={screenProps.state.hasDiscount}
                  size={11}
                  onPress={() => screenProps.stateReducer("Disccount", true)}
                  style={{ width: 100 }}
                />
                <CheckBox
                  center
                  title="No"
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  checked={!screenProps.state.hasDiscount}
                  size={11}
                  style={{ width: 100 }}
                  onPress={() => screenProps.stateReducer("Disccount", false)}
                />
                <View />

            </View>

          </View>
          {
            !screenProps.state.isSavingData ?
              <Button
                onPressOut={() => screenProps.stateReducer("storeApiData", "")}
                buttonStylestyle='outline'
                title="Enviar"
                buttonStyle={{ width: 160, marginLeft: 15, marginTop: 80 }}
              /> :
              <Button
                buttonStylestyle='outline'
                loading={true}
                buttonStyle={{ width: 160, marginLeft: 15, marginTop: 80 }}
              />
          }
        </View>
      </View>
    )
  }

  renderEmployeeForm() {
    const { screenProps } = this.props
    return (
      <View style={styles.getStartedContainer}>
        <View style={{ margin: 30 }}>
          <Input
            keyboardType='default'
            value={screenProps.state.employeeCode}
            label="Número de ruta:    "
            onChangeText={(text) => screenProps.stateReducer("employeeCode", text)}
            errorMessage={''}
            placeholder={''}
            inputStyle={{ color: 'white' }}
          >
          </Input>
        </View>
        <Button
          onPressOut={() => screenProps.stateReducer("sendEmployeeCode", "")}
          buttonStylestyle='outline'
          title="Guardar número de ruta"
        />
      </View>
    )
  }


  render() {
    const { screenProps } = this.props
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.welcomeContainer}>
            <View style={{ flexDirection: 'row'}}>
              <View>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/hpLogo.png')
                  : require('../assets/images/hpLogo.png')
              }
              style={styles.welcomeImage}
            />
            </View>
            {
                screenProps.state.hasEmployeeCode ?
                (<View  style={{flexDirection: 'row', marginTop: 10, paddingLeft: 80}}>
                <Button
                    icon={
                      <Icon
                        name="refresh"
                        size={15}
                        color="white"
                      />
                    }
                    onPress={() => { screenProps.stateReducer("refreshCatalog", "") } }
                    loading={screenProps.state.fetchingCatalog}
                  />
                  </View>) : <View/>
              }
              </View>

            {
              screenProps.state.hasEmployeeCode ?

                this.renderForm() :
                this.renderEmployeeForm()
            }
          </View>

        </ScrollView>
      </View>
    );
  }

}

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#40515b',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 10,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: 110,
    flexDirection: 'row'
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },

  container2: {
    backgroundColor: 'transparent',
    flex: 0,
    paddingTop: 15,
    paddingBottom: 20,
    zIndex: 99999
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1
  },
  itemText: {
    fontSize: 12,
    margin: 2
  },
  descriptionContainer: {
    backgroundColor: '#8C8984',
    marginTop: 25
  },
  infoText: {
    textAlign: 'center'
  },
  titleText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
    color: 'white'
  },
  openingText: {
    textAlign: 'center'
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
