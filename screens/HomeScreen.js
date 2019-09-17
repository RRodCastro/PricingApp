import * as WebBrowser from 'expo-web-browser';
import React, { Component } from 'react'
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Label
} from 'react-native';

import { Button, Input, CheckBox } from 'react-native-elements'

export default class HomeScreen extends Component {
  render() {
    const { screenProps } = this.props
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/hpLogo.png')
                  : require('../assets/images/hpLogo.png')
              }
              style={styles.welcomeImage}
            />
          </View>

          <View style={styles.getStartedContainer}>
            <DevelopmentModeNotice />


            <View style={{ margin: 10 }}>
              <Input
                keyboardType='default'
                value={screenProps.state.currentCode}
                label="Código Producto     "
                onChangeText={(text) => screenProps.stateReducer("ProductCode", text)}
                fontWeight='Bold'
                errorMessage={''}
                placeholder={''}
              >
              </Input>
            </View>

            <View style={{ margin: 10 }}>
              <Input
                keyboardType='numeric'
                value={screenProps.state.inventoryPrice}
                label="Precio Inventario     "
                onChangeText={(text) => screenProps.stateReducer( "inventoryPrice",text)}
                fontWeight='Bold'
                errorMessage={''}
                placeholder={''}
              >
              </Input>
            </View>

            <View style={{ margin: 10 }}>
              <Input
                keyboardType='numeric'
                value={screenProps.state.currentPrice}
                label="Precio Consumidor  "
                onChangeText={(text) => screenProps.stateReducer( "salePrice",text)}
                fontWeight='Bold'
                errorMessage={''}
                placeholder={''}
              >
              </Input>
            </View>



            <View  style={{margin: 10 }}

            >
              <Text style={{ fontSize:16, textAlign: 'center', color: 'rgb(134,147,158)', fontWeight: 'bold'}}>¿Producto ofertado?</Text>
              <View  style={{flexDirection:'row', flexWrap:'wrap'}}>
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
              <View/>
            </View>


            </View>
            <Button
              onPressOut={() => screenProps.stateReducer("SumbitButton", "")}
              buttonStylestyle='outline'
              title="Enviar"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

}

HomeScreen.navigationOptions = {
  header: null,
};

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Pricing App {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        Production mode
      </Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync(
    'https://google.com'
  );
}

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
    paddingTop: 30,
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
});
