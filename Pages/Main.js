import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Dimensions, Image, AsyncStorage, ImageBackground, StatusBar, TouchableOpacity } from 'react-native';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Dialog, { DialogContent, DialogButton, DialogTitle, DialogFooter } from 'react-native-popup-dialog';
import {
    Ionicons, FontAwesome, MaterialIcons, AntDesign, MaterialCommunityIcons, Feather
} from '@expo/vector-icons'
// import { TouchableOpacity } from 'react-native-gesture-handler';
import registerForPushNotificationsAsync from '../Pages/registerForPushNotificationsAsync.js'
import { Notifications } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';


const ruppinURL = "http://ruppinmobile.tempdomain.co.il/site03/api/User/";
const uploadFileRoot = "http://ruppinmobile.tempdomain.co.il/site03/uploadFiles/";

export default class Main extends Component {
    constructor(props) {
        super(props);


        //fields
        this.output = "";
        this.map = null; //MapView Refernce
        this.user = "";
        this.parkLatLng = "";
        this.freeParksArr = [];
        this.freeParksArr2 = [];
        this.index = 0;
        // this.myPark = null;
        this.isDisabledParkingColor = "lightgrey";
        this.isFreeColor = "lightgrey";
        this.ParkingLotIconOriginal = require('../assets/parkingLotIMG.png');
        this.ParkingLotIconBright = require('../assets/parkingLotIMGbrightless.png');
        this.ParkingLotColor = this.ParkingLotIconBright;
        this.forVanColor = "lightgrey";
        this.parkPicURL = require('../assets/no-image-icon-6.png');
        this.parkToNav = null;
        this.navModeTag =
            <View style={{ backgroundColor: "#fd405c", width: "100%", height: "5%", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>Navigate To Parking</Text>
            </View>;

        // this.initialRegion = {
        //     latitude: 32.08690348736677,
        //     latitudeDelta: 0.21394020796880397,
        //     longitude: 34.78171203285456,
        //     longitudeDelta: 0.1419679820537567,
        // }

        this.reg = "";
        this.focusOnUser = true;
        this.firstTimeAfterRegChange = false;
        this.pan = false;
        this.tap = false;
        this.zoom = false;
        this.locBtn = false;
        this.dblPress = false;

        this.lat = 32.08690348736677;
        this.lng = 34.78171203285456;
        this.latD = 1.0;
        this.lngD = 1.0;

        this.changeFromSetState = true;
        this.isPanDrag = false;
        this.FirstZoom = false;
        this.region = null;

        this.latBefore = 0;
        this.lngBefore = 0;
        this.latDBefore = 0;
        this.lngDBefore = 0;

        //for OPT 2
        this.firstSstFinish = false;

        this.regionFromDrag = false;

        this.regionFromUserLocBtn = false;

        this.onMapReadyFLAG = false;

        this.statutsBarNormalMode =
            <LinearGradient
                colors={['#000000', '#7d7d7d']}//#7d7d7d
                style={{
                    width: "100%",
                    height: "100%",
                    opacity: 0.8,
                    // position: "absolute",
                    zIndex: 1,
                }}
                locations={[0.1, 0.9]}//locations={[0.1, 0.9]}
            >
            </LinearGradient>


        this.statutsBarNavMode =
            <LinearGradient
                colors={['#fd405c', '#feafbb']}//#7d7d7d
                style={{
                    width: "100%",
                    height: "200%",
                    opacity: 0.8,
                    // position: "absolute",
                    zIndex: 1,
                    flexDirection: "row", justifyContent: "center", alignItems: "flex-end"
                }}
                locations={[0.1, 0.9]}//locations={[0.1, 0.9]}
            >
                <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>Navigate To Parking</Text>
            </LinearGradient>;


        this.mode = "search";//or "navigation"

        this.markerCoords = "";
        this.markerStreet = "";
        this.markerCity = "";
        this.isPicToPark = false;
        this.isFreeParking = true;
        this.isDisabledParking = false;
        this.isParkingLot = false;
        this.isVanParking = false;
        this.releaseStatus = "now";
        this.IParked = false;
        //for the first time that this.preVdist = this.dist
        //this.preVdist must be a num that greater than this.dist
        this.dist = 0.1;
        this.interval = 0;//count intervals for the firstCheckForDist method
        this.seconds = 0; //count seconds for the secondCheckForDist//need only for first time
        this.countMsgYouRCloseToParking = 0;
        this.updatePark = false;


        this.msgYouRCloseToParking =
            <View
                style={{
                    backgroundColor: "lightgreen",
                    opacity: 0.9,
                    width: "10000%",
                    height: "80%",
                    justifyContent: "center",//from up to down
                    alignItems: "center"//from left to right
                }}>
                <View style={{
                    flexDirection: "column", justifyContent: "center", alignItems: "center",
                    backgroundColor: "lightsalmon", width: "100%", height: "50%"
                }}>
                    <Text style={{ fontSize: 24 }}>You are approaching the parking</Text>
                    <Text style={{ fontSize: 20 }}>is it still free?</Text>
                </View>

                <View
                    style={{
                        backgroundColor: "red",
                        opacity: 0.9,
                        width: "100%%",
                        height: "50%",
                        flexDirection: "row",
                        justifyContent: "space-around",//from up to down
                        alignItems: "center"//from left to right
                    }}>
                    <TouchableOpacity style={{
                        flexDirection: "column", justifyContent: "center", alignItems: "center",
                        backgroundColor: "blue", width: "45%", height: "100%"
                    }}
                        onPress={() => {
                            this.setState({ parkingDailogMessage: this.msgKeepGoing }
                                , () => {
                                    setTimeout(() => { this.setState({ parkingDailogMessage: null }) }, 3000);
                                }
                            )
                        }}>
                        <Text style={{ fontSize: 20 }}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        flexDirection: "column", justifyContent: "center", alignItems: "center",
                        backgroundColor: "blue", width: "45%", height: "100%"
                    }}
                        onPress={() => {
                            this.IParked = false;
                            this.setState({ parkingDailogMessage: this.msgParkingCapturedClosingNav }
                                , () => {
                                    this.CapturedByOther = true;
                                    this.stopNav();
                                    setTimeout(() => { this.setState({ parkingDailogMessage: null }) }, 6000);
                                }
                            )
                        }}>
                        <Text style={{ fontSize: 20 }}>Captured</Text>
                        <Text style={{ fontSize: 18 }}>By other driver</Text>
                    </TouchableOpacity>
                </View>

            </View>




        this.msgParkingCapturedClosingNav =
            <View
                style={{
                    backgroundColor: "lightgreen",
                    opacity: 0.9,
                    width: "10000%",
                    height: "80%",
                    justifyContent: "center",//from up to down
                    alignItems: "center"//from left to right
                }}>
                <View style={{
                    flexDirection: "column", justifyContent: "center", alignItems: "center",
                    backgroundColor: "lightsalmon", width: "100%", height: "50%"
                }}>
                    <Text style={{ fontSize: 24 }}>Parking Captured By Other Driver</Text>
                    <Text style={{ fontSize: 20 }}>Automated Close Nav Mode</Text>
                </View>
            </View>


        this.msgKeepGoing =
            <View
                style={{
                    backgroundColor: "lightgreen",
                    opacity: 0.9,
                    width: "10000%",
                    height: "80%",
                    justifyContent: "center",//from up to down
                    alignItems: "center"//from left to right
                }}>
                <View style={{
                    flexDirection: "column", justifyContent: "center", alignItems: "center",
                    backgroundColor: "lightsalmon", width: "100%", height: "50%"
                }}>
                    <Text style={{ fontSize: 24 }}>Good,Keep Going....</Text>
                </View>
            </View>



        this.msgUArriveToParking =
            <View
                style={{
                    backgroundColor: "lightgreen",
                    opacity: 0.9,
                    width: "10000%",
                    height: "80%",
                    justifyContent: "center",//from up to down
                    alignItems: "center"//from left to right
                }}>
                <View style={{
                    flexDirection: "column", justifyContent: "center", alignItems: "center",
                    backgroundColor: "grey", width: "100%", height: "50%"
                }}>
                    <Text style={{ fontSize: 24 }}>You have reached the parking</Text>
                    <Text style={{ fontSize: 20 }}>Have you parked your vehicle?</Text>
                </View>

                <View
                    style={{
                        backgroundColor: "red",
                        opacity: 0.9,
                        width: "100%%",
                        height: "50%",
                        flexDirection: "row",
                        justifyContent: "space-around",//from up to down
                        alignItems: "center"//from left to right
                    }}>
                    <TouchableOpacity style={{
                        flexDirection: "column", justifyContent: "center", alignItems: "center",
                        backgroundColor: "grey", width: "45%", height: "100%"
                    }}
                        onPress={async () => {
                            this.IParked = true;
                            await this.stopNav();
                            this.setState({
                                parkingDailogMessage: this.msgEstimatedReleaseTime,
                                // statutsBarNavMode: false,
                                // statutsBarNormalMode: true,
                                // showNavParkInfo: false,
                            });
                        }}>
                        <Text style={{ fontSize: 20 }}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        flexDirection: "column", justifyContent: "center", alignItems: "center",
                        backgroundColor: "grey", width: "45%", height: "100%"
                    }}
                        onPress={() => {
                            this.setState({ parkingDailogMessage: null })
                        }}>
                        <Text style={{ fontSize: 20 }}>Not yet</Text>
                    </TouchableOpacity>
                </View>

            </View>




        this.msgUMovingAway =
            <View
                style={{
                    backgroundColor: "lightgreen",
                    opacity: 0.9,
                    width: "10000%",
                    height: "80%",
                    justifyContent: "center",//from up to down
                    alignItems: "center"//from left to right
                }}>
                <View style={{
                    flexDirection: "column", justifyContent: "center", alignItems: "center",
                    backgroundColor: "lightsalmon", width: "100%", height: "50%"
                }}>
                    <Text style={{ fontSize: 24 }}>opps....your moving away from parking !!!</Text>
                </View>
            </View>



        this.msgEstimatedReleaseTime =
            <View
                style={{
                    backgroundColor: "lightgreen",
                    opacity: 0.9,
                    width: "10000%",
                    height: "80%",
                    justifyContent: "center",//from up to down
                    alignItems: "center"//from left to right
                }}>
                <View style={{
                    flexDirection: "column", justifyContent: "center", alignItems: "center",
                    backgroundColor: "lightsalmon", width: "100%", height: "50%"
                }}>
                    <Text style={{ fontSize: 24 }}>Estimated time to release parking</Text>
                </View>

                <View
                    style={{
                        backgroundColor: "red",
                        opacity: 0.9,
                        width: "100%%",
                        height: "50%",
                        flexDirection: "row",
                        justifyContent: "space-around",//from up to down
                        alignItems: "center"//from left to right
                    }}>
                    <View style={{
                        backgroundColor: "honeydew",
                        width: "100%", height: "50%",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <Button title={"10 min"} onPress={async () => {
                            this.releaseStatus = "10";
                            this.updatePark = true;
                            console.log("onPress:", this.updatePark);
                            await this.MarkPark();
                            this.getFreeParks();
                            this.setState({
                                parkingDailogMessage: this.msgParkingUpdated,
                                statutsBarNavMode: false,
                                statutsBarNormalMode: true,
                                showNavParkInfo: false,
                            }
                                , () => {
                                    setTimeout(() => { this.setState({ parkingDailogMessage: null }); }, 4000);
                                });
                        }}></Button>
                        <Button title={"20 min"} onPress={() => { this.releaseStatus = "20" }}></Button>
                        <Button title={"30 min"} onPress={() => { this.releaseStatus = "30" }}></Button>
                        <Button title={"60 min"} onPress={() => { this.releaseStatus = "60" }}></Button>
                        <Button title={"60+ min"} onPress={() => { }}></Button>
                    </View>
                </View>

            </View>


        this.msgParkingUpdated =
            <View
                style={{
                    backgroundColor: "lightgreen",
                    opacity: 0.9,
                    width: "10000%",
                    height: "80%",
                    justifyContent: "center",//from up to down
                    alignItems: "center"//from left to right
                }}>
                <View style={{
                    flexDirection: "column", justifyContent: "center", alignItems: "center",
                    backgroundColor: "lightsalmon", width: "100%", height: "50%"
                }}>
                    <Text style={{ fontSize: 24 }}>Done, Parking info updated</Text>
                </View>
            </View>




        this.state = {
            errorMessage: "",
            location: "",
            visible: false,//for dialog-box
            showMarkerInfo: false,
            // myLatitude: 32.050351202400414,//32.000,//32.453712169999996
            // myLongitude: 34.81814179569483,//34.000,//34.906191299999996,
            myPark: null,
            picURL: null,
            // picURL: require('../assets/no-image-icon-6.png'),
            btnFree: true,
            btnFreeColor: "dodgerblue",
            btnDisabledPark: false,
            btnDisabledParkColor: "lightgrey",
            btnParkingLot: false,
            btnParkingLotColor: "lightgrey",
            btnforVan: false,
            btnforVanColor: "lightgrey",

            btnFreeColorIcon: "lightgrey",
            btnDisabledParkColorIcon: "lightgrey",
            btnParkingLotColorIcon: this.ParkingLotIconBright,
            btnforVanColorIcon: "lightgrey",
            latZoom: 0.23591217846110268,
            lngZoom: 0.23591217846110268,
            not: null,
            token: null,
            takePicPark: "no",
            showNavParkInfo: false,
            statutsBarNormalMode: true,
            statutsBarNavMode: false,
            initialRegion: {
                latitude: 32.08690348736677,
                latitudeDelta: 0.21394020796880397,
                longitude: 34.78171203285456,
                longitudeDelta: 0.1419679820537567,
            },
            showParkingPic: false,
            showMarkParkingDailog: false,
            markPaidParking: false,
            markDisabledParking: false,
            markParkingLot: false,
            showFilterDialog: false,

            filterRadius: 200,
            filterNavigatorsCount: 3,
            filterMaxTimeFromRelease: 30,
            filterMinTimeForRelease: 0,
            filterMaxTimeForRelease: 60,
            showParkingCapturedDailog: false,
            allowBtnParkingWasCaptured: true,
            showParkingDailogMessage: true,
            parkingDailogMessage: null,

        }

    }


    //Called immediately after a component is mounted. Setting state here will trigger re-rendering. 
    componentDidMount() {
        // this.logOut();
        this.startUp();
        // this.getData();
        // this.getMyLocation();
        // this.GetToken();

        //**** CONSIDERING PUT HERE THE ASK LOCATION DOU TO SAVE TIME IN GETMYLOCATION()  **** */



        //session for push-notification
        Notifications.addListener((notication) => {
            console.log(`UserID:${this.user.UserID} -> ` + "incoming notification:", notication);

            // !!!  if not used setTimeout - fetch of getFreeParks try to run while fetch callForPush still in process !!!
            setTimeout(() => {
                this.setState({ not: <Text>{notication.data.dateFromNotification}</Text> },
                    () => {
                        if (this.mode == "search") {
                            console.log(`UserID:${this.user.UserID} -> ` + "getFreeParks FROM PUSH");
                            this.getFreeParks();
                        }
                        if (notication.data.pushReason == "parking captured") {
                            this.setState({
                                statutsBarNavMode: false,
                                statutsBarNormalMode: true,
                                showNavParkInfo: false,
                                showParkingCapturedDailog: true,
                                parkingDailogMessage: null,
                            },
                                () => {
                                    this.mode = "search";
                                    clearInterval(this.ID);
                                    clearInterval(this.ID2);
                                    this.getFreeParks();
                                }
                            );
                        }
                    });
            }, 2000);
        })

    }


    startUp = async () => { //func that combine getData and GetToken
        console.log("\nApp start");
        console.log(`\nUserID:${this.user.UserID} -> ` + "func: startUp");

        // const userTest = {
        //     Token:'testToken',
        //     UserID:'testID',
        // }
        // AsyncStorage.setItem('user', JSON.stringify(userTest));

        this.user = JSON.parse(await AsyncStorage.getItem('user')); //get user info that saves in device
        console.log("this.user = ", this.user);
        // console.log("const x = ", x);
        // this.user = x;
        // console.log("this.y = ", this.y);
        // console.log(`UserID:${this.user.UserID} -> ` + "this.user:", this.user);
        // console.log(typeof null);
        if (this.user == null) {
            console.log("getting token...");
            registerForPushNotificationsAsync()
                .then(tok => {
                    console.log("tok:", tok);
                    this.user = {
                        Token: tok
                    };
                    this.login();//send token to db to get UserID
                });
        }
        
        // console.log("end if");
        // if (this.user.Token == null || this.user.UserID == null) {
        //     console.log(`\nUserID:${this.user.UserID} -> ` + "getting token...");
        //     registerForPushNotificationsAsync()
        //         .then(tok => {
        //             this.user = {
        //                 Token: tok
        //             };
        //             console.log(`UserID:${this.user.UserID} -> ` + "tok:", tok);
        //             this.login()
        //             // .then((userIdFromDB) => {
        //             //     console.log(`UserID:${this.user.UserID} -> ` + 'userIdFromDB=', userIdFromDB);
        //             //     this.user.UserID = userIdFromDB;
        //             // });
        //         });

        // }
        // else {
        //     this.getFreeParks();
        // }
    }


    login = () => {
        console.log(`\nToken:${this.user.Token} -> ` + "***** func: login *****");
        fetch(ruppinURL + 'login', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            // body: JSON.stringify(data)
            body: JSON.stringify(this.user.token)
        })
            .then(res => {
                console.log(`Token:${this.user.Token} -> ` + 'res =', res);
                return res.json()
            })
            .then((userIdFromDB) => {
                console.log(`Token:${this.user.Token} -> ` + 'userIdFromDB =', userIdFromDB);
                this.user.UserID = userIdFromDB;
                console.log(`Token:${this.user.Token} -> ` + "**** END func: login ****");
                console.log("this.user = ", this.user);
            })
            .catch(err => {
                alert('err= ' + err);
                console.log(`Token:${this.user.Token} -> ` + "err: ", err);
            })
    }


    getData = async () => {
        //model W/O Login
        console.log(`\nUserID:${this.user.UserID} -> ` + "func: getData");
        this.user = JSON.parse(await AsyncStorage.getItem('user')); //get user info that saves in device
        console.log(`UserID:${this.user.UserID} -> ` + "AsyncStorage.getItem is done");
        console.log(`UserID:${this.user.UserID} -> ` + " >>>>>> user from AsyncStorage:", this.user);
        if (this.user == null) {//user bypass the Login
            this.props.navigation.navigate('Login');
        }
        else {
            this.getFreeParks();
        }


        //model with login
        // console.log(`\nUserID:${this.user.UserID} -> ` + "func: getData");
        // this.user = JSON.parse(await AsyncStorage.getItem('user')); //get user info that saves in device
        // console.log(`UserID:${this.user.UserID} -> ` + "AsyncStorage.getItem is done");
        // console.log(`UserID:${this.user.UserID} -> ` + " >>>>>> user from AsyncStorage:", this.user);
        // if (this.user == null) {//user bypass the Login
        //     this.props.navigation.navigate('Login');
        // }
        // else {
        //     this.getFreeParks();
        // }
    }

    GetToken = () => {//get token to user device for push notification
        console.log(`\nUserID:${this.user.UserID} -> ` + " ***** func GetToken *****");
        registerForPushNotificationsAsync()
            .then(tok => {
                this.user.token = tok;
                console.log(`UserID:${this.user.UserID} -> ` + "tok:", tok);
                this.setState({ token: tok }, () => {
                    console.log(`UserID:${this.user.UserID} -> ` + " ***** END-func GetToken *****");
                    this.sendTokenToDB();
                });

            });
    }


    sendTokenToDB = () => {
        console.log(`\nUserID:${this.user.UserID} -> ` + "***** FUNC sendTokenToDB *****");
        fetch(ruppinURL + 'token', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            // body: JSON.stringify(data)
            body: JSON.stringify({
                UserID: this.user.UserID,
                Token: this.state.token,
            })
        })
            .then(res => {
                console.log(`UserID:${this.user.UserID} -> ` + 'res=', res);
                console.log(`UserID:${this.user.UserID} -> ` + "**** END func: sendTokenToDB ****");
                return res.json()
            }, (error) => {
                console.log(`UserID:${this.user.UserID} -> ` + "err post=", error);
            })
    }

    getFreeParks = async () => {
        // getFreeParks = () => {
        // alert("getFreeParks");
        console.log(`\nUserID:${this.user.UserID} -> ` + "*** func: getFreeParks *****");
        console.log("getMyLocation From getFreeParks");
        await this.getMyLocation();

        const data = {
            UserLat: this.mylat,
            UserLon: `${this.mylng}`,
            // Radius: 5,
            // Navigators: '',
            // MinTimeForRelease: 0,
            // maxTimeFromRelease: 30,
            // MaxTimeForRelease: 60,
            Radius: this.state.filterRadius,
            MaxTimeFromRelease: this.state.filterMaxTimeFromRelease,
            MinTimeForRelease: this.state.filterMinTimeForRelease,
            MaxTimeForRelease: this.state.filterMaxTimeForRelease,
            MaxNavigators: this.state.filterNavigatorsCount,

        };

        console.log(`UserID:${this.user.UserID} -> ` + "data:", data);

        fetch(ruppinURL + 'parks', {
            // method: 'GET',
            method: 'POST',
            headers: new Headers({
                // 'Content-Type': 'application/json;',
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            body: JSON.stringify(data)
        })
            .then(res => {
                console.log(`UserID:${this.user.UserID} -> ` + 'res=', res);
                return res.json()
            })
            .then(
                (result) => {
                    console.log(`UserID:${this.user.UserID} -> ` + "result= ", result); // <<<<-------array of free parks !!!
                    let freeParksFromDB = result;
                    if (freeParksFromDB != null) {
                        this.freeParksArr = [];//clear the arr
                        this.index = 0;//clear the index

                        freeParksFromDB.map(
                            (item) => {
                                itemCoords = {
                                    latitude: parseFloat(item.parkLatitude),
                                    longitude: parseFloat(item.parkLongitude),
                                }
                                if (item.minutesFromRelease != null) {
                                    this.c = "red"
                                }
                                else if (item.minutesToRelease != null) {
                                    this.c = "blue"
                                }

                                this.freeParksArr[this.index++] = <Marker
                                    style={{ opacity: 0.9 }}
                                    pinColor={this.c}
                                    // image={require('../assets/parkIcon.png')}
                                    key={this.index - 1}//most have key,else give alerts
                                    coordinate={itemCoords}
                                    onPress={async () => {//async because the addressToPresent() below
                                        this.parkToNav = item; //if user decide to nav to that park
                                        console.log("this.parkToNav:", this.parkToNav);
                                        // console.log("item before:", item)
                                        // if (item.isFree == "true") this.isFreeColor = "lightgrey";
                                        // else this.isFreeColor = "green";
                                        // // console.log("1");
                                        // if (item.isDisabledParking == "true") this.isDisabledParkingColor = "dodgerblue";
                                        // else this.isDisabledParkingColor = "lightgrey";
                                        // // console.log("2");
                                        // if (item.ParkingLot == "true") this.ParkingLotColor = this.ParkingLotIconOriginal;
                                        // else this.ParkingLotColor = this.ParkingLotIconBright;
                                        // // console.log("3");
                                        // if (item.forVan == "true") this.forVanColor = "black"
                                        // else this.forVanColor = "lightgrey";
                                        // // console.log("4");
                                        if (item.isFree == "true") this.isFreeParking = true;
                                        else this.isFreeParking = false;
                                        // console.log("1");
                                        if (item.isDisabledParking == "true") this.isDisabledParking = true;
                                        else this.isDisabledParking = false;
                                        // console.log("2");
                                        if (item.ParkingLot == "true") this.isParkingLot = true;
                                        else this.isParkingLot = false;
                                        // console.log("3");
                                        if (item.forVan == "true") this.isVanParking = true;
                                        else this.isVanParking = false;
                                        // console.log("4");


                                        // console.log("finish if/else above");
                                        // this.setState({ showMarkerInfo: true, picURL: uploadFileRoot + item.parkIMG },()=>{console.log("item:",item)})
                                        // this.setState({ showMarkerInfo: true, picURL: { uri: uploadFileRoot +  item.parkIMG }},()=>{console.log("item:",item)})
                                        if (item.parkIMG == null || item.parkIMG == undefined || item.parkIMG == "null" || item.parkIMG == "")
                                            this.isPicToPark = false;
                                        // this.parkPicURL = require('../assets/no-image-icon-6.png');
                                        else {
                                            this.isPicToPark = true;
                                            this.parkPicURL = { uri: uploadFileRoot + item.parkIMG };
                                        }

                                        this.parkDate = item.date;
                                        this.dateToPresent();//Prepare the date info to show in parking info dailog
                                        this.markerCoords = {
                                            latitude: parseFloat(item.parkLatitude),
                                            longitude: parseFloat(item.parkLongitude),
                                        };
                                        await this.addressToPresent();//Prepare the address info to show in parking info dailog
                                        //^await so the setState below will start after addressToPresent() changes take effects

                                        this.setState({ showMarkerInfo: true, showFilterDialog: false });
                                        // this.setState({ showMarkerInfo: true }, () => { console.log("index:",this.freeParksArr[this.index-1].key)});
                                    }}>
                                </Marker>;
                            }
                        );
                        this.setState({});//call for render so changes take efect
                        // console.log("this.freeParksArr:", this.freeParksArr);
                        console.log(`UserID:${this.user.UserID} -> ` + "*** END func: getFreeParks *****");
                        // console.log(`UserID:${this.user.UserID} -> ` + "FROM getFreeParks ==> getMyLocation");
                        // this.getMyLocation();
                    }
                    else {
                        this.freeParksArr = [];//clear the free parks array
                        this.setState({});//call for render so changes take efect
                        console.log(`UserID:${this.user.UserID} -> ` + "*** END func: getFreeParks *****");
                    }

                },
                (error) => {
                    console.log(`UserID:${this.user.UserID} -> ` + "err post=", error);
                });

    }


    firstCheckForDist = () => {
        //this.dist = this.getDistanceFromLatLonInKm(this.mylat, this.mylng, this.parkToNav.parkLatitude, this.parkToNav.parkLongitude);
        //this.dist = 0.090;
        console.log(`UserID:${this.user.UserID} -> ` + `>>> 1st check to distance from park: ${(this.dist * 1000).toFixed(2)} <<<`);
        // console.log("this.dist:", this.dist);
        this.seconds = 0; //for the first time // OR in constructor

        if (this.dist <= 0.08 && this.dist > 0.030) {//You're 20 meters away from parking
            console.log("You are closing to the parking....");
            console.log("this.countMsgYouRCloseToParking:", this.countMsgYouRCloseToParking);
            if (this.countMsgYouRCloseToParking % 2 == 0 || this.countMsgYouRCloseToParking == 0) {//show this dialog on/off interval except the first time
                this.setState({ showParkingDailogMessage: true, parkingDailogMessage: this.msgYouRCloseToParking });
            }
            this.countMsgYouRCloseToParking = this.countMsgYouRCloseToParking + 1
            //this.setState({ showParkingDailogMessage: true, parkingDailogMessage: this.msgYouRCloseToParking }

            // ,() => {
            //     // this.dist = 100;//none specific great number for reset
            //     this.preVdist = this.dist;
            //     this.ID2 = setInterval(this.secondCheckForDist, 1000);
            // }
            //);

        }
        //jump to secondCheckForDist W/O the "U R closing" dialog
        else if (this.dist <= 0.030) {
            //this.dist = 100;//none specific great number for reset
            this.preVdist = this.dist;
            this.ID2 = setInterval(this.secondCheckForDist, 1000);
        }
    }


    secondCheckForDist = () => {
        // this.preVdist = this.dist;
        //this.dist = this.getDistanceFromLatLonInKm(this.mylat, this.mylng, this.parkToNav.parkLatitude, this.parkToNav.parkLongitude);
        //this.dist = 0.00
        console.log(`UserID:${this.user.UserID} -> ` + `>>> FINAL check to distance from park: ${(this.dist * 1000).toFixed(2)} <<<`);
        // console.log(">>> check if user finally park the car");
        // console.log("this.dist:", this.dist);
        console.log("~ ~ ~ ~ this.seconds:", this.seconds);

        if (this.dist <= 0.030) {//You're parking (5 meters away)
            console.log("~ ~ ~ ~ You arrive to the park, stay here for few seconds...");
            clearInterval(this.ID);
            this.seconds = this.seconds + 1;

            if (this.seconds >= 10 && this.seconds % 10 == 0) {
                // console.log("~ ~ ~ ~ Navigation-Complete ~ ~ ~ ~");
                // this.setState({ parkingDailogMessage: "Navigation-Complete" });

                this.setState({ parkingDailogMessage: this.msgUArriveToParking });
                // clearInterval(this.ID2);
                // clearInterval(this.ID);
                //this.stopNav();
            }
        }
        else {//You were within the closer radius but then you go out
            console.log("opps....your moving away from parking !!!");
            this.setState({ parkingDailogMessage: this.msgUMovingAway }
                , () => {
                    setTimeout(() => { this.setState({ parkingDailogMessage: null }) }, 6000);
                }
            );
            this.seconds = 0;
            this.countMsgYouRCloseToParking = 0;
            clearInterval(this.ID2);
            clearInterval(this.ID);
            this.ID = setInterval(this.firstCheckForDist, 12000);
        }


        // if (this.dist <= 0.030) {//You're parking (5 meters away)
        //     console.log("~ ~ ~ ~ You arrive to the park, stay here for few seconds...");
        //     clearInterval(this.ID);
        //     this.seconds = this.seconds + 1;
        //     if (this.seconds >= 10) {
        //         // console.log("~ ~ ~ ~ Navigation-Complete ~ ~ ~ ~");
        //         // this.setState({ parkingDailogMessage: "Navigation-Complete" });

        //         this.setState({ parkingDailogMessage: this.msgUArriveToParking });
        //         // clearInterval(this.ID2);
        //         // clearInterval(this.ID);
        //         //this.stopNav();
        //     }
        // }
        // else if (this.dist > this.preVdist && this.dist > 0.030) {//You were within the closer radius but then you go out
        //     console.log("opps....your moving away from parking !!!");
        //     this.setState({ parkingDailogMessage: this.msgUMovingAway }
        //         , () => {
        //             setTimeout(() => { this.setState({ parkingDailogMessage: null }) }, 6000);
        //         }
        //     )
        //     clearInterval(this.ID2);
        //     clearInterval(this.ID);
        //     this.ID = setInterval(this.firstCheckForDist, 12000);
        // }
        // else {//you are not enter to the closer radius,probably you stack in the middle of the two radiuses
        //     clearInterval(this.ID2);
        //     //these two steps need if you be in the if (this.dist <= 0.030) before
        //     clearInterval(this.ID);
        //     this.ID = setInterval(this.firstCheckForDist, 12000);
        // }


    }





    navToPark = () => {
        console.log(`\n\n\nUserID:${this.user.UserID} -> ` + "**** func: navToPark ****");
        this.mode = "navigation";
        this.freeParksArr = [];//clear the free parks array
        itemCoords = {
            latitude: parseFloat(this.parkToNav.parkLatitude),
            longitude: parseFloat(this.parkToNav.parkLongitude),
        }
        this.freeParksArr[0] = <Marker
            image={require('../assets/finalLocationIcon.png')}
            // key={0}// DO-NOT give key - it cause the marker finallocation to scale to the location icon
            coordinate={itemCoords}
            onPress={() => {
                // console.log("item before:", this.parkToNav)
                if (this.parkToNav.isFree == "true") this.isFreeColor = "lightgrey";
                else this.isFreeColor = "green";
                // console.log("1");
                if (this.parkToNav.isDisabledParking == "true") this.isDisabledParkingColor = "dodgerblue";
                else this.isDisabledParkingColor = "lightgrey";
                // console.log("2");
                if (this.parkToNav.ParkingLot == "true") this.ParkingLotColor = this.ParkingLotIconOriginal;
                else this.ParkingLotColor = this.ParkingLotIconBright;
                // console.log("3");
                if (this.parkToNav.forVan == "true") this.forVanColor = "black"
                else this.forVanColor = "lightgrey";
                // console.log("4");
                this.parkDate = this.parkToNav.date;
                // console.log("finish if/else above");
                if (this.parkToNav.parkIMG == null || this.parkToNav.parkIMG == undefined || this.parkToNav.parkIMG == "null")
                    this.parkPicURL = require('../assets/no-image-icon-6.png');
                else this.parkPicURL = { uri: uploadFileRoot + this.parkToNav.parkIMG };
                this.setState({ showNavParkInfo: true });
            }}>
        </Marker>;

        //need to do after fetch respond is ok
        // this.setState({
        //     showMarkerInfo: false,
        //     statutsBarNavMode: true,
        //     statutsBarNormalMode: false
        // });


        fetch(ruppinURL + 'nav', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            body: JSON.stringify(
                {
                    // userID: this.user.UserID,
                    // ParkLatitude: this.parkToNav.parkLatitude,
                    // ParkLongitude: this.parkToNav.parkLongitude,
                    // onNav: 'true',
                    userID: this.parkToNav.UserID, //the user that mark the parking
                    ParkLatitude: this.parkToNav.parkLatitude,
                    ParkLongitude: this.parkToNav.parkLongitude,
                    UserNavigatorID: this.user.UserID,
                    StopNav: 'false',
                    UserNavigatorToken: this.user.token,
                })
        })
            .then(res => {
                console.log(`UserID:${this.user.UserID} -> ` + 'nav res=', res);
                if (res.status == 200) {
                    this.setState({
                        showMarkerInfo: false,
                        statutsBarNavMode: true,
                        statutsBarNormalMode: false
                    });
                }

                return res.json()
            }, (error) => {
                console.log(`UserID:${this.user.UserID} -> ` + "err post=", error);
            })

        // console.log(`UserID:${this.user.UserID} -> ` + "**** END func: navToPark ****");

        // const ID = setInterval(
        this.ID = setInterval(
            this.firstCheckForDist, 12000);//half-minute






        // // const ID = setInterval(
        // this.ID = setInterval(
        //     () => {
        //         this.dist = this.getDistanceFromLatLonInKm(this.mylat, this.mylng, this.parkToNav.parkLatitude, this.parkToNav.parkLongitude);
        //         console.log(`UserID:${this.user.UserID} -> ` + ">>> check user distance from park <<<");
        //         console.log("this.dist:", this.dist);
        //         this.seconds = 0;
        //         if (this.dist <= 0.02) {//You're 20 meters away from parking
        //             console.log("You are closing to the park....");
        //             this.setState({},()=>{});
        //             const ID2 = setInterval(
        //                 () => {
        //                     this.dist = this.getDistanceFromLatLonInKm(this.mylat, this.mylng, this.parkToNav.parkLatitude, this.parkToNav.parkLongitude);
        //                     console.log(">>> check if user finally park the car");
        //                     console.log("this.dist:", this.dist);
        //                     console.log("this.seconds:", this.seconds);
        //                     if (this.dist <= 0.003) {//You're parking (3 meters away)
        //                         console.log("You arrive to the park, stay here for few seconds...");
        //                         this.seconds = this.seconds + 1;
        //                         if (this.seconds >= 10) {
        //                             console.log("Navigation-Complete");
        //                             clearInterval(ID2);
        //                             clearInterval(this.ID);
        //                             this.stopNav();
        //                         }
        //                     }
        //                     else if (this.dist > 0.003) {
        //                         console.log("opps....your moving away from parking !!! ");
        //                         clearInterval(ID2);
        //                     }
        //                 }, 1000);//second

        //             // console.log("STOP");
        //             // clearInterval(this.ID);

        //         }

        //     }, 12000);//half-minute








        console.log(`UserID:${this.user.UserID} -> ` + "**** END func: navToPark ****");
    }


    getMyLocation = async () => {

        console.log(`\nUserID:${this.user.UserID} -> ` + "**** func:getMyLocation ****");
        const { status } = await Permissions.askAsync(Permissions.LOCATION); //ask the device for use sensor Location
        if (status === 'granted') {
            let location = await Location.getCurrentPositionAsync({});//ask device for user location
            // console.log(`UserID:${this.user.UserID} -> ` + "location:", location);
            // if (this.locBtn) {
            //     console.log("if");
            this.mylat = location.coords.latitude;
            this.mylng = location.coords.longitude;
            this.map.animateToRegion({
                latitude: this.mylat,
                longitude: this.mylng,
                latitudeDelta: this.latD,
                longitudeDelta: this.lngD,
            }, 0);
            // }
            //*****
            //set the location coords in this.user obj for sending to camera
            // this.user.userLatitude = location.coords.latitude;
            // this.user.userLongitude = location.coords.latitude;
            //*****

            // this.lat = location.coords.latitude;
            // this.lng = location.coords.longitude;
            // this.mylat = location.coords.latitude;
            // this.mylng = location.coords.longitude;
            //*****
            // this.setState({ //for map region upadte
            //     myLatitude: location.coords.latitude,
            //     myLongitude: location.coords.longitude,
            //     // region: {
            //     //     latitude: location.coords.latitude,
            //     //     longitude: location.coords.longitude,
            //     //     latitudeDelta: 0.005,
            //     //     longitudeDelta: 0.005,
            //     // },
            // }, () => {
            //     console.log(`UserID:${this.user.UserID} -> ` + "** this.mylat", this.mylat);
            //     console.log(`UserID:${this.user.UserID} -> ` + "** this.mylng", this.mylng);
            //     // this.user.userLatitude = this.state.myLatitude;
            //     // this.user.userLongitude = this.state.myLongitude;
            //     console.log(`UserID:${this.user.UserID} -> ` + "**** END func:getMyLocation ****\n\n");
            // })
            console.log(`UserID:${this.user.UserID} -> ` + "** this.mylat", this.mylat);
            console.log(`UserID:${this.user.UserID} -> ` + "** this.mylng", this.mylng);
            console.log(`UserID:${this.user.UserID} -> ` + "**** END func:getMyLocation ****\n\n");
        } else {
            console.log(`UserID:${this.user.UserID} -> ` + "Location permission not granted");
            alert('Location permission not granted');
        }

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
                // console.log(`UserID:${this.user.UserID} -> ` + 'push res=', res);
                console.log(`UserID:${this.user.UserID} -> ` + "**** END func: callForPush ****");
                // return res.json()
            }, (error) => {
                console.log(`UserID:${this.user.UserID} -> ` + "err post=", error);
            })
    }



    MarkPark = async () => {

        console.log(`\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nUserID:${this.user.UserID} -> ` + "**** func: MarkPark ****");
        // console.log(`\nUserID:${this.user.UserID} -> ` + "FROM MarkPark ==> getMyLocation");
        // this.getMyLocation();

        // let { status } = await Permissions.askAsync(Permissions.LOCATION);
        // if (status !== 'granted') {
        //     this.setState({ errorMessage: 'Permission to access location was denied', });
        // }

        // let location = await Location.getCurrentPositionAsync({});
        // // this.setState({ location }, () => { console.log(this.state.location.coords.longitude) });
        // // console.log("location:",location);

        // this.parkLatLng = {
        //     latitude: location.coords.latitude,
        //     longitude: location.coords.longitude,
        // }
        // console.log("this.parkLatLng:",this.parkLatLng);
        console.log("getMyLocation From MarkPark");
        await this.getMyLocation();
        console.log("after getMyLocation:", this.updatePark);
        var dataOfPark = {
            // UserID: this.user.UserID,
            // ParkLatitude: this.mylat,
            // ParkLongitude: '2',
            // onNav: 'false',
            // IsFree: 'true',
            // IsDisabledParking: 'true',
            // ParkingLot: 'true',
            // ReleaseStatus: 50

            UserID: this.user.UserID,//the user that mark the parking
            ParkLatitude: this.mylat,//this.state.myLatitude,
            ParkLongitude: `${this.mylng}`,//`${this.state.myLongitude}`,
            onNav: "false",
            IsFree: !this.state.markPaidParking,//this.state.btnFree,
            IsDisabledParking: this.state.markDisabledParking,//this.state.btnDisabledPark,
            ParkingLot: this.state.markParkingLot,//this.state.btnParkingLot,
            // ForVan: this.state.btnforVan,
            ReleaseStatus: `${this.releaseStatus}`
        };

        if (this.updatePark == true) {
            console.log("IF:", this.updatePark);
            dataOfPark = {
                UserID: this.user.UserID,//the user that mark the parking
                ParkLatitude: this.parkToNav.parkLatitude,
                ParkLongitude: this.parkToNav.parkLongitude,
                IsFree: this.parkToNav.isFree,
                IsDisabledParking: this.parkToNav.isDisabledParking,
                ParkingLot: this.parkToNav.ParkingLot,
                ReleaseStatus: `${this.releaseStatus}`,
                parkIMG: this.parkToNav.parkIMG,
            };
            this.updatePark = false;
        }

        console.log(`UserID:${this.user.UserID} -> ` + "dataOfPark:", dataOfPark);

        fetch(ruppinURL + 'park', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            body: JSON.stringify(dataOfPark)
        })
            .then(res => {
                console.log(`UserID:${this.user.UserID} -> ` + 'park res=', res);
                // this.setState({ visible: false, });
                // this.callForPush();
                if (this.state.takePicPark == "yes") {
                    this.setState({ showMarkParkingDailog: false, takePicPark: "no" },
                        () => {
                            // this.props.navigation.push('Camera', { 'userInfo': this.user });
                            this.props.navigation.push('Camera', { 'userInfo': this.user, 'parkInfo': dataOfPark });
                        });
                }
                else {
                    this.setState({ showMarkParkingDailog: false, });
                    // this.callForPush();
                }


                console.log(`UserID:${this.user.UserID} -> ` + "**** END func: MarkPark ****");
                // return res.json() //after update to SDK 35 - get Error
            }, (error) => {
                console.log(`UserID:${this.user.UserID} -> ` + "err post=", error);
            })
    }


    logOut = async () => {
        console.log(`\nUserID:${this.user.UserID} -> ` + "*** func: logOut ***");
        await AsyncStorage.removeItem("user");
        console.log(`UserID:${this.user.UserID} -> ` + "removeItem is done !");
        // this.props.navigation.push('Login');
    }


    stopNav = async () => {
        console.log(`\n\n\nUserID:${this.user.UserID} -> ` + "**** func: stopNav ****");
        // this.getFreeParks();
        clearInterval(this.ID);
        clearInterval(this.ID2);
        this.mode = "search";
        //need to do after fetch respone is ok
        // this.setState({
        //     statutsBarNavMode: false,
        //     statutsBarNormalMode: true,
        //     showNavParkInfo: false,
        // });

        fetch(ruppinURL + 'nav', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            body: JSON.stringify(
                {
                    userID: this.parkToNav.UserID,//the user that mark the park
                    ParkLatitude: this.parkToNav.parkLatitude,
                    ParkLongitude: this.parkToNav.parkLongitude,
                    UserNavigatorID: this.user.UserID,
                    StopNav: 'true',
                    IParked: this.IParked,
                    UserNavigatorToken: this.user.token,
                    CapturedByOther: this.CapturedByOther,
                })
        })
            .then(res => {
                console.log(`UserID:${this.user.UserID} -> ` + 'nav res=', res);
                if (res.status == 200) {
                    //if allow when IParked is true - the user can press on other
                    //marker of parking and so this.parkToNav would change and
                    //the update values for markPark will be differend
                    //so, getFreeParks should run only after user update estimated time
                    //to realse it parking.
                    if (this.IParked != true) {
                        this.getFreeParks();
                        this.setState({
                            statutsBarNavMode: false,
                            statutsBarNormalMode: true,
                            showNavParkInfo: false,
                        });
                    }



                    // this.setState({
                    //     statutsBarNavMode: false,
                    //     statutsBarNormalMode: true,
                    //     showNavParkInfo: false,
                    // },
                    //     () => {
                    //         //if allow when IParked is true - the user can press on other
                    //         //marker of parking and so this.parkToNav would change and
                    //         //the update values for markPark will be differend
                    //         //so, getFreeParks should run only after user update estimated time
                    //         //to realse it parking.
                    //         if (this.IParked != true) {
                    //             this.getFreeParks();
                    //         }

                    //     }
                    // );
                }
                this.IParked = false;
                return res.json()
            }, (error) => {
                console.log(`UserID:${this.user.UserID} -> ` + "err post=", error);
            })

        console.log(`UserID:${this.user.UserID} -> ` + "**** END func: stopNav ****");
    }



    pressFunc = () => {
        //for OPT 1
        // console.log("\n- - pressFunc - -");
        // this.changeFromSetState = true;
        // this.FirstZoom = true;
        // console.log("START sst1");
        // this.setState({}, () => { 
        //     this.firstSstFinish = true;
        //     console.log("sst1 finish");
        // });
        // // this.firstSstFinish = false;
        // // console.log("this.firstSstFinish:",this.firstSstFinish);
        // // this.lat = parseFloat(this.lat) - parseFloat(this.latBefore);
        // // console.log("done parseFloat");
        // // // this.lng = this.lng - this.lngBefore;
        // // // this.latD = this.latD - this.latDBefore;
        // // // this.lngD = this.lngD - this.lngDBefore;

        // // 2nd call for render so region jump down to the original region
        // setTimeout(() => {
        //     console.log("START sst2");
        //     this.setState({}, () => { console.log("sst2 finish") });
        // }, 300);
        // // console.log("START sst2");
        // // this.setState({}, () => { console.log("sst2 finish") });
        // // this.map.animateToRegion(this.region, 0.1);
        // console.log("- -END pressFunc - -\n");

        //for OPT 2
        console.log("\n- - pressFunc - -");
        this.changeFromSetState = true;
        this.FirstZoom = true;
        console.log("START sst1");
        this.setState({}, () => {
            console.log("sst1 finish")
            this.firstSstFinish = true;
            console.log("- -END pressFunc - -\n");
        });


        // // this.lng = this.lng - this.lngBefore;
        // // this.latD = this.latD - this.latDBefore;
        // // this.lngD = this.lngD - this.lngDBefore;
        // setTimeout(() => {
        //     console.log("START sst2");
        //     this.setState({}, () => { console.log("sst2 finish") });
        // }, 300);
        // console.log("START sst2");
        // this.setState({}, () => { console.log("sst2 finish") });
        // this.map.animateToRegion(this.region, 0.1);






    }



    getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = this.deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    deg2rad = (deg) => {
        return deg * (Math.PI / 180)
    }


    dateToPresent = () => {

        // var str = "Sat Jan 04 2020 19:20:40 GMT+0200 (IST)";
        // str = Date.parse(str);
        // var d = new Date(str);


        // var fullDate = new Date(str);
        // var date = fullDate.getDate(); //Current Date
        // var month = fullDate.getMonth() + 1; //Current Month
        // var year = fullDate.getFullYear(); //Current Year
        // var hours = fullDate.getHours(); //Current Hours
        // var min = fullDate.getMinutes(); //Current Minutes
        // var sec = fullDate.getSeconds(); //Current Seconds
        // if (date < 10) date = "0" + date;
        // if (month < 10) month = "0" + month;
        // if (hours < 10) hours = "0" + hours;
        // if (min < 10) min = "0" + min;
        // if (sec < 10) sec = "0" + sec;

        // console.log(`${date}/${month}/${year} ${hours}:${min}:${sec}`);
        // // console.log(d);

        var fullDate = new Date(this.parkDate);
        var date = fullDate.getDate(); //Current Date
        var month = fullDate.getMonth() + 1; //Current Month
        var year = fullDate.getFullYear(); //Current Year
        var hours = fullDate.getHours(); //Current Hours
        var min = fullDate.getMinutes(); //Current Minutes
        var sec = fullDate.getSeconds(); //Current Seconds
        if (date < 10) date = "0" + date;
        if (month < 10) month = "0" + month;
        if (hours < 10) hours = "0" + hours;
        if (min < 10) min = "0" + min;
        if (sec < 10) sec = "0" + sec;

        // console.log(`${date}/${month}/${year} ${hours}:${min}:${sec}`);
        this.parkDate = `${date}/${month}/${year} ${hours}:${min}:${sec}`;
    }


    addressToPresent = async () => {

        // const { status } = await Permissions.askAsync(Permissions.LOCATION); //ask the device for use sensor Location
        // if (status === 'granted') {
        //     let location = await Location.reverseGeocodeAsync(this.markerCoords);
        //     console.log(location);
        //     if(location.name == null) this.markerStreet = "";
        //     else this.markerStreet = location.name;
        //     if(location.city == null) this.markerCity = "";
        //     else this.markerStreet = location.city;
        // }
        let location = await Location.reverseGeocodeAsync(this.markerCoords);//returns array with obj!
        console.log(location);
        if (location[0].name == null) this.markerStreet = "";
        else this.markerStreet = location[0].name;
        if (location[0].city == null) this.markerCity = "";
        else this.markerCity = location[0].city;
    }


    render() {

        return (

            // <View style={styles.container}>
            <View style={{ width: "100%", height: "100%", flexDirection: "column" }}>

                <View
                    style={{
                        position: "absolute",
                        zIndex: 1,
                        // backgroundColor: this.state.statusBarColor,
                        width: "100%",
                        height: "3%",//height: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight,
                        // opacity: 0.3,
                    }}>
                    <StatusBar barStyle="light-content"></StatusBar>
                    {/* <View
                        style={{
                            backgroundColor: "#000000",
                            opacity: 0.9,
                            height: 5,
                            width: "100%",
                        }}>
                    </View> */}
                    {this.state.statutsBarNormalMode && <LinearGradient
                        colors={['#000000', '#7d7d7d']}//#7d7d7d
                        style={{
                            width: "100%",
                            height: "100%",
                            opacity: 0.8,
                            // position: "absolute",
                            zIndex: 1,
                        }}
                        locations={[0.1, 0.9]}//locations={[0.1, 0.9]}
                    >
                    </LinearGradient>}
                    {this.state.statutsBarNavMode && <LinearGradient
                        colors={['#fd405c', '#feafbb']}//#7d7d7d
                        style={{
                            width: "100%",
                            height: "200%",
                            opacity: 0.8,
                            // position: "absolute",
                            zIndex: 1,
                            flexDirection: "row", justifyContent: "center", alignItems: "flex-end"
                        }}
                        locations={[0.1, 0.9]}//locations={[0.1, 0.9]}
                    >
                        <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>Navigate To Parking</Text>
                    </LinearGradient>}
                    {this.state.not}




                </View>



                <View
                    style={{
                        position: "absolute",
                        backgroundColor: "yellow",
                        // opacity: 0.8,
                        width: "20%",
                        width: "1%",
                        height: "100%",
                        zIndex: 1,
                        alignSelf: "flex-end",
                        // alignSelf: "center",
                        flexDirection: "column",
                        justifyContent: "flex-end",//from up to down
                        alignItems: "flex-end"//from left to right
                    }}>



                    <View
                        style={{
                            backgroundColor: "deeppink",
                            opacity: 0.9,
                            width: "100%",
                            height: "30%",
                            justifyContent: "flex-start",//from up to down
                            alignItems: "flex-end"//from left to right
                        }}>
                        {this.state.parkingDailogMessage}
                    </View>

                    {/* {this.state.showParkingDailogMessage && <View
                        style={{
                            backgroundColor: "deeppink",
                            opacity: 0.9,
                            width: "100%",
                            height: "30%",
                            justifyContent: "flex-start",//from up to down
                            alignItems: "flex-end"//from left to right
                        }}>
                        <View
                            style={{
                                backgroundColor: "lightgreen",
                                opacity: 0.9,
                                width: "10000%",
                                height: "80%",
                                justifyContent: "center",//from up to down
                                alignItems: "center"//from left to right
                            }}>
                            <Text style={{ fontSize: 30 }}>Did you enter the parking?</Text>
                            <View
                                style={{
                                    backgroundColor: "red",
                                    opacity: 0.9,
                                    width: "100%%",
                                    height: "50%",
                                    flexDirection: "row",
                                    justifyContent: "space-around",//from up to down
                                    alignItems: "center"//from left to right
                                }}>
                                <Button style={{ backgroundColor: "blue" }} title={"yes"}></Button>
                                <Button title={"not yet"}></Button>
                            </View>

                        </View>
                    </View>} */}


                    <View
                        style={{
                            backgroundColor: "cyan",//deeppink 
                            opacity: 0.9,
                            width: "100%",
                            height: "14%",
                            justifyContent: "flex-start",//from up to down
                            alignItems: "flex-end"//from left to right
                        }}>

                        <View
                            style={{
                                backgroundColor: "lightseagreen",
                                opacity: 0.9,
                                width: "10000%",
                                height: "40%",
                                flexDirection: "row",
                                justifyContent: "space-evenly",//from up to down
                                alignItems: "center"//from left to right
                            }}>
                            <Button title="5" onPress={() => { this.dist = 0.005 }}></Button>
                            <Button title="15" onPress={() => { this.dist = 0.015 }}></Button>
                            <Button title="30" onPress={() => { this.dist = 0.030 }}></Button>
                            <Button title="40" onPress={() => { this.dist = 0.040 }}></Button>
                            <Button title="50" onPress={() => { this.dist = 0.050 }}></Button>
                            <Button title="80" onPress={() => { this.dist = 0.080 }}></Button>
                            <Button title="90" onPress={() => { this.dist = 0.090 }}></Button>
                        </View>
                    </View>



                    <View
                        style={{
                            backgroundColor: "blue",
                            opacity: 0.9,
                            width: "100%",
                            height: "28%",
                            justifyContent: "flex-start",//from up to down
                            alignItems: "flex-end"//from left to right
                        }}>
                        <View
                            style={{
                                backgroundColor: "purple",
                                opacity: 0.8,
                                width: "5000%",
                                height: "12%",
                                justifyContent: "center",//from up to down
                                alignItems: "flex-end"//from left to right
                            }}></View>

                        {/* <TouchableOpacity style={{
                            // backgroundColor: "green",
                            backgroundColor: "red",
                            opacity: 0.8,
                            width: "2000%",
                            height: "33%",
                            // width: "100%",
                            // height: "100%",
                        }}
                            onPress={
                                () => {

                                    this.focusOnUser = true;
                                    this.getMyLocation();
                                }
                            }>

                        </TouchableOpacity> */}

                    </View>


                    <View
                        style={{
                            backgroundColor: "red",
                            // opacity: 0.9,
                            // width: "100%",
                            width: "2000%",
                            height: "10%",
                            justifyContent: "center",
                            alignItems: "flex-end",
                            borderRadius: 100//when you put the image
                        }}>

                        <TouchableOpacity style={{
                            // backgroundColor: "green",
                            width: "100%",
                            height: "100%",

                        }}
                            // onPress={() => { console.log("green"); this.changeFromSetState = true; this.setState({}, () => { console.log("sst finish") }); }}>
                            // onPress={() => {
                            //     console.log("green");
                            //     this.changeFromSetState = true;
                            //     this.FirstZoom = true;
                            //     this.setState({}, () => { console.log("sst1 finish") });
                            //     this.firstSstFinish = false;
                            //     // this.lat = parseFloat(this.lat) - parseFloat(this.latBefore);
                            //     // // this.lng = this.lng - this.lngBefore;
                            //     // // this.latD = this.latD - this.latDBefore;
                            //     // // this.lngD = this.lngD - this.lngDBefore;
                            //     this.setState({}, () => { console.log("sst2 finish") });
                            //     // this.map.animateToRegion(this.region, 0.1);
                            // }}>
                            onPress={() => { this.setState({ showMarkParkingDailog: true }); }}>
                            <Image
                                // source={require('../assets/zoomIconTransparentOriginal.png')}
                                source={require('../assets/markParkIcon.png')}
                                style={{
                                    // flex: 1,
                                    width: "100%",
                                    height: "100%",
                                    // opacity: 0.8,
                                }}
                                // resizeMode="cover"
                                resizeMode="contain"
                            ></Image>
                        </TouchableOpacity>

                    </View>

                    <View
                        style={{
                            // backgroundColor: "red",
                            // opacity: 0.9,
                            // width: "100%",
                            width: "2000%",
                            height: "12%",
                            justifyContent: "center",
                            alignItems: "flex-end",
                            borderRadius: 100//when you put the image
                        }}>

                        <TouchableOpacity style={{
                            // backgroundColor: "white",
                            width: "100%",
                            height: "100%",
                        }}
                            onPress={
                                () => {
                                    this.focusOnUser = true;
                                    this.getMyLocation();
                                }
                            }>
                            <Image
                                // source={require('../assets/zoomIconTransparentOriginal.png')}
                                source={require('../assets/locBtn.png')}
                                style={{
                                    // flex: 1,
                                    width: "100%",
                                    height: "100%",
                                    // opacity: 0.8,
                                }}
                                // resizeMode="cover"
                                resizeMode="contain"
                            ></Image>
                        </TouchableOpacity>

                    </View>


                    {this.state.showMarkerInfo && <View
                        style={{
                            backgroundColor: "purple",
                            // opacity: 0.9,
                            width: "10000%",
                            height: "1%",
                            justifyContent: "center",//from up to down
                            alignItems: "flex-end"//from left to right
                        }}>
                        <View
                            style={{
                                backgroundColor: "white",
                                // opacity: 0.6,
                                width: "100%",
                                height: "11000%",
                                borderTopRightRadius: 20,
                                borderTopLeftRadius: 20,
                                flexDirection: "column",
                                alignItems: "center",
                                shadowOffset: { width: 1, height: 1 },
                                shadowColor: "black",
                                shadowOpacity: 0.7,
                                shadowRadius: "10%"
                            }}
                        >
                            <View style={{
                                // backgroundColor: "green",
                                width: "100%", height: "5%",
                                // opacity: 0.3,
                                flexDirection: "row",
                                justifyContent: "space-between",//from left to right
                                alignItems: "flex-end",//from down to up,
                                // shadowOffset: { width: 10, height: 10 },
                                // shadowColor: "black",
                                // shadowOpacity: 1,
                                // shadowRadius: 10
                            }}>
                                <View style={{
                                    // backgroundColor: "yellow",
                                    // width: "23%",
                                    width: "30%",
                                    height: "100%",
                                    justifyContent: "flex-end",
                                    alignItems: "flex-end"
                                }}>
                                    <View style={{
                                        // backgroundColor: "pink",
                                        width: "90%",
                                        height: "300%",
                                        alignItems: "flex-end",

                                    }}>
                                        {this.isPicToPark && <View style={{
                                            backgroundColor: "white",
                                            width: "100%",
                                            height: "55%",
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}>
                                            <TouchableOpacity style={{
                                                // backgroundColor: "red",
                                                width: "90%",
                                                height: "90%",
                                            }}
                                                onPress={() => { this.setState({ showParkingPic: true }); }}
                                            >
                                                <Image
                                                    source={this.parkPicURL}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                    }}
                                                    resizeMode="cover"
                                                ></Image>
                                            </TouchableOpacity>
                                        </View>}
                                    </View>
                                </View>
                                <View style={{
                                    // backgroundColor: "red",
                                    width: "23%",
                                    height: "230%",
                                    borderRadius: 100,
                                    shadowOffset: { width: 2, height: 2 },
                                    shadowColor: "black",
                                    shadowOpacity: 1,
                                    shadowRadius: "10%"
                                }}>
                                    <Image
                                        source={require('../assets/parkInfo.png')}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            // shadowOffset: { width: 1, height: 1 },
                                            // shadowColor: "black",
                                            // shadowOpacity: 1
                                        }}
                                        resizeMode="contain"
                                    ></Image>
                                </View>
                                <View style={{
                                    // backgroundColor: "yellow",
                                    // width: "23%",
                                    width: "30%",
                                    height: "100%",
                                    justifyContent: "flex-end",//from down to up
                                    alignItems: "flex-end"//from left to right
                                }}>
                                    <View style={{
                                        // backgroundColor: "pink",
                                        width: "1%",
                                        height: "700%",
                                        justifyContent: "flex-start",//from down to up
                                        alignItems: "flex-end"//from left to right
                                    }}>
                                        <View style={{
                                            // backgroundColor: "red",
                                            // width: "8000%",
                                            width: "6000%",
                                            height: "20%",
                                            alignItems: "center",
                                        }}>
                                            <TouchableOpacity style={{
                                                // backgroundColor: "green",
                                                width: 60,
                                                height: 60,
                                                opacity: 0.9,
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}
                                                onPress={() => { this.setState({ showMarkerInfo: false }) }}
                                            >
                                                <AntDesign name="closecircle" size={60} color="grey"></AntDesign>
                                            </TouchableOpacity>
                                        </View>
                                    </View>


                                </View>

                            </View>
                            <View style={{
                                backgroundColor: "#f1f9fc",//pink
                                width: "90%",
                                height: "15%",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                borderBottomColor: "grey",//red
                                borderBottomWidth: 3,
                                borderStyle: "solid",
                                borderRadius: 10,
                                margin: "2%"
                            }}>
                                <Text
                                    style={{ marginTop: "5%", color: "#8d6247", fontSize: 20 }}>
                                    {this.markerStreet}
                                </Text>
                                <Text
                                    style={{ color: "#8d6247", fontSize: 16 }}>
                                    {this.markerCity}
                                </Text>
                                <Text
                                    style={{ marginTop: "10%", color: "#8d6247", fontSize: 16 }}>
                                    {this.parkDate}
                                </Text>
                            </View>
                            <View style={{
                                backgroundColor: "#f1f9fc",//#d3eebf
                                width: "90%",
                                height: "18%",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-around",
                                borderBottomColor: "grey",//red
                                borderBottomWidth: 3,
                                borderStyle: "solid",
                                borderRadius: 10
                            }}>
                                {this.isFreeParking && <Image
                                    source={require('../assets/freeParking.png')}
                                    style={{
                                        width: "90%",
                                        height: "90%",
                                        // shadowOffset: { width: 1, height: 1 },
                                        // shadowColor: "black",
                                        // shadowOpacity: 1
                                    }}
                                    resizeMode="contain"
                                ></Image>}
                                {!this.isFreeParking && <Image
                                    source={require('../assets/paidParking.png')}
                                    style={{
                                        width: "90%",
                                        height: "90%",
                                        // shadowOffset: { width: 1, height: 1 },
                                        // shadowColor: "black",
                                        // shadowOpacity: 1
                                    }}
                                    resizeMode="contain"
                                ></Image>}
                                {this.isParkingLot && <Image
                                    source={require('../assets/parkingLotHeb.png')}
                                    style={{
                                        width: "90%",
                                        height: "90%",
                                        // shadowOffset: { width: 1, height: 1 },
                                        // shadowColor: "black",
                                        // shadowOpacity: 1
                                    }}
                                    resizeMode="contain"
                                ></Image>}
                                {this.isDisabledParking && <Image
                                    source={require('../assets/disabledParking.png')}
                                    style={{
                                        width: "90%",
                                        height: "90%",
                                        // shadowOffset: { width: 1, height: 1 },
                                        // shadowColor: "black",
                                        // shadowOpacity: 1
                                    }}
                                    resizeMode="contain"
                                ></Image>}

                            </View>
                            <View style={{
                                // backgroundColor: "blue",
                                width: "100%",
                                height: "11%",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-evenly"
                            }}>
                                <TouchableOpacity style={{
                                    backgroundColor: "#f0f0f0",
                                    width: "30%",
                                    height: "60%",
                                    borderRadius: 20,
                                    borderWidth: "1%",
                                    borderColor: "#c0c0c0",
                                    borderStyle: "solid",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    <Image
                                        source={require('../assets/wazeLogo2.png')}
                                        style={{
                                            width: "90%",
                                            height: "100%",
                                            // shadowOffset: { width: 1, height: 1 },
                                            // shadowColor: "black",
                                            // shadowOpacity: 1
                                        }}
                                        resizeMode="contain"
                                    ></Image>
                                    {/* <Text style={{ color: "BLACK", fontSize: 20, marginRight: "5%" }}>waze</Text> */}
                                </TouchableOpacity>

                                <TouchableOpacity style={{
                                    backgroundColor: "#13b8e8",
                                    width: "60%",
                                    height: "60%",
                                    borderRadius: 20,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                    onPress={this.navToPark}
                                >
                                    <Text style={{ color: "white", fontSize: 20, marginRight: "5%" }}>GO</Text>
                                    <Ionicons name="ios-play" size={30} color={"#787878"}></Ionicons>
                                </TouchableOpacity>

                            </View>

                        </View>
                    </View>
                    }


                    {this.state.showFilterDialog && <View
                        style={{
                            backgroundColor: "purple",
                            // opacity: 0.9,
                            width: "10000%",
                            height: "1%",
                            justifyContent: "center",//from up to down
                            alignItems: "flex-end"//from left to right
                        }}>
                        <View
                            style={{
                                backgroundColor: "white",
                                // opacity: 0.6,
                                width: "100%",
                                height: "11000%",
                                borderTopRightRadius: 20,
                                borderTopLeftRadius: 20,
                                flexDirection: "column",
                                alignItems: "center",
                                shadowOffset: { width: 1, height: 1 },
                                shadowColor: "black",
                                shadowOpacity: 0.7,
                                shadowRadius: "10%"
                            }}
                        >
                            <View style={{
                                backgroundColor: "cornsilk",
                                width: "100%", height: "5%",
                                // opacity: 0.3,
                                flexDirection: "row",
                                justifyContent: "center",//from left to right
                                alignItems: "flex-end",//from down to up,
                                // shadowOffset: { width: 10, height: 10 },
                                // shadowColor: "black",
                                // shadowOpacity: 1,
                                // shadowRadius: 10
                            }}>
                                <Text
                                    style={{ color: "#8d6247", fontSize: 20 }}>
                                    Parking filter
                                </Text>
                            </View>

                            <View style={{
                                backgroundColor: "pink",//
                                width: "90%",
                                height: "15%",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-evenly",
                                borderBottomColor: "grey",//red
                                borderBottomWidth: 3,
                                borderStyle: "solid",
                                borderRadius: 10,
                            }}>
                                <View style={{
                                    // backgroundColor: "blue",
                                    width: "45%", height: "90%",
                                    flexDirection: "column", alignItems: "center", justifyContent: "space-evenly",
                                }}>
                                    <Text style={{ fontSize: 20 }}>Radius:</Text>
                                    <Text style={{ fontSize: 20 }}>Navigators:</Text>
                                </View>
                                <View style={{
                                    // backgroundColor: "darkcyan",
                                    width: "45%", height: "90%",
                                    flexDirection: "column", alignItems: "center", justifyContent: "space-evenly",
                                }}>
                                    <TextInput style={{ fontSize: 20, borderColor: "lightgrey", borderBottomWidth: 3, }} placeholder="Radius"
                                        onChangeText={(e) => { this.setState({ filterRadius: e }) }}>{this.state.filterRadius}</TextInput>
                                    <TextInput style={{ fontSize: 20, borderColor: "lightgrey", borderBottomWidth: 3, }} placeholder="Navigators"
                                        onChangeText={(e) => { this.setState({ filterNavigatorsCount: e }) }}>{this.state.filterNavigatorsCount}</TextInput>
                                </View>

                            </View>

                            <View style={{
                                backgroundColor: "#f1f9fc",//#d3eebf
                                width: "90%",
                                height: "18%",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-around",
                                borderBottomColor: "grey",//red
                                borderBottomWidth: 3,
                                borderStyle: "solid",
                                borderRadius: 10
                            }}>
                                <View style={{
                                    // backgroundColor: "blue",
                                    width: "50%", height: "90%",
                                    flexDirection: "column", alignItems: "center", justifyContent: "space-evenly",
                                }}>
                                    <Text style={{ fontSize: 16 }}>MaxTimeFromRelease:</Text>
                                    <Text style={{ fontSize: 16 }}>MinTimeForRelease:</Text>
                                    <Text style={{ fontSize: 16 }}>MaxTimeForRelease:</Text>
                                </View>
                                <View style={{
                                    // backgroundColor: "blue", 
                                    width: "50%", height: "90%",
                                    flexDirection: "column", alignItems: "center", justifyContent: "space-evenly",
                                }}>
                                    <TextInput style={{ fontSize: 16, borderColor: "lightgrey", borderBottomWidth: 3, }} placeholder="MaxTimeFromRelease"
                                        onChangeText={(e) => { this.setState({ filterMaxTimeFromRelease: e }) }}>{this.state.filterMaxTimeFromRelease}</TextInput>
                                    <TextInput style={{ fontSize: 16, borderColor: "lightgrey", borderBottomWidth: 3, }} placeholder="MinTimeForRelease"
                                        onChangeText={(e) => { this.setState({ filterMinTimeForRelease: e }) }}>{this.state.filterMinTimeForRelease}</TextInput>
                                    <TextInput style={{ fontSize: 16, borderColor: "lightgrey", borderBottomWidth: 3, }} placeholder="MaxTimeForRelease"
                                        onChangeText={(e) => { this.setState({ filterMaxTimeForRelease: e }) }}>{this.state.filterMaxTimeForRelease}</TextInput>
                                </View>

                            </View>

                            <View style={{
                                backgroundColor: "blue",
                                width: "100%",
                                height: "11%",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-evenly"
                            }}>

                                <TouchableOpacity style={{
                                    backgroundColor: "#13b8e8",
                                    width: "60%",
                                    height: "60%",
                                    borderRadius: 20,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                    onPress={
                                        () => {
                                            this.setState({ showFilterDialog: false });
                                            this.getFreeParks();
                                        }
                                    }>
                                    <Text style={{ color: "white", fontSize: 20, marginRight: "5%" }}>close</Text>
                                </TouchableOpacity>

                            </View>

                        </View>
                    </View>
                    }
                </View>




                <View
                    style={{
                        // backgroundColor: "transparent",
                        // backgroundColor: "yellow",
                        width: "20%",
                        height: "100%",
                        zIndex: 1,
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        position: "absolute",
                    }}>
                    <View style={{
                        // backgroundColor: "red",
                        width: "100%",
                        height: "10%",
                        maxWidth: 119,
                        minWidth: 50,
                        maxHeight: 107,//213
                        minHeight: 44,//89
                    }}>
                        <TouchableOpacity
                            // style={{ backgroundColor: "green", width: "100%", height: "100%" }}
                            style={{ width: "100%", height: "100%", paddingBottom: 1 }}

                            onPress={() => {
                                console.log("\nZOOM-IN");
                                if (this.latD > 0.001) {
                                    this.latD = this.latD - (this.latD / 3.0);
                                    this.lngD = this.lngD - (this.lngD / 3.0);
                                }
                                console.log("this.latD:", this.latD);
                                console.log("this.lngD:", this.lngD);

                                this.map.animateToRegion({
                                    latitude: this.mylat,
                                    longitude: this.mylng,
                                    latitudeDelta: this.latD,
                                    longitudeDelta: this.lngD,
                                }, 0);

                            }}>
                            <Image
                                // source={require('../assets/zoomIconTransparentOriginal.png')}
                                source={require('../assets/zoomPlus.png')}
                                style={{
                                    // flex: 1,
                                    width: "100%",
                                    height: "100%",
                                    opacity: 0.8,
                                }}
                                // resizeMode="cover"
                                resizeMode="contain"
                            ></Image>
                        </TouchableOpacity>
                    </View>

                    <View style={{
                        // backgroundColor: "red",
                        width: "100%",
                        height: "10%",
                        maxWidth: 119,
                        minWidth: 50,
                        maxHeight: 107,//213
                        minHeight: 40,//89
                    }}>
                        <TouchableOpacity
                            // style={{ backgroundColor: "green", width: "100%", height: "100%" }}
                            style={{ width: "100%", height: "100%", paddingTop: 1 }}

                            onPress={() => {
                                console.log("\n\n::: ZOOM-OUT :::");
                                if (this.latD < 1.5) {
                                    this.latD = this.latD + (this.latD / 3.0);
                                    this.lngD = this.lngD + (this.latD / 3.0);
                                }
                                console.log("this.latD:", this.latD);
                                console.log("this.lngD:", this.lngD);

                                this.map.animateToRegion({
                                    latitude: this.mylat,
                                    longitude: this.mylng,
                                    latitudeDelta: this.latD,
                                    longitudeDelta: this.lngD,
                                }, 0);

                            }}>
                            <Image
                                // source={require('../assets/zoomIconTransparentOriginal.png')}
                                source={require('../assets/zoomMinus.png')}
                                style={{
                                    // flex: 1,
                                    width: "100%",
                                    height: "100%",
                                    opacity: 0.8,
                                }}
                                // resizeMode="cover"
                                resizeMode="contain"
                            ></Image>
                        </TouchableOpacity>
                    </View>

                    <View style={{
                        // backgroundColor: "purple",
                        // opacity: 0.7,
                        width: "100%",
                        height: "15%",
                        justifyContent: "flex-end",
                        alignItems: "center",
                    }}>
                        <View
                            style={{
                                // backgroundColor: "red",
                                // opacity: 0.9,
                                // width: "100%",
                                width: "95%",
                                height: "70%",
                                justifyContent: "center",
                                alignItems: "flex-end",
                                // borderRadius: 100//when you put the image
                            }}>

                            {this.state.statutsBarNormalMode && <TouchableOpacity style={{
                                backgroundColor: "#817e7e",
                                // opacity:0.8,
                                borderRadius: 100,
                                width: "100%",
                                height: "100%",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                                onPress={
                                    () => {
                                        this.setState({ showFilterDialog: true });
                                    }
                                }>
                                <Feather name="filter" size={50} color="white"></Feather>
                            </TouchableOpacity>
                            }
                        </View>
                    </View>

                </View>





                <MapView
                    ref={ref => { this.map = ref; }}

                    provider={"google"}
                    showsUserLocation={true}
                    showsCompass={true}
                    // showsMyLocationButton={true}
                    zoomControlEnabled={true}
                    minZoomLevel={8.5}
                    maxZoomLevel={19}

                    style={{
                        // flex: 1,
                        // width: Dimensions.get('window').width - 10,
                        width: "100%",
                        height: "100%",
                        flexDirection: "row",
                        zIndex: 0,
                        // alignItems: "flex-start",
                        justifyContent: "center",
                        // alignContent:"space-between"

                    }}


                    region={
                        {
                            latitude: this.mylat,
                            longitude: this.mylng,
                            latitudeDelta: this.latD,
                            longitudeDelta: this.lngD,
                        }
                    }

                    onPanDrag={
                        () => {
                            // console.log("\n\npanDrag");
                            this.focusOnUser = false;
                            this.firstTimeAfterRegChange = false;
                            this.pan = true;
                        }}

                    onRegionChangeComplete={
                        (region) => {
                            // console.log("\n\nregionChange");

                            //always takes user's zoom in/out caused by fingers 
                            this.latD = region.latitudeDelta;
                            this.lngD = region.longitudeDelta;

                            if (!this.focusOnUser && !this.firstTimeAfterRegChange) {
                                this.firstTimeAfterRegChange = true;
                                this.mylat = region.latitude;
                                this.mylng = region.longitude;
                                //if you want to know the coords
                                // console.log(this.mylat);
                                // console.log(this.mylng);
                            }

                            //this session is for using the default location btn of the map
                            //there is 3 types of change in region - by pan/zoom/double press
                            //*************
                            // if (!this.pan && !this.zoom && !this.dblPress) {
                            //     this.focusOnUser = true;
                            // }
                            // this.pan = false;
                            // this.zoom = false;
                            // this.dblPress = false;
                            //*************

                        }}

                    onDoublePress={() => { this.dblPress = true; }}

                    onUserLocationChange={newLocation => {
                        // console.log("\n\n\n\nonUserLocationChange");
                        // console.log("this.focusOnUser:", this.focusOnUser);
                        if (this.focusOnUser) {
                            this.mylat = newLocation.nativeEvent.coordinate.latitude;
                            this.mylng = newLocation.nativeEvent.coordinate.longitude;

                            this.map.animateToRegion({
                                latitude: this.mylat,
                                longitude: this.mylng,
                                latitudeDelta: this.latD,
                                longitudeDelta: this.lngD,
                            }, 0);
                        }
                        // console.log("newLocation:", newLocation);
                        // console.log("coordinate.latitude:", newLocation.nativeEvent.coordinate.latitude);
                        // console.log("coordinate.longitude:", newLocation.nativeEvent.coordinate.longitude);
                        // console.log("this.mylat:", this.mylat);
                        // console.log("this.mylng:", this.mylng);
                    }}



                >
                    {/* {this.state.myPark}*/}


                    {this.freeParksArr.map((item) => { return item; })}





                </MapView>



                <Dialog
                    style={{ backgroundColor: "yellow", flexDirection: "row", alignItems: "center", }}
                    children //if not - get WARNING
                    visible={this.state.showParkingCapturedDailog}
                    onTouchOutside={() => {
                        this.setState({ showParkingCapturedDailog: false });
                    }}
                    dialogTitle={<DialogTitle style={{ width: 250 }} title="App stop navigation" />}

                >
                    <View style={{ flexDirection: "column", alignItems: "center" }}>
                        <Text style={{}}>The parking was captured by another driver</Text>
                    </View>

                </Dialog>





                <Dialog
                    children //if not - get WARNING
                    visible={this.state.showNavParkInfo}
                    onTouchOutside={() => {
                        this.setState({ showNavParkInfo: false });
                    }}
                    dialogTitle={<DialogTitle style={{ width: 350, backgroundColor: "#fd405c" }} color="white" title="Park-Info" />}
                    // footer={//need to fix cause some how needed above one DialogButton ===> elsf give ERROR !!!!!!!!!!!
                    //     <DialogFooter style={{ width: 350, backgroundColor: '#fd405c' }}>
                    //         {/* <DialogButton text="I parked" onPress={() => { this.IParked = true; this.stopNav(); }} /> */}
                    //         <DialogButton text="STOP NAVIGATION" onPress={this.stopNav} />
                    //         {/* {this.state.allowBtnParkingWasCaptured && <DialogButton text="Parking Captured" onPress={this.stopNav} />} */}
                    //     </DialogFooter>
                    // }
                >
                    <View style={{ height: 60, backgroundColor: "floralwhite", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                        <FontAwesome name="shekel" size={48} color={this.isFreeColor} />
                        {/* <MaterialIcons name="accessible" size={48} color="dodgerblue"/> */}
                        <MaterialIcons name="accessible" size={48} color={this.isDisabledParkingColor} />

                        <FontAwesome name="truck" size={48} color={this.forVanColor} />
                        {/* <Image source={require('../assets/parkingLotIMG.png')} style={{ width: 48, height: 48, }}></Image> */}
                        <Image source={this.ParkingLotColor} style={{ width: 48, height: 48, }}></Image>
                    </View>

                </Dialog>


                {this.state.showParkingPic && <View style={{ position: "absolute", zIndex: 2, width: "100%", height: "100%" }}>
                    <BlurView tint="dark" intensity={100} >
                        <TouchableOpacity onPress={() => { this.setState({ showParkingPic: false }) }}>
                            <View style={{
                                width: "100%",
                                height: "100%",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <Image
                                    style={{ width: "90%", height: "70%" }}
                                    resizeMode="contain"
                                    source={this.parkPicURL}
                                />
                            </View>
                        </TouchableOpacity>

                    </BlurView>
                </View>}
                {this.state.showMarkParkingDailog &&
                    <View style={{ position: "absolute", zIndex: 2, width: "100%", height: "100%" }}>
                        <BlurView tint="dark" intensity={100} >
                            {/* <TouchableOpacity onPress={() => { this.setState({ showMarkParkingDailog: false }) }}> */}
                            <View style={{
                                width: "100%",
                                height: "100%",
                                flexDirection: "column",
                                justifyContent: "flex-start",
                                alignItems: "center"
                            }}>
                                <View style={{
                                    // backgroundColor: "salmon",
                                    width: "100%",
                                    height: "5%"
                                }}>
                                </View>
                                <Text style={{ fontSize: "24", fontWeight: "600", color: "white" }}>Mark Parking</Text>
                                <View style={{
                                    backgroundColor: "red",
                                    width: "100%",
                                    height: "40%",//60
                                    borderStyle: "solid",
                                    borderColor: "grey",
                                    borderRadius: 20,
                                    borderBottomWidth: 3
                                }}>
                                    <View style={{
                                        // backgroundColor: "lightgreen",
                                        width: "100%",
                                        height: "47%",
                                        flexDirection: "column",
                                        justifyContent: "flex-start",
                                        alignItems: "center"
                                    }}>
                                        <View style={{
                                            // backgroundColor: "peachpuff",
                                            width: "100%",
                                            height: "80%",
                                            flexDirection: "row",
                                            justifyContent: "space-around",
                                            alignItems: "flex-end"
                                        }}>
                                            <View style={{
                                                // backgroundColor: "lavender",
                                                width: "32%",
                                                height: "80%",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}>
                                                <TouchableOpacity
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        // backgroundColor: "red" 
                                                    }}
                                                    onPress={() => this.setState({ markPaidParking: true })}
                                                >
                                                    {!this.state.markPaidParking && <View style={{
                                                        position: "absolute", zIndex: 1,
                                                        width: "100%", height: "100%", borderRadius: 100,
                                                        backgroundColor: "black", opacity: 0.7
                                                    }}></View>}

                                                    <Image
                                                        source={require('../assets/paidParking.png')}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                        }}
                                                        resizeMode="contain"
                                                    ></Image>
                                                </TouchableOpacity>

                                            </View>

                                            <View style={{
                                                // backgroundColor: "lemonchiffon",
                                                width: "32%",
                                                height: "80%",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}>
                                                <TouchableOpacity
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        // backgroundColor: "red" 
                                                    }}
                                                    onPress={() => this.setState({ markPaidParking: false })}
                                                >
                                                    {this.state.markPaidParking && <View style={{
                                                        position: "absolute", zIndex: 1,
                                                        width: "100%", height: "100%", borderRadius: 100,
                                                        backgroundColor: "black", opacity: 0.7
                                                    }}></View>}

                                                    <Image
                                                        source={require('../assets/freeParking.png')}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                        }}
                                                        resizeMode="contain"
                                                    ></Image>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={{
                                            // backgroundColor: "lightskyblue", 
                                            width: "100%", height: "20%",
                                            flexDirection: "row", justifyContent: "space-around", alignItems: "center"
                                        }}>
                                            <Text style={{ fontSize: "20", fontWeight: "normal", color: "white", /*backgroundColor: "red"*/ }}>Paid</Text>
                                            <Text style={{ fontSize: "20", fontWeight: "normal", color: "white", /*backgroundColor: "red"*/ }}>Free</Text>
                                        </View>
                                    </View>

                                    <View style={{
                                        // backgroundColor: "olive",
                                        width: "100%",
                                        height: "47%",
                                        flexDirection: "column",
                                        justifyContent: "flex-start",
                                        alignItems: "center"
                                    }}>
                                        <View style={{
                                            // backgroundColor: "peachpuff",
                                            width: "100%",
                                            height: "80%",
                                            flexDirection: "row",
                                            justifyContent: "space-around",
                                            alignItems: "flex-end"
                                        }}>
                                            <View style={{
                                                // backgroundColor: "lavender",
                                                width: "32%",
                                                height: "80%",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}>
                                                <TouchableOpacity
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        // backgroundColor: "red" 
                                                    }}
                                                    onPress={() => this.setState((prevState) => ({ markDisabledParking: !prevState.markDisabledParking }))}
                                                >
                                                    {!this.state.markDisabledParking && <View style={{
                                                        position: "absolute", zIndex: 1,
                                                        width: "100%", height: "100%", borderRadius: 100,
                                                        backgroundColor: "black", opacity: 0.7
                                                    }}></View>}

                                                    <Image
                                                        source={require('../assets/disabledParking.png')}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                        }}
                                                        resizeMode="contain"
                                                    ></Image>
                                                </TouchableOpacity>

                                            </View>

                                            <View style={{
                                                // backgroundColor: "lemonchiffon",
                                                width: "32%",
                                                height: "80%",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}>
                                                <TouchableOpacity
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        // backgroundColor: "red" 
                                                    }}
                                                    onPress={() => this.setState((prevState) => ({ markParkingLot: !prevState.markParkingLot }))}
                                                >
                                                    {!this.state.markParkingLot && <View style={{
                                                        position: "absolute", zIndex: 1,
                                                        width: "100%", height: "100%", borderRadius: 100,
                                                        backgroundColor: "black", opacity: 0.7
                                                    }}></View>}

                                                    <Image
                                                        source={require('../assets/parkingLotEng.png')}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                        }}
                                                        resizeMode="contain"
                                                    ></Image>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={{
                                            // backgroundColor: "lightskyblue", 
                                            width: "100%", height: "20%",
                                            flexDirection: "row", justifyContent: "space-around", alignItems: "center"
                                        }}>
                                            <View style={{
                                                // backgroundColor: "yellow",
                                                width: "50%", height: "100%",
                                                justifyContent: "center", alignItems: "center"
                                            }}>
                                                <Text style={{
                                                    fontSize: "20", fontWeight: "normal", color: "white",
                                                    // backgroundColor: "blue",
                                                }}>Disabled Parking</Text>
                                            </View>
                                            <View style={{
                                                // backgroundColor: "red",
                                                width: "50%", height: "100%",
                                                justifyContent: "center", alignItems: "center"
                                            }}>
                                                <Text style={{
                                                    fontSize: "20", fontWeight: "normal", color: "white",
                                                    // backgroundColor: "green",
                                                }}>Parking Lot</Text>
                                            </View>


                                        </View>
                                    </View>


                                </View>
                                <View style={{
                                    backgroundColor: "palegreen",
                                    width: "100%", height: "20%",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}>
                                    <View style={{ backgroundColor: "mediumslateblue", width: "100%", height: "50%", justifyContent: "center", alignItems: "center" }}>
                                        <Text>realese time</Text>
                                    </View>
                                    <View style={{
                                        backgroundColor: "honeydew",
                                        width: "100%", height: "50%",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>
                                        <Button title={"now"} onPress={() => { this.releaseStatus = "now" }}></Button>
                                        <Button title={"10 min"} onPress={() => { this.releaseStatus = "10" }}></Button>
                                        <Button title={"20 min"} onPress={() => { this.releaseStatus = "20" }}></Button>
                                        <Button title={"30 min"} onPress={() => { this.releaseStatus = "30" }}></Button>
                                        <Button title={"60 min"} onPress={() => { this.releaseStatus = "60" }}></Button>
                                    </View>
                                </View>
                                {/* <TouchableOpacity style={{
                                        backgroundColor: "purple",
                                        width: "100%",
                                        height: "10%",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>
                                        <Text style={{ fontSize: "22", fontWeight: "600", color: "white" }}>Mark</Text>
                                    </TouchableOpacity> */}
                                <View style={{ width: "100%", height: "8%", justifyContent: "center", alignItems: "center" }}>
                                    <Text style={{ fontSize: "22", fontWeight: "600", color: "white" }}>Mark</Text>
                                </View>
                                <View style={{
                                    // backgroundColor: "salmon",
                                    width: "100%", height: "11%",
                                    flexDirection: "row", justifyContent: "space-evenly", alignItems: "center"
                                }}>
                                    <View style={{ width: "35%", height: "100%" }}>
                                        <TouchableOpacity style={{
                                            width: "100%",
                                            height: "100%",
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderStyle: "solid",
                                            borderColor: "grey",
                                            borderRadius: 20,
                                            borderWidth: "3%",
                                        }}
                                            onPress={() => {
                                                this.setState({ takePicPark: "yes" }, () => { this.MarkPark(); })
                                            }}>
                                            <Text style={{ fontSize: "20", fontWeight: "600", color: "white" }}>with </Text>
                                            <MaterialIcons
                                                name="camera-alt" size={40} color={"white"}
                                            ></MaterialIcons>

                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ width: "35%", height: "100%" }}>
                                        <TouchableOpacity style={{
                                            width: "100%",
                                            height: "100%",
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderStyle: "solid",
                                            borderColor: "grey",
                                            borderRadius: 20,
                                            borderWidth: "3%"
                                        }}
                                            onPress={this.MarkPark}>
                                            <Text style={{ fontSize: "20", fontWeight: "600", color: "white" }}>w/o </Text>
                                            <MaterialCommunityIcons
                                                name="camera-off" size={40} color={"white"}
                                            ></MaterialCommunityIcons>
                                        </TouchableOpacity>

                                    </View>

                                </View>
                                <View style={{
                                    width: "100%", height: "12%",
                                    // backgroundColor: "pink"
                                }}>
                                    <TouchableOpacity style={{
                                        width: "100%",
                                        height: "100%",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                        onPress={() => { this.setState({ showMarkParkingDailog: false }) }}>
                                        <Text style={{ fontSize: "22", fontWeight: "600", color: "white" }}>Close</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ width: "100%", height: "3%" }}></View>

                                {/* <View style={{ width: "100%", height: "5%" }}></View>
                                <View style={{
                                    // backgroundColor: "salmon",
                                    width: "100%", height: "11%",
                                    flexDirection: "row", justifyContent: "space-evenly", alignItems: "center"
                                }}>
                                    <View style={{ width: "35%", height: "100%" }}>
                                        <TouchableOpacity style={{
                                            width: "100%",
                                            height: "100%",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderStyle: "solid",
                                            borderColor: "grey",
                                            borderRadius: 20,
                                            borderWidth: "3%",
                                        }}>
                                            <MaterialIcons
                                                name="camera-alt" size={40} color={"white"}
                                            ></MaterialIcons>
                                            <Text style={{ fontSize: "22", fontWeight: "600", color: "white" }}>Mark</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ width: "35%", height: "100%" }}>
                                        <TouchableOpacity style={{
                                            width: "100%",
                                            height: "100%",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderStyle: "solid",
                                            borderColor: "grey",
                                            borderRadius: 20,
                                            borderWidth: "3%"
                                        }}>
                                            <MaterialCommunityIcons
                                                name="camera-off" size={40} color={"white"}
                                            ></MaterialCommunityIcons>
                                            <Text style={{ fontSize: "22", fontWeight: "600", color: "white" }}>Mark</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                                <View style={{ width: "100%", height: "3%" }}></View>
                                <View style={{
                                    width: "100%", height: "11%",
                                    // backgroundColor: "pink"
                                }}>
                                    <TouchableOpacity style={{
                                        width: "100%",
                                        height: "100%",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                        onPress={() => { this.setState({ showMarkParkingDailog: false }) }}>
                                        <Text style={{ fontSize: "22", fontWeight: "600", color: "white" }}>Close</Text>
                                    </TouchableOpacity>
                                </View> */}

                                {/* <Image
                                    style={{ width: "90%", height: "70%" }}
                                    resizeMode="contain"
                                    source={this.parkPicURL}
                                /> */}
                            </View>
                            {/* </TouchableOpacity> */}

                        </BlurView>
                    </View>}



            </View >
        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        // border:0,
        // margin:0,
        // padding:0,
        // width:"100%",
        // height:"95%"
    },
    bigFont: {
        fontSize: 30
    },
    text: {
        marginTop: 30,
        marginBottom: 5,
        backgroundColor: "yellow"
    },
    DialogTitle: {
        backgroundColor: "blue",
        padding: 0,
        margin: 0,
        width: 150,
        height: 50,
    },
    DialogButton1: {
        backgroundColor: "green",
        padding: 0,
        margin: 0,
        width: 50,
        height: 20,
    },
    DialogButton2: {
        backgroundColor: "yellow",
        padding: 0,
        margin: 0,
        width: 50,
        height: 30,
    },
});

