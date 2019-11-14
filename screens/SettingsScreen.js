import React, { Component } from 'react';
import Constants from 'expo-constants';

import { SectionList, Image, StyleSheet, Text, View, AsyncStorage, TextInput, Button, Keyboard, Alert, ToastAndroid } from 'react-native';

const Toast = (props) => {
  if (props.visible) {
    ToastAndroid.showWithGravityAndOffset(
      props.message,
      ToastAndroid.LONG,
      ToastAndroid.TOP,
      25,
      50,
    );
    return null;
  }
  return null;
};

export default class SettingsScreen extends React.Component {
  
  constructor(props){
    super(props)
    this.state = {
      employeeCode: '',
      editEmployee: true,
      showToast: false
    }
  }

  async componentWillMount() {
    const value = await AsyncStorage.getItem('HPCode');
    this.setState({ employeeCode: value })
  }

  

  _renderSectionHeader = ({ section }) => {
    return <SectionHeader title={section.title} />;
  };

  _renderItem = ({ item }) => {
    if (item.type === 'color') {
      return <SectionContent>{item.value && <Color value={item.value} />}</SectionContent>;
    } else {
      return (
        <SectionContent>
          <Text style={styles.sectionContentText}>{item.value}</Text>
        </SectionContent>
      );
    }
  };

  _saveEmployeeCode =  async () => {
    await AsyncStorage.setItem('HPCode', this.state.employeeCode);
    this.setState({showToast: true})
    Keyboard.dismiss();
    setTimeout(() => {this.setState({showToast: false})},1000)
  }

  renderCodText = () => (
    <View >
    <TextInput
      style={styles.employeeContentText}
      value={this.state.employeeCode}
      onChangeText={text => this.setState({employeeCode: text})}
    />
    <Button
      onPress={() => { this._saveEmployeeCode()}
      }
      buttonStylestyle='outline'
      title={"Actualizar número de ruta"}
    />
    </View>
  );

  ListHeader = () => {
    const { manifest } = Constants;
  
    return (
      <View style={styles.titleContainer}>
        <View style={styles.titleIconContainer}>
          <AppIconPreview />
        </View>
  
        <View style={styles.titleTextContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {manifest.name}
          </Text>
  
          <Text style={styles.slugText} numberOfLines={1}>
            {manifest.slug}
          </Text>
  
          <Text style={styles.descriptionText}>{manifest.description}</Text>
        </View>
        <Toast visible={this.state.showToast} message="Número de ruta actualizado" />
      </View>
    );
  };
  

  render() {
    const { manifest = {} } = Constants;
    const sections = [
      
      { data: [{ value: this.state.employeeCode }], title: 'Número de ruta', renderItem: this.renderCodText } ,
      { data: [{ value: manifest.version }], title: 'version' }
      
    ];

    return (        
      <SectionList
        style={styles.container}
        renderItem={this._renderItem}
        renderSectionHeader={this._renderSectionHeader}
        stickySectionHeadersEnabled={true}
        keyExtractor={(item, index) => index}
        ListHeaderComponent={this.ListHeader}
        sections={sections}
        keyboardShouldPersistTaps={"always"}
      />
   );
  }
}

SettingsScreen.navigationOptions = {
  title: 'Pricing HP',
};


const AppIconPreview = () => {
  const iconUrl = '../assets/images/icon.png';
  return <Image source={require('../assets/images/hpLogo.png')} style={{ width: 100, height: 62 }} resizeMode="contain" />;
};

const Color = ({ value }) => {
  if (!value) {
    return <View />;
  } else {
    return (
      <View style={styles.colorContainer}>
        <View style={[styles.colorPreview, { backgroundColor: value }]} />
        <View style={styles.colorTextContainer}>
          <Text style={styles.sectionContentText}>{value}</Text>
        </View>
      </View>
    );
  }
};


const SectionHeader = ({ title }) => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
};

const SectionContent = props => {
  return <View style={styles.sectionContentContainer}>{props.children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
  },
  titleIconContainer: {
    marginRight: 15,
    paddingTop: 2,
  },
  sectionHeaderContainer: {
    backgroundColor: '#fbfbfb',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ededed',
  },
  sectionHeaderText: {
    fontSize: 14,
  },
  sectionContentContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 15,
  },
  sectionContentText: {
    color: '#808080',
    fontSize: 14,
  },
  employeeContentText: {
    color: '#808080',
    fontSize: 14,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 15
  },
  nameText: {
    fontWeight: '600',
    fontSize: 18,
  },
  slugText: {
    color: '#a39f9f',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 6,
    color: '#4d4d4d',
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    width: 17,
    height: 17,
    borderRadius: 2,
    marginRight: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  colorTextContainer: {
    flex: 1,
  },
});
