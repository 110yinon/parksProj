import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput, AsyncStorage,StatusBar } from 'react-native';



const ruppinURL = "http://ruppinmobile.tempdomain.co.il/site03/api/User/";


export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            txtEmail: "",
            txtPass: ""
        }
    }

    //method of collect Email input
    txtEmailChange = (e) => {
        this.setState({
            txtEmail: e
        });
    }
    //method of collect Password input
    txtPassChange = (e) => {
        this.setState({
            txtPass: e
        });
    }


    btnLogin = () => {
        //The user data to send
        const data = {
            Email: this.state.txtEmail,
            Password: this.state.txtPass
        };
        // console.log(data);

        fetch(ruppinURL + 'login', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            body: JSON.stringify(data)
        })
            .then(res => {
                console.log('res=', res);//res = http result from server
                return res.json()//res.json() = result body info 
            })
            .then(
                (result) => { //result = res.json() = result body info 
                    console.log("result:", result);
                    let user = result;
                    console.log("user:", user);

                    if (user != null) {
                        AsyncStorage.setItem('user', JSON.stringify(user), //user info save in device
                            () => { this.props.navigation.push('Main'); }); //go to Main
                    }
                    else {
                        alert('Login-failed, check fields');
                    }

                },
                (error) => {
                    console.log("err post=", error);
                });
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content"></StatusBar>
                <Text style={styles.bigFont}>Login Page</Text>
                <TextInput style={{ fontSize: 30, borderColor: "lightgrey", borderBottomWidth: 3, width: 300, }} placeholder="Email" onChangeText={this.txtEmailChange}></TextInput>
                <TextInput style={{ fontSize: 30, borderColor: "lightgrey", borderBottomWidth: 3, width: 300, }} placeholder="Password" onChangeText={this.txtPassChange}></TextInput>
                <Button title="Log-in" onPress={this.btnLogin}></Button>
                <Button title="menu" onPress={this.props.navigation.openDrawer}></Button>

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
    bigFont: {
        fontSize: 30
    }
});
