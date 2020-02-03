import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import Login from './Pages/Login.js'
import Main from './Pages/Main.js'
import kuku from './Pages/kuku.js'
import Camera from './Pages/Camera.js'
import Stam from './Pages/Stam.js'
import { createStackNavigator, createAppContainer, createBottomTabNavigator, createDrawerNavigator } from 'react-navigation';
import CameraEdit from './Pages/CameraEdit.js'


class App extends Component {
  constructor(props) {
    super(props);

  }


  render() {
    return (

      <AppNavigator />
      // <TabPageNavigator />
      // <stackAndTabNavigator />
      // <DrawerNavigator />

    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
});

//for stack navigator only
const AppNavigator = createStackNavigator(
  {
    Main: Main,
    kuku: kuku,
    Login: Login,
    Camera: Camera,
  },
  {
    initialRouteName: 'Main',
    // initialRouteName: 'kuku',
    headerMode: 'none',
    // navigationOptions: {
    //   headerVisible: false,
    // }
  },
);

/******************************/
//for tab navigator only
// const TabPageNavigator = createBottomTabNavigator(
// {
//   LoginPage: Login,
//   WelcomePage: Welcome,
// },
// {
// Other configuration
// }
// );

/******************************/
// for stack And Tab navigator
// export default stackAndTabNavigator = createAppContainer(createBottomTabNavigator(
//   {
//     LoginPage: Login,
//     WelcomePage: Welcome,
//   },
//   // {
//   // Other configuration
//   // }
// ));

/******************************/
//for Drawer Navigator
const DrawerNavigator = createDrawerNavigator({
  Main: Main,
  Login: Login,
  Camera: Camera,

},
  {
    initialRouteName: 'Main',
    hideStatusBar: true,
    drawerBackgroundColor: 'rgba(255,255,255,.9)',
    overlayColor: '#6b52ae',
    contentOptions: {
      activeTintColor: '#fff',
      activeBackgroundColor: '#6b52ae',
    },
  }
);

// export default createAppContainer(DrawerNavigator);
export default createAppContainer(AppNavigator);