import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator} from 'react-navigation-stack';

import MainTabNavigator from './MainTabNavigator';

export default createAppContainer(
  createStackNavigator({
    Main: MainTabNavigator
  })
);

