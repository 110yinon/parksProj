import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput, AsyncStorage } from 'react-native';


export default class Stam extends Component {
    constructor(props) {
        super(props);

    }

    storeData = async () => {
        await AsyncStorage.setItem('@MySuperStore:key', 'I like to save it.');
        alert("after");
    }

    retrieveData = async () => {
        const value = await AsyncStorage.getItem('@MySuperStore:key');
        console.log("value is:", value);
    };

    render() {
        return (
            <View style={styles.container}>
                <Text>hello stam</Text>
                <Button title="set"
                    onPress={() => {

                        this.storeData();
                    }}>

                </Button>

                <Button title="get"
                    onPress={() => {
                        alert("get");
                        this.retrieveData();
                    }}>

                </Button>
            </View>
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