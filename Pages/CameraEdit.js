import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Dimensions, Image, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const ruppinURL = "http://ruppinmobile.tempdomain.co.il/site03/api/User/";
const uploadFileRoot = "http://ruppinmobile.tempdomain.co.il/site03/uploadFiles/";
const picFromAssetes = "../assets/cat.jpg";

export default class Cam extends Component {
    constructor(props) {
        super(props);

        this.camera = null;
        this.user = "";//this.props.navigation.getParam('userInfo');//from Main
        //{"UserID":2,"UserName":"avi","Password":"123","Email":"avi@gmail",
        // "LicensePlate":"123-456-789","userLatitude":"","userLongitude":""}
        this.intervalID = 10;

        this.state = {
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            picUri: 'https://facebook.github.io/react-native/docs/assets/favicon.png',
            count: 3,
        };
    }

    componentDidMount = async () => {
        // console.log(`\nUserID:${this.user.UserID} -> `+ "**** CAM-COMP func: componentDidMount ****");
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' },
            () => {
                this.user = this.props.navigation.getParam('userInfo');
                // console.log(`UserID:${this.user.UserID} -> `+ "this.user:", this.user);
            });
        // this.user = this.props.navigation.getParam('userInfo');
        // console.log("this.user from Main:", this.user);
        // this.setState({});


        const ID = setInterval(() => {
            this.setState((prevState) => ({ count: prevState.count - 1 }), () => {
                console.log(this.state.count);
                if (this.state.count == 0) {
                    // this.props.navigation.navigate('Main');
                    console.log("STOP");
                    clearInterval(ID);
                    
                }
            })


        }, 1000);

    }


    callForPush = () => {
        console.log(`\nUserID:${this.user.UserID} -> ` + "***** func callForPush *****");
        fetch(ruppinURL + 'push', {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            // body: JSON.stringify(data)

        })
            .then(res => {
                console.log(`UserID:${this.user.UserID} -> ` + 'push res=', res);
                console.log(`UserID:${this.user.UserID} -> ` + "**** END func: callForPush ****");
                return res.json()
            }, (error) => {
                console.log(`UserID:${this.user.UserID} -> ` + "err post=", error);
            })
    }



    btnTakePic = async () => {
        console.log(`\nUserID:${this.user.UserID} -> ` + "**** btnTakePic ****")
        if (this.camera) {
            let photo = await this.camera.takePictureAsync({ quality: 0.2 });
            // this.setState({ photoUri: photo.uri }, () => { console.log("photo:", this.state.photoUri); });
            // console.log("photo:", photo);
            // const data = {
            //     userID: this.user.UserID,
            //     parkLat: this.userCoords.latitude,
            //     parkLng: this.userCoords.longitude,
            //     parkIMG: this.state.photoUri,
            // };
            // console.log("data:", data);
            let picName = `UserID_${this.user.UserID}_ParkPic.jpg`;
            let dataI = new FormData();
            dataI.append('picture', {
                uri: photo.uri,
                name: picName,
                type: 'image/jpg'
            });

            const config = {
                method: 'POST',
                headers: new Headers({
                    // 'Accept': 'application/json;charset=UTF-8'
                    // 'Content-Type': 'application/json;charset=UTF-8',
                }),
                body: dataI,
            }
            // console.log("photo.uri: ",photo.uri);
            fetch(ruppinURL + 'uploadpicture', config)
                .then(res => {
                    console.log(`UserID:${this.user.UserID} -> ` + 'uploadpicture res=', res);
                    // if (res.status == 201) {
                    //     // somthings....
                    // }
                    // else {
                    //     alert('error uploding ...');
                    // }
                    return res.json()
                })
                .then((responseData) => {
                    console.log(`UserID:${this.user.UserID} -> ` + ">>>>>> responseData: ", responseData);
                    let picNameWOExt = picName.substring(0, picName.indexOf("."));
                    console.log(`UserID:${this.user.UserID} -> ` + ">>>>>> picNameWOExt: ", picNameWOExt);
                    let imageNameWithGUID = responseData.substring(responseData.indexOf(picNameWOExt), responseData.indexOf(".jpg") + 4);
                    console.log(`UserID:${this.user.UserID} -> ` + ">>>>>> imageNameWithGUID: ", imageNameWithGUID);

                    // this.setState({
                    //     uplodedPicUri: { uri: uploadFileRoot + imageNameWithGUID },
                    //     // uplodedPicUri: { uri: photo.uri },
                    // });


                    fetch(ruppinURL + 'picture', {
                        method: 'post',
                        headers: new Headers({
                            'Content-Type': 'application/json;charset=UTF-8'
                        }),
                        body: JSON.stringify(
                            {
                                userID: this.user.UserID,
                                ParkLatitude: this.user.userLatitude,
                                ParkLongitude: this.user.userLongitude,
                                ParkIMG: imageNameWithGUID,
                            })
                    })
                        .then(res => {
                            console.log(`UserID:${this.user.UserID} -> ` + 'picture res=', res);

                            this.setState({
                                uplodedPicUri: { uri: uploadFileRoot + imageNameWithGUID },
                                // uplodedPicUri: { uri: photo.uri },
                            }, () => {
                                this.props.navigation.navigate('Main');
                                this.callForPush();
                            });

                            return res.json()
                        }, (error) => {
                            console.log(`UserID:${this.user.UserID} -> ` + "err post=", error);
                        })




                })
                .catch(err => {
                    alert('err upload= ' + err);
                    console.log(`UserID:${this.user.UserID} -> ` + "err: ", err);
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
        // console.log(`UserID:${this.user.UserID} -> `+ "hasCameraPermission:", hasCameraPermission);


        if (hasCameraPermission === undefined || hasCameraPermission === null || hasCameraPermission === false || hasCameraPermission === "denied") {
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
                                <Ionicons name="md-reverse-camera" size={50} color="white" />
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

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'transparent',
                            flexDirection: 'row',
                        }}
                    >
                        <Image
                            style={{
                                alignSelf: 'center', width: 65, height: 65,
                                // borderRadius: 50
                                flex: 1,
                                height: '100%',
                                width: '100%',
                            }}
                            source={this.state.uplodedPicUri} />
                        {/* // source={require('../assets/cat.jpg')} />
                            // source={{uri: uploadFileRoot + 'cat.jpg'}} />
                            // source={require(picFromAssetes)} /> */}
                    </View>

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
