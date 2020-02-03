import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Dimensions, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';


export default class Main extends Component {
    constructor(props) {
        super(props);

        this.state={
            errorMessage:null,
            location:""
        }
    }


    btnLocation = async () => {
        alert("hey");
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({ errorMessage: 'Permission to access location was denied', });
        }
        let location = await Location.getCurrentPositionAsync({});
        this.setState({ location },()=>{console.log(this.state.location.coords.longitude)} );
            
        console.log(location);
    }




    render() {
        return (
            <View style={styles.container}>

                <Text style={styles.text}>Main Page</Text>

                <MapView style={{
                    flex: 1,
                    width: Dimensions.get('window').width - 10,
                }}
                    initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
                <Button style={styles.container} title="myLocation" onPress={this.btnLocation} />




            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        // border: 0,
        // padding: 0,
        // margin: 0,

    },
    bigFont: {
        fontSize: 30
    },
    text: {
        marginTop: 30,
        marginBottom: 5,
        backgroundColor: "yellow"
    }
});