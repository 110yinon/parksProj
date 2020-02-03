import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Dimensions, Image, TouchableOpacity, StatusBar } from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, PinchGestureHandler } from 'react-native-gesture-handler';

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
        // this.closeMassage = <Text style={{ fontSize: 42, color: "white" }}>Camera will close in {this.state.count}</Text>;
        this.parkInfo = "";//contain the const data obj that send thruogh markPark func

        this.state = {
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            picUri: 'https://facebook.github.io/react-native/docs/assets/favicon.png',
            count: 20,
            zoom: 0,
            flashIcon: "ios-flash",
            flashIconColor: "white",
            flashMode: Camera.Constants.FlashMode.off,
            // closeMassage: this.closeMassage,
            // <View
            //     style={{ backgroundColor: "red", width: 30, height: 30, borderRadius: 100 }}>
            //         <Text>Camera closed</Text>
            // </View>

        };



    }

    componentDidMount = async () => {
        // console.log(`\nUserID:${this.user.UserID} -> `+ "**** CAM-COMP func: componentDidMount ****");
        console.log("this.state.flashMode:", this.state.flashMode);
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' },
            () => {
                this.user = this.props.navigation.getParam('userInfo');
                console.log(`UserID:${this.user.UserID} -> `+ "this.user:", this.user);
                this.parkInfo = this.props.navigation.getParam('parkInfo');
                console.log(`UserID:${this.user.UserID} -> `+ "parkInfo:", this.parkInfo);
            });
        // this.user = this.props.navigation.getParam('userInfo');
        // console.log("this.user from Main:", this.user);
        // this.setState({});


        const ID = setInterval(() => {
            this.setState(
                prevState => {
                    return { count: prevState.count - 1 }
                    // if (this.state.count % 2) {
                    //     return { closeMassage: this.closeMassage, count: prevState.count - 1 }
                    // }
                    // else {
                    //     return { closeMassage: null, count: prevState.count - 1 }
                    // }

                }, () => {
                    console.log(this.state.count);
                    if (this.state.count == 0) {
                        this.props.navigation.navigate('Main');
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
        // console.log(`\nUserID:${this.user.UserID} -> ` + "**** btnTakePic ****");
        console.log(`\nUserID:${this.user} -> ` + "**** btnTakePic ****");
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
                                ParkLatitude: this.parkInfo.ParkLatitude,
                                ParkLongitude: this.parkInfo.ParkLongitude,
                                // Date:this.user.dateOfLastPark,
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
                            console.log(`\nUserID:${this.user} -> ` + "**** END btnTakePic ****");
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
                    {/* <Text style={styles.text}>Camera Page</Text> */}
                    <View
                        style={{
                            backgroundColor: "black",
                            // opacity: 0.7,
                            width: "100%",
                            height: "3%",
                            // position:"absolute"
                        }}>
                        <StatusBar barStyle="light-content"></StatusBar>
                    </View>


                    <View
                        style={{
                            backgroundColor: "black",
                            opacity: 1,
                            width: "100%",
                            height: "10%",
                            flexDirection: 'row',
                            justifyContent: "space-around",
                            alignItems: "center",
                        }}>

                        <TouchableOpacity
                            style={{
                                // flex: 0.2,
                                // alignSelf: 'flex-end',
                                // alignItems: 'center',
                                backgroundColor: "black",
                                // marginLeft:20,
                                // width:50,
                                // height:50,
                            }}
                            onPress={() => {
                                // if(this.state.flash === Camera.Constants.flashMode.on)
                                // this.setState({
                                //     flash: this.state.flash === Camera.Constants.flashMode.back
                                //         ? Camera.Constants.Type.front
                                //         : Camera.Constants.Type.back,
                                // });
                                this.setState({
                                    zoomBar:
                                        <View style={{
                                            backgroundColor: "black",
                                            width: "70%",
                                            flexDirection: 'row',
                                            justifyContent: "space-around",
                                            alignItems: "center",
                                        }}>
                                            <Button title="off" color="white"
                                                onPress={() => {
                                                    this.setState({ flashIcon: "ios-flash-off", flashIconColor: "white", flashMode: Camera.Constants.FlashMode.off }
                                                        , () => { console.log("this.state.flashMode:", this.state.flashMode); }
                                                    );
                                                }}>
                                            </Button>

                                            <Button title="auto" color="white"
                                                onPress={() => {
                                                    this.setState({ flashIcon: "ios-flash", flashIconColor: "white", flashMode: Camera.Constants.FlashMode.auto }
                                                        , () => { console.log("this.state.flashMode:", this.state.flashMode); }
                                                    );
                                                }}>
                                            </Button>

                                            <Button title="on" color="white"
                                                onPress={
                                                    () => {
                                                        this.setState({ flashIcon: "ios-flash", flashIconColor: "orange", flashMode: Camera.Constants.FlashMode.on }
                                                            , () => { console.log("this.state.flashMode:", this.state.flashMode); }
                                                        );
                                                    }}>
                                            </Button>
                                        </View>
                                });
                            }}>


                            <Ionicons name={this.state.flashIcon} size={30} color={this.state.flashIconColor} />
                        </TouchableOpacity>
                        {this.state.zoomBar}
                    </View>



                    {/* <ScrollView onScroll={() => { console.log("scrolling") }}>
                        <Text style={{ backgroundColor: "red", width: "100%", height: 30 }}>hello</Text>
                        <Text style={{ backgroundColor: "red", width: "100%", height: 30 }}>hello</Text>
                        <Text style={{ backgroundColor: "red", width: "100%", height: 30 }}>hello</Text>
                        <Text style={{ backgroundColor: "red", width: "100%", height: 30 }}>hello</Text>
                    </ScrollView> */}
                    {/* <Camera
                        ref={ref => { this.camera = ref; }}
                        style={styles.cameraStyle}
                        type={this.state.type}
                        flashMode={this.state.flashMode}

                        autoFocus={Camera.Constants.AutoFocus.on}
                        zoom={this.state.zoom}>


                        <View
                            style={{
                                flex: 1,
                                backgroundColor: 'transparent',
                                flexDirection: 'row',
                            }}>


                        </View>
                    </Camera> */}


                    <PinchGestureHandler
                        enabled={true}
                        onGestureEvent={
                            //     (e) => {

                            //     console.log("\n\n\n::: onGestureEvent :::");
                            //     // console.log("\n\n\ne.nativeEvent:", e.nativeEvent);
                            //     console.log("e.nativeEvent.scale:", e.nativeEvent.scale);
                            //     console.log("e.nativeEvent.velocity:", e.nativeEvent.velocity);
                            //     console.log("this.state.zoom:",this.state.zoom);
                            //     if (e.nativeEvent.scale > 1) {
                            //         console.log("scale > 1");
                            //         var x = e.nativeEvent.scale % parseInt(e.nativeEvent.scale);
                            //         x = x / 10;
                            //     }
                            //     else {
                            //         console.log("else");
                            //         var x = e.nativeEvent.scale;
                            //         x = x / 10;
                            //     }
                            //     console.log("x:", x);

                            //     var lastTime = this.state.zoom;

                            //     if(this.state.zoom == 0.04 && e.nativeEvent.velocity > 0){
                            //         console.log("max zoom");
                            //     }
                            //     if(this.state.zoom == 0 && e.nativeEvent.velocity < 0){
                            //         console.log("min zoom");
                            //     }
                            //     else{
                            //         if (x >= 0.04 && e.nativeEvent.velocity > 0) {
                            //             console.log("if x >= 0.04");
                            //             this.setState({ zoom: 0.04 }, () => { console.log("this.state.zoom:", this.state.zoom) });
                            //         }
                            //         else if (x >= 0.04 && e.nativeEvent.velocity < 0) {
                            //             console.log("else if");
                            //             this.setState({ zoom: 0 }, () => { console.log("this.state.zoom:", this.state.zoom) });
                            //         }
                            //         else{
                            //             console.log("else zoom");
                            //             this.setState({ zoom: x }, () => { console.log("this.state.zoom:", this.state.zoom) });
                            //         }
                            //     }

                            // }}
                            (e) => {
                                console.log("\n\n\n::: onGestureEvent :::");
                                // console.log("\n\n\ne.nativeEvent:", e.nativeEvent);
                                // console.log("e.nativeEvent.scale:", e.nativeEvent.scale);
                                // console.log("e.nativeEvent.velocity:", e.nativeEvent.velocity);
                                // console.log("this.state.zoom:", this.state.zoom);
                                // if (e.nativeEvent.scale > 1) {
                                //     // console.log("scale > 1");
                                //     var x = e.nativeEvent.scale % parseInt(e.nativeEvent.scale);
                                //     x = x / 10;
                                // }
                                // else {
                                //     // console.log("else");
                                //     var x = e.nativeEvent.scale;
                                //     x = x / 10;
                                // }
                                // console.log("x:", x);

                                // var lastTime = this.state.zoom;
                                // console.log("lastTime:", lastTime);

                                // if (e.nativeEvent.velocity > 0) {
                                //     console.log("zoom-in");
                                //     if (x > lastTime) {
                                //         console.log("if");
                                //         if (x >= 0.04) {
                                //             this.setState({ zoom: 0.04 }, () => { console.log("this.state.zoom:", this.state.zoom) });
                                //         }
                                //         else {
                                //             this.setState({ zoom: x }, () => { console.log("this.state.zoom:", this.state.zoom) });
                                //         }

                                //     }
                                // }
                                if (e.nativeEvent.velocity > 0 && this.state.zoom <= 0.04) {
                                    this.setState(prevState => {
                                        let score = prevState.zoom + 0.001;
                                        if (score < 0.04) { return { zoom: score } }
                                        else return { zoom: 0.04 }
                                    },
                                        () => { console.log("this.state.zoom:", this.state.zoom) });
                                    return;
                                }
                                else if (e.nativeEvent.velocity < 0 && this.state.zoom != 0) {
                                    console.log("zoom-out");
                                    // if (x < lastTime) {
                                    //     console.log("if");
                                    //     if (x < 0) {
                                    //         this.setState({ zoom: 0 }, () => { console.log("this.state.zoom:", this.state.zoom) });
                                    //     }
                                    //     else {
                                    //         this.setState({ zoom: x }, () => { console.log("this.state.zoom:", this.state.zoom) });
                                    //     }
                                    // }
                                    // let score = lastTime - 0.001;
                                    // console.log("score:", score);
                                    // if (score <= 0) {
                                    //     this.setState({ zoom: 0 }, () => { console.log("this.state.zoom:", this.state.zoom) });
                                    // }
                                    // else {
                                    //     this.setState({ zoom: score }, () => { console.log("this.state.zoom:", this.state.zoom) });
                                    // }
                                    // this.setState((prevState) => ({ zoom: 0 }), () => { console.log("this.state.zoom:", this.state.zoom) });
                                    this.setState(prevState => {
                                        let score = prevState.zoom - 0.001;
                                        if (score > 0) { return { zoom: score } }
                                        else return { zoom: 0 }
                                    },
                                        () => { console.log("this.state.zoom:", this.state.zoom) });
                                    return;
                                }




                                // if(this.state.zoom == 0 && e.nativeEvent.velocity < 0){
                                //     console.log("min zoom");
                                // }
                                // else{
                                //     if (x >= 0.04 && e.nativeEvent.velocity > 0) {
                                //         console.log("if x >= 0.04");
                                //         this.setState({ zoom: 0.04 }, () => { console.log("this.state.zoom:", this.state.zoom) });
                                //     }
                                //     else if (x >= 0.04 && e.nativeEvent.velocity < 0) {
                                //         console.log("else if");
                                //         this.setState({ zoom: 0 }, () => { console.log("this.state.zoom:", this.state.zoom) });
                                //     }
                                //     else{
                                //         console.log("else zoom");
                                //         this.setState({ zoom: x }, () => { console.log("this.state.zoom:", this.state.zoom) });
                                //     }
                                // }

                            }}
                    >
                        <View style={{ width: "100%", height: "72%" }}>
                            <Camera
                                ref={ref => { this.camera = ref; }}
                                style={styles.cameraStyle}
                                type={this.state.type}
                                flashMode={this.state.flashMode}

                                autoFocus={Camera.Constants.AutoFocus.on}
                                zoom={this.state.zoom}>


                                <View
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'transparent',
                                        flexDirection: 'row',
                                    }}>

                                    <Text style={{ fontSize: 34, color: "#f3f2da",textAlign:"center" }}>Camera automatic close in: {this.state.count}</Text>
                                </View>
                            </Camera>
                        </View>
                    </PinchGestureHandler>


                    <View
                        style={{
                            width: "100%",
                            height: "15%",
                            backgroundColor: 'black',
                            flexDirection: 'row',
                            justifyContent: "space-around",
                            alignItems: "center",
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                // flex: 0.2,
                                // alignSelf: 'flex-end',
                                // alignItems: 'center',
                                backgroundColor: "black",
                                // marginLeft:20,
                                // width:50,
                                // height:50,
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
                            <Ionicons name="ios-reverse-camera" size={60} color="white" />
                        </TouchableOpacity>
                        <View
                            style={{
                                backgroundColor: "white",
                                width: 75,
                                height: 75,
                                borderRadius: 100,
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: "white",
                                    width: 65,
                                    height: 65,
                                    borderRadius: 100,
                                    borderColor: "black",
                                    borderWidth: 3,
                                    borderStyle: 'solid'
                                }}
                                onPress={this.btnTakePic}
                            >
                            </TouchableOpacity>
                        </View>
                        {/* <View
                            style={{
                                backgroundColor: "grey",
                                width: 50,
                                height: 50,
                            }}>
                            <Image source={this.state.uplodedPicUri}></Image>
                        </View> */}
                        <TouchableOpacity
                            style={{
                                // backgroundColor: "red"
                            }}
                            onPress={() => {
                                this.props.navigation.navigate('Main');
                            }}>
                            <Ionicons name="md-arrow-round-back" size={60} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* <TouchableOpacity style={{backgroundColor:"red"}} onPress={() => { this.props.navigation.push('Main'); }}>
                        <Text style={styles.backBtn}>Back</Text>
                    </TouchableOpacity> */}

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
