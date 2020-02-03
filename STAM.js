import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput, AsyncStorage } from 'react-native';



const ruppinURL = "http://ruppinmobile.tempdomain.co.il/site03/api/User/";


export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            txtEmail: "",
            txtPass: ""
        }
    }

    //userObjToStorage  - for opt2 in btnLogin
    storeData = async (userObjToStorage) => {
        console.log('userObjToStorage:', userObjToStorage);
        await AsyncStorage.setItem('user', JSON.stringify(userObjToStorage));
        console.log("setItem done !");
        this.props.navigation.navigate('Main');
    }



    txtEmailChange = (e) => {
        this.setState({
            txtEmail: e
        });
    }

    txtPassChange = (e) => {
        this.setState({
            txtPass: e
        });
    }

    btnLogin = () => {
        
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
                console.log('res=', res);
                return res.json()
            })
            .then(
                (result) => {
                    console.log("result", result);
                    //console.log("fetch POST.d= ", result.d);
                    let user = result;
                    console.log("user:", user);

                    if (user != null) {
                        //opt1
                        AsyncStorage.setItem('user', JSON.stringify(user),
                            () => { this.props.navigation.push('Main'); });


                        //opt2
                        //this.storeData(user);
                        // this.props.navigation.navigate('Main');



                        //opt3
                        // AsyncStorage.setItem('user', JSON.stringify(user))
                        // .then(()=>{this.props.navigation.navigate('Main');})
                    }
                    else {
                        alert('failed');
                    }

                },
                (error) => {
                    console.log("err post=", error);
                });

        // if (this.state.txtUserName == "avi" && this.state.txtPass == "123") {
        //     alert("Welcome");
        //     this.props.navigation.navigate('MainPage');
        // }
        // else {
        //     alert("faild");
        // }
    }

    render() {
        return (
            <View style={styles.container}>

                <Text style={styles.bigFont}>Login Page</Text>
                <TextInput style={{fontSize: 30,borderColor:"lightgrey",borderBottomWidth:3,width:300,}} placeholder="Email" onChangeText={this.txtEmailChange}></TextInput>
                <TextInput style={{fontSize: 30,borderColor:"lightgrey",borderBottomWidth:3,width:300,}} placeholder="Password" onChangeText={this.txtPassChange}></TextInput>
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
