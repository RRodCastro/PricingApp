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

export default class HomeScreen extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      films: props.screenProps.films,
      query: '',
      selectedItem: false
    }
  }

  renderFilm(film) {
    return (
      <View>
        {film.map((item, index) => (
          <Text key={index} onPress={() => {this.props.screenProps.stateReducer("ProductCode", `${item.key}, ${item.title}`); Keyboard.dismiss(); this.setState({selectedItem: true }) }} style={styles.titleText}> {item.key}, {item.title} </Text>
        ))}
      </View>
    );
  }

  findFilm(query) {
    if (query === '' | !Boolean(query)) {
      return [];
    }
    const { films } = this.state;
    const regex = new RegExp(`^${query}`, 'i');
    return films.filter(film =>  film.title.search(regex) >= 0 | film.key.search(regex) >= 0);
  }

  renderSearch () {
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
        onChangeText={text => { this.props.screenProps.stateReducer("ProductCode", text)  ; this.setState({ query: text, selectedItem: false })}}
        placeholder="Ingresar producto"
        renderItem={({ title, key }) => { (
          <Text>
            {key }
          </Text>
        )}
        }
      />
      {films.length > 0 && !this.state.selectedItem  && 
      (<View style={styles.descriptionContainer}>
        {films.length > 0 ? (
          this.renderFilm(films.slice(0, 5))
        ) : (
          <View/>
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
        <View style={{ margin: 10 }}>
          <Input
            keyboardType='default'
            value={screenProps.state.productCode}
            label="Código Producto     "
            onChangeText={(text) => screenProps.stateReducer("ProductCode", text)}
            fontWeight='Bold'
            errorMessage={''}
            placeholder={''}
            inputStyle={{color: 'white', display: "none", borderBottomWidth: 0}}
          >
          </Input>
          {this.renderSearch()}
        </View>
        <View style={{ margin: 10 }}>
          <Input
            keyboardType='numeric'
            value={screenProps.state.inventoryPrice}
            label="Precio Inventario (sin iva)"
            onChangeText={(text) => screenProps.stateReducer("inventoryPrice", text)}
            fontWeight='Bold'
            errorMessage={''}
            placeholder={''}
            inputStyle={{color: 'white'}}
          >
          </Input>
        </View>

        <View style={{ margin: 10 }}>
          <Input
            keyboardType='numeric'
            value={screenProps.state.salePrice}
            label="Precio Consumidor (sin iva)"
            onChangeText={(text) => screenProps.stateReducer("salePrice", text)}
            fontWeight='Bold'
            errorMessage={''}
            placeholder={''}
            inputStyle={{color: 'white'}}
          >
          </Input>
        </View>
        <View style={{ margin: 10 }}
        >
          <Text style={{ fontSize: 15, textAlign: 'center', color: 'rgb(134,147,158)', fontWeight: 'bold' }}>¿Producto ofertado?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <CheckBox
              center
              title="Si"
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={screenProps.state.hasDiscount}
              size={11}
              onPress={() => screenProps.stateReducer("Disccount", true)}
            />
            <CheckBox
              center
              title="No"
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={!screenProps.state.hasDiscount}
              size={11}
              onPress={() => screenProps.stateReducer("Disccount", false)}
              
            />
            <View />
          </View>
        <View style={{margin: 10}}>
          <Text style={{ fontSize: 15, textAlign: 'center', color: 'rgb(134,147,158)', fontWeight: 'bold' }}>Foto Producto</Text>
          <View style={{flexDirection: "row"}}>
          <Button
          icon={
            <Icon
              name="camera"
              size={15}
              color="white"
            />
          }
          onPressOut={() => screenProps.stateReducer("takePicture", true)}
          buttonStyle={{width: 60, marginLeft: 45}}          
          >
          </Button>
          {Boolean(screenProps.state.photoId) && 
          (<Icon
            style={{marginLeft: 5, marginTop: 5}}
            name="check"
            size={18}
            color="green"
          />)}
          </View>
        </View>
        </View>
        {
          !screenProps.state.isSavingData ?
        <Button
          onPressOut={() => screenProps.stateReducer("storeApiData", "")}
          buttonStylestyle='outline'
          title="Enviar"
          buttonStyle={{width: 120}}
        /> : 
        <Button
          buttonStylestyle='outline'
          loading={true}
          buttonStyle={{width: 120}}
        />
        }
      </View>
      </View>
    )
  }

  renderEmployeeForm() {
    const {screenProps} = this.props
    return (
      <View style={styles.getStartedContainer}>
        <View style={{ margin: 30 }}>
          <Input
            keyboardType='default'
            value={screenProps.state.employeeCode}
            label="Código Empleado:    "
            onChangeText={(text) => screenProps.stateReducer("employeeCode", text)}
            fontWeight='Bold'
            errorMessage={''}
            placeholder={''}
            inputStyle={{color: 'white'}}
          >
          </Input>
        </View>
        <Button
          onPressOut={() => screenProps.stateReducer("sendEmployeeCode", "")}
          buttonStylestyle='outline'
          title="Guardar código empleado"
        />
      </View>
    )
  }

  
  render() {
    const {screenProps} = this.props
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          >
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/hpLogo.png')
                  : require('../assets/images/hpLogo.png')
              }
              style={styles.welcomeImage}

            />
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
    marginLeft: -10,
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
