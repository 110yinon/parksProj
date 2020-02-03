import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Dimensions, Image, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const ruppinURL = "http://ruppinmobile.tempdomain.co.il/site03/api/User/";

export default class Cam extends Component {
    constructor(props) {
        super(props);

        this.camera = null;
        this.user = null;//this.props.navigation.getParam('userInfo');//from Main
        //{"UserID":2,"UserName":"avi","Password":"123","Email":"avi@gmail",
        // "LicensePlate":"123-456-789","userLatitude":"","userLongitude":""}


        this.state = {
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            picUri: 'https://facebook.github.io/react-native/docs/assets/favicon.png'
        };
    }

    componentDidMount = async () => {
        console.log("**** func: componentDidMount ****");
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' },
            () => {
                this.user = this.props.navigation.getParam('userInfo');
                console.log("this.user:", this.user);
            });
        // this.user = this.props.navigation.getParam('userInfo');
        // console.log("this.user from Main:", this.user);
        // this.setState({});

    }


    TakePic = async () => {

        if (this.camera) {
            alert("TakePic");
            let photo = await this.camera.takePictureAsync({ quality: 0.2 });
            this.setState({ photoUri: photo.uri }, () => { console.log("photo:", this.state.photoUri); });
        }
    }


    btnTakePic = async () => {
        if (this.camera) {
            let photo = await this.camera.takePictureAsync({ quality: 0.2 });

            let picName = "PARK-TEST.jpg";
            let dataI = new FormData();
            dataI.append('picture', {
                uri: photo.uri,
                name: picName,
                type: 'image/jpg'
            });

            const config = {
                method: 'POST',
                body: dataI,
            }

            fetch(ruppinURL + 'uploadpicture', config)
                .then((responseData) => {
                    let res = responseData._bodyText;
                    let picNameWOExt = picName.substring(0, picName.indexOf("."));
                    let imageNameWithGUID = res.substring(res.indexOf(picNameWOExt), res.indexOf(".jpg") + 4);
                    if (responseData.status == 201) {
                        this.setState({
                            uplodedPicUri: { uri: this.uploadDirURL + imageNameWithGUID },
                        });
                    }
                    else {
                        alert('error uploding ...');
                    }
                })
                .catch(err => {
                    alert('err upload= ' + err);
                })
        }






        /*
        const data = {
            userID: this.user.UserID,
            parkLat: this.userCoords.latitude,
            parkLng: this.userCoords.longitude,
            parkIMG: this.state.photoUri,
        };
        console.log("data:", data);
        fetch(ruppinURL + 'PicMyPark', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json;',
            }),
            body: JSON.stringify(data)
        })
            .then(res => {
                console.log('res=', res);
                return res.json()
            })
            .then(
                (result) => {
                    console.log("fetch POST= ", result);
                    console.log("fetch POST.d= ", result.d);
                    let p = JSON.parse(result.d);
                    console.log(p.Address);
                },
                (error) => {
                    console.log("err post=", error);
                });
                */

    };


    render() {

        const { hasCameraPermission } = this.state;
        // const hasCameraPermission = true;
        console.log("hasCameraPermission:", hasCameraPermission);


        if (hasCameraPermission === undefined || hasCameraPermission === null || hasCameraPermission === false) {
            // return <View />;
            return <View style={styles.container}>
                <Text style={styles.backBtn}>No access to camera</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => { this.props.navigation.push('Main'); }}>
                    <Text style={styles.backBtn}>Back</Text>
                </TouchableOpacity>
            </View>;

        }
        // else if (hasCameraPermission === false) {
        //     return <Text>No access to camera</Text>;
        // }
        else {
            return (
                <View style={styles.container}>
                    <Text style={styles.text}>Camera Page</Text>
                    <Camera ref={ref => { this.camera = ref; }} style={styles.cameraStyle} type={this.state.type} >
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: 'transparent',
                                flexDirection: 'row',
                            }}>
                            <TouchableOpacity
                                style={{
                                    flex: 0.2,
                                    alignSelf: 'flex-end',
                                    alignItems: 'center',
                                }}
                                onPress={() => {
                                    this.setState({
                                        type: this.state.type === Camera.Constants.Type.back
                                            ? Camera.Constants.Type.front
                                            : Camera.Constants.Type.back,
                                    });
                                }}>
                                {/* <Text
                                    style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                                    {' '}Flip{' '}
                                </Text> */}
                                <Ionicons name="md-reverse-camera" size={50} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={this.btnTakePic}>
                                <View style={{
                                    width: 55,
                                    height: 55,
                                    borderRadius: 50,
                                    justifyContent: 'center',
                                    backgroundColor: 'lightblue'
                                }}>
                                    <Image
                                        style={{
                                            alignSelf: 'center', width: 65, height: 65,
                                            // borderRadius: 50
                                        }}
                                        source={require('../assets/icons8-camera-64.png')} />
                                </View>
                            </TouchableOpacity>


                        </View>
                    </Camera>

                    <TouchableOpacity onPress={() => { this.props.navigation.push('Main'); }}>
                        <Text style={styles.backBtn}>Back</Text>
                    </TouchableOpacity>

                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bigFont: {
        fontSize: 30
    },
    text: {
        marginTop: 30,
        marginBottom: 5,
        backgroundColor: "yellow"
    },
    cameraStyle: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        width: "100%",

    },
    flipStyle: {
        fontSize: 30,
    },
    backBtn: {
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: "yellow"
    },
});