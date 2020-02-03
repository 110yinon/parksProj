import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Dimensions, Image, AsyncStorage, ImageBackground } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Dialog, { DialogContent, DialogButton, DialogTitle, DialogFooter } from 'react-native-popup-dialog';
import { createStackNavigator, createAppContainer, createBottomTabNavigator, createDrawerNavigator } from 'react-navigation';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native-gesture-handler';


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
        this.index = 0;
        // this.myPark = null;
        this.isDisabledParkingColor = "lightgrey";
        this.isFreeColor = "lightgrey";
        this.ParkingLotIconOriginal = require('../assets/parkingLotIMG.png');
        this.ParkingLotIconBright = require('../assets/parkingLotIMGbrightless.png');
        this.ParkingLotColor = this.ParkingLotIconBright;
        this.forVanColor = "lightgrey";
        this.parkPicURL = require('../assets/no-image-icon-6.png');

        this.state = {
            errorMessage: "",
            location: "",
            visible: false,//for dialog-box
            showMarkerInfo: false,
            myLatitude: 32.000,//32.453712169999996
            myLongitude: 34.000,//34.906191299999996,
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

        }

    }




    getMyLocation = async () => {

        const { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status === 'granted') {
            //   return Location.getCurrentPositionAsync({ enableHighAccuracy: true });
            let location = await Location.getCurrentPositionAsync({});
            console.log("**** func:getMyLocation ****");
            console.log("location:", location);
            this.setState({
                myLatitude: location.coords.latitude,
                myLongitude: location.coords.longitude
            }, () => {
                console.log("******** this.state.myLatitude", this.state.myLatitude);
                console.log("******** this.state.myLongitude", this.state.myLongitude);
                this.user.userLatitude = this.state.myLatitude;
                this.user.userLongitude = this.state.myLongitude;
                console.log("**** END func:getMyLocation ****");
            })
        } else {
            alert('Location permission not granted');
        }

    }









    getFreeParks = () => {

        // alert("getFreeParks");
        console.log("*** func: getFreeParks *****");

        fetch(ruppinURL + 'parks', {
            method: 'get',
            headers: new Headers({
                'Content-Type': 'application/json;',
            }),
            // body: JSON.stringify(data)
        })
            .then(res => {
                console.log('res=', res);
                return res.json()
            })
            .then(
                (result) => {
                    console.log("fetch POST= ", result);
                    // console.log("fetch POST.d= ", result.d);
                    // let freeParksFromDB = JSON.parse(result);
                    let freeParksFromDB = result;
                    if (freeParksFromDB != null) {
                        this.index = 0;
                        freeParksFromDB.map(
                            (item) => {
                                itemCoords = {
                                    latitude: parseFloat(item.parkLatitude),
                                    longitude: parseFloat(item.parkLongitude),
                                }
                                this.freeParksArr[this.index++] = <Marker
                                    key={this.index}//else give alerts
                                    // description={item.UserID}
                                    coordinate={itemCoords}
                                    onPress={() => {
                                        // console.log("item before:", item)
                                        if (item.isFree == "true") this.isFreeColor = "lightgrey";
                                        else this.isFreeColor = "green";
                                        // console.log("1");
                                        if (item.isDisabledParking == "true") this.isDisabledParkingColor = "dodgerblue";
                                        else this.isDisabledParkingColor = "lightgrey";
                                        // console.log("2");
                                        if (item.ParkingLot == "true") this.ParkingLotColor = this.ParkingLotIconOriginal;
                                        else this.ParkingLotColor = this.ParkingLotIconBright;
                                        // console.log("3");
                                        if (item.forVan == "true") this.forVanColor = "black"
                                        else this.forVanColor = "lightgrey";
                                        // console.log("4");
                                        this.parkDate = item.date;
                                        // console.log("finish if/else above");
                                        // this.setState({ showMarkerInfo: true, picURL: uploadFileRoot + item.parkIMG },()=>{console.log("item:",item)})
                                        // this.setState({ showMarkerInfo: true, picURL: { uri: uploadFileRoot +  item.parkIMG }},()=>{console.log("item:",item)})
                                        if (item.parkIMG == null || item.parkIMG == undefined || item.parkIMG == "null")
                                            this.parkPicURL = require('../assets/no-image-icon-6.png');
                                        else this.parkPicURL = { uri: uploadFileRoot + item.parkIMG };
                                        this.setState({ showMarkerInfo: true })
                                    }}>
                                </Marker>;
                            }
                        );
                        // this.setState({});//call for render so changes take efect
                        // console.log("this.freeParksArr:", this.freeParksArr);
                        console.log("*** END func: getFreeParks *****");
                        this.getMyLocation();
                    }
                    else
                        console.log("faild");
                },
                (error) => {
                    console.log("err post=", error);
                });

        //E.G ON LOCAL
        // let freeParksFromDB =
        //     [
        //         {
        //             "UserID": "2",
        //             "parkLatitude": "32.45283239389385",
        //             "parkLongitude": "34.90703724327954",
        //             "parkIMG": "",
        //             "UserNavigatorID": "",
        //             "onNav": "false"
        //         },
        //         {
        //             "UserID": "3",
        //             "parkLatitude": "32.45143239389590",
        //             "parkLongitude": "34.90803724328950",
        //             "parkIMG": "",
        //             "UserNavigatorID": "",
        //             "onNav": "false"
        //         },
        //         {
        //             "UserID": "4",
        //             "parkLatitude": "32.45163239389590",
        //             "parkLongitude": "34.90903724328950",
        //             "parkIMG": "",
        //             "UserNavigatorID": "",
        //             "onNav": "false"
        //         }
        //     ]

        // // freeParksFromDB
        // this.index = 0;
        // freeParksFromDB.map(
        //     (item) => {
        //         itemCoords = {
        //             latitude: parseFloat(item.parkLatitude),
        //             longitude: parseFloat(item.parkLongitude),
        //         }
        //         this.freeParksArr[this.index++] = <Marker
        //             key={this.index}//else give alerts
        //             description={item.UserID}
        //             coordinate={itemCoords}
        //             onPress={() => {
        //                 this.setState({ showMarkerInfo: true })
        //             }}>
        //         </Marker>;
        //         // console.log("",);
        //     }
        // );
        // this.setState({});//call for render so changes take efect
        // console.log("this.freeParksArr:", this.freeParksArr);

    }




    getData = async () => {
        //{"UserID":2,"UserName":"avi","Password":"123","Email":"avi@gmail",
        // "LicensePlate":"123-456-789","userLatitude":"","userLongitude":""}

        // const value = JSON.parse(await AsyncStorage.getItem('user'));
        // console.log("getItem is done !!");
        // console.log(" >>>>>> from AsyncStorage:", value);
        // return value;
        this.user = JSON.parse(await AsyncStorage.getItem('user'));
        console.log("func: getItem");
        console.log(" >>>>>> user from AsyncStorage:", this.user);
        if (this.user === null) {
            this.props.navigation.navigate('Login');
        }
        else {
            this.getFreeParks();
            return this.user;
        }

    }


    componentDidMount() {
        //     this.getData();//test to check if work fine

        // this.user = this.getData();// -> if getData use value insted this.user

        //opt 1 - all three work async
        // this.getData();
        // this.getFreeParks();
        // this.getMyLocation();

        //opt 2 - nestend
        this.getData();


    }


    btnMarkPark = () => {

        console.log("**** func: MarkPark ****");

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

        // this.myPark = <Marker description="this is your park" coordinate={this.parkLatLng}></Marker>;
        // this.setState({
        //     // visible: true,
        //     visible: false,
        //     // myPark: <Marker description="this is your park" coordinate={this.parkLatLng}></Marker>
        //     myPark: <Marker description="this is your park" coordinate={{ latitude: this.state.myLatitude, longitude: this.state.myLongitude }}></Marker>
        // });//call for render,visible is for the dialog-box

        // this.user = this.getData();
        // console.log("this.user:", this.user);

        const data = {
            userID: this.user.UserID,
            ParkLatitude: this.state.myLatitude,
            ParkLongitude: `${this.state.myLongitude}`,
            onNav: "false",
            date: new Date().toString(),
            IsFree: this.state.btnFree,
            IsDisabledParking: this.state.btnDisabledPark,
            ParkingLot: this.state.btnParkingLot,
            ForVan: this.state.btnforVan,
        };

        console.log("data:", data);

        fetch(ruppinURL + 'park', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            body: JSON.stringify(data)
        })
            .then(res => {
                console.log('res=', res);
                this.setState({ visible: false, });
                this.getFreeParks();
                console.log("**** END func: MarkPark ****");
                return res.json()
            }, (error) => {
                console.log("err post=", error);
            })
        // .then(
        //     (result) => {
        //         console.log("fetch POST= ", result);
        //         console.log("fetch POST.d= ", result.d);
        //         let p = JSON.parse(result.d);
        //         if (p != -1) {
        //             console.log("success");
        //         }
        //         else
        //             console.log("failed");
        //     },
        //     (error) => {
        //         console.log("err post=", error);
        //     }
        // );

    }



    render() {

        return (

            <View style={styles.container}>

                <Text style={styles.text}>Main Page</Text>

                <MapView
                    ref={ref => { this.map = ref; }}

                    provider={"google"}
                    showsUserLocation={true}
                    showsScale={true}//only for iphone
                    showsCompass={true}
                    showsMyLocationButton={true}
                    zoomControlEnabled={true}
                    followsUserLocation={true}



                    style={{
                        flex: 1,
                        width: Dimensions.get('window').width - 10,
                        flexDirection: "column-reverse",
                        alignItems: "flex-start",
                        // justifyContent:"flex-start",
                        // alignContent:"space-between"

                    }}
                    // initialRegion={{

                    //     // latitude: 32.453712169999996,
                    //     // longitude: 34.906191299999996,
                    //     latitude: this.state.myLatitude,
                    //     longitude: this.state.myLongitude,
                    //     latitudeDelta: 0.005,//0.0922,
                    //     longitudeDelta: 0.005//0.0421,
                    // }}
                    region={{
                        latitude: this.state.myLatitude,
                        longitude: this.state.myLongitude,
                        latitudeDelta: 0.0005,//0.0922,
                        longitudeDelta: 0.0005//0.0421,
                    }}

                >
                    {this.state.myPark}
                    {this.freeParksArr.map((item) => { return item; })}
                    <View
                        style={{
                            backgroundColor: "rgba(52, 52, 52, 0.5)", width: 100, height: 100,
                            borderBottomStartRadius: 100, borderBottomEndRadius: 100,
                            marginLeft: 4, marginTop: 2, marginBottom: "10%",


                        }}>
                    </View>

                    <View style={{ backgroundColor: "green", width: 60, height: 28, borderTopStartRadius: 100, borderTopEndRadius: 100, marginLeft: 4 }}></View>

                    {/* <Image source={this.ParkingLotIconOriginal} style={{ width: 100, height: 100, opacity:0.1,borderRadius:50 }}></Image> */}

                    <ImageBackground source={this.ParkingLotIconOriginal} style={{ width: 100, height: 100, borderRadius: 50 }}>
                        <Text>Inside</Text>
                    </ImageBackground>


                    <Image source={require('../assets/zoomIconTransparentOriginal.png')}
                        style={{
                            flex: 1,
                            width: 300,
                            height: 100,
                            resizeMode: 'contain'
                        }}>

                    </Image>


                    {/* <TouchableOpacity
                            onPress={() => { }}>
                            <Image source={this.state.btnParkingLotColorIcon} style={{ width: 48, height: 48, }}></Image>
                        </TouchableOpacity> */}

                </MapView>
                {/* <Button style={styles.container} title="markMyPark" onPress={this.btnMarkPark} /> */}
                <Button style={styles.container} title="markMyPark" onPress={() => { this.setState({ visible: true }); }} />
                {/* <Dialog
                    children //if not - get WARNING
                    visible={this.state.visible}
                    onTouchOutside={() => {
                        this.setState({ visible: false });
                    }}
                    dialogTitle={<DialogTitle style={{ width: 250 }} title="Take picture of park" />}
                    footer={
                        <DialogFooter>
                            <DialogButton
                                text="No"
                                onPress={() => {
                                    this.setState({ visible: false });
                                }}
                            />
                            <DialogButton
                                text="Yes"
                                onPress={() => {
                                    this.setState({ visible: false }, () => { this.props.navigation.push('Camera', { 'userInfo': this.user }) });
                                }}
                            />
                        </DialogFooter>
                    }
                >
                </Dialog> */}
                <Dialog
                    style={{ backgroundColor: "yellow", flexDirection: "row", alignItems: "center", }}
                    children //if not - get WARNING
                    visible={this.state.visible}
                    onTouchOutside={() => {
                        this.setState({ visible: false });
                    }}
                    dialogTitle={<DialogTitle style={{ width: 250 }} title="Park-Properties" />}
                    footer={
                        <DialogFooter style={{ backgroundColor: "orange", flexDirection: "col", alignItems: "center", }}>
                            <Text style={{ backgroundColor: "lime" }}>Take picture of park</Text>
                            <View style={{
                                backgroundColor: "purple", display: "flex", flexDirection: "row", justifyContent: "space-evenly",
                                width: 250,
                            }}>

                                <Button title="no" onPress={this.btnMarkPark}></Button>

                                {/* <Button title="yes" style={{ flex: 1 }} onPress={() => { this.btnMarkPark(); this.kuku(); }}> */}
                                <Button title="yes" onPress={() => {
                                    this.props.navigation.push('Camera', { 'userInfo': this.user })
                                    this.btnMarkPark();
                                }}>
                                </Button>

                            </View>
                        </DialogFooter>
                    }
                >
                    <View style={{ flexDirection: "col", alignItems: "center" }}>
                        {/* <Button title="Free" color={this.state.btnFreeColor}
                            onPress={() => {
                                this.state.btnFreeColor == "lightgrey" ?
                                    this.setState({
                                        btnFree: true, btnFreeColor: "dodgerblue"
                                    }, () => { console.log("this.state.btnFree:", this.state.btnFree); }) :
                                    this.setState({
                                        btnFree: false, btnFreeColor: "lightgrey"
                                    }, () => { console.log("this.state.btnFree:", this.state.btnFree); })

                            }}></Button>


                        <Button title="DisabledPark" color={this.state.btnDisabledParkColor}
                            onPress={() => {
                                this.state.btnDisabledParkColor == "lightgrey" ?
                                    this.setState({
                                        btnDisabledPark: true,
                                        btnDisabledParkColor: "dodgerblue"
                                    }, () => { console.log("this.state.btnDisabledPark:", this.state.btnDisabledPark); }) :
                                    this.setState({
                                        btnDisabledPark: false,
                                        btnDisabledParkColor: "lightgrey"
                                    }, () => { console.log("this.state.btnDisabledPark:", this.state.btnDisabledPark); })

                            }}></Button>


                        <Button title="ParkingLot" color={this.state.btnParkingLotColor}
                            onPress={() => {
                                this.state.btnParkingLotColor == "lightgrey" ?
                                    this.setState({
                                        btnParkingLot: true,
                                        btnParkingLotColor: "dodgerblue"
                                    }, () => { console.log("this.state.btnParkingLot:", this.state.btnParkingLot); }) :
                                    this.setState({
                                        btnParkingLot: false,
                                        btnParkingLotColor: "lightgrey"
                                    }, () => { console.log("this.state.btnParkingLot:", this.state.btnParkingLot); })

                            }}></Button>



                        <Button title="forVan" color={this.state.btnforVanColor}
                            onPress={() => {
                                this.state.btnforVanColor == "lightgrey" ?
                                    this.setState({
                                        btnforVan: true,
                                        btnforVanColor: "dodgerblue"
                                    }, () => { console.log("this.state.btnforVan:", this.state.btnforVan); }) :
                                    this.setState({
                                        btnforVan: false,
                                        btnforVanColor: "lightgrey"
                                    }, () => { console.log("this.state.btnforVan:", this.state.btnforVan); })

                            }}></Button> */}


                        <View style={{ width: 250, height: 60, backgroundColor: "floralwhite", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                            <FontAwesome name="shekel" size={48} color={this.state.btnFreeColorIcon} onPress={() => {
                                this.state.btnFreeColorIcon == "lightgrey" ?
                                    this.setState({
                                        btnFree: false, btnFreeColorIcon: "green"
                                    }, () => { console.log("this.state.btnFree:", this.state.btnFree); }) :
                                    this.setState({
                                        btnFree: true, btnFreeColorIcon: "lightgrey"
                                    }, () => { console.log("this.state.btnFree:", this.state.btnFree); })
                            }} />
                            <MaterialIcons name="accessible" size={48} color={this.state.btnDisabledParkColorIcon} onPress={() => {
                                this.state.btnDisabledParkColorIcon == "lightgrey" ?
                                    this.setState({
                                        btnDisabledPark: true, btnDisabledParkColorIcon: "dodgerblue"
                                    }, () => { console.log("this.state.btnDisabledPark:", this.state.btnDisabledPark); }) :
                                    this.setState({
                                        btnDisabledPark: false, btnDisabledParkColorIcon: "lightgrey"
                                    }, () => { console.log("this.state.btnDisabledPark:", this.state.btnDisabledPark); })
                            }} />
                            <FontAwesome name="truck" size={48} color={this.state.btnforVanColorIcon} onPress={() => {
                                this.state.btnforVanColorIcon == "lightgrey" ?
                                    this.setState({
                                        btnforVan: true, btnforVanColorIcon: "black"
                                    }, () => { console.log("this.state.btnforVan:", this.state.btnforVan); }) :
                                    this.setState({
                                        btnforVan: false, btnforVanColorIcon: "lightgrey"
                                    }, () => { console.log("this.state.btnforVan:", this.state.btnforVan); })
                            }} />

                            <TouchableOpacity onPress={() => {
                                this.state.btnParkingLotColorIcon == this.ParkingLotIconBright ?
                                    this.setState({
                                        btnParkingLot: true, btnParkingLotColorIcon: this.ParkingLotIconOriginal
                                    }, () => { console.log("this.state.btnParkingLot:", this.state.btnParkingLot); }) :
                                    this.setState({
                                        btnParkingLot: false, btnParkingLotColorIcon: this.ParkingLotIconBright
                                    }, () => { console.log("this.state.btnParkingLot:", this.state.btnParkingLot); })
                            }}>
                                <Image source={this.state.btnParkingLotColorIcon} style={{ width: 48, height: 48, }}></Image>
                            </TouchableOpacity>
                        </View>

                    </View>

                </Dialog>

                <Dialog
                    children //if not - get WARNING
                    visible={this.state.showMarkerInfo}
                    onTouchOutside={() => {
                        this.setState({ showMarkerInfo: false });
                    }}
                    dialogTitle={<DialogTitle style={{ width: 350, backgroundColor: 'red' }} title="Navigate to park" />}
                    footer={
                        <DialogFooter style={{ width: 350, backgroundColor: 'red' }}>
                            <DialogButton
                                text="No"
                                onPress={() => {
                                    this.setState({ showMarkerInfo: false });
                                }}
                            />
                            <DialogButton
                                text="Yes"
                            // onPress={() => {
                            //     this.setState({ visible: false }, () => { this.props.navigation.navigate('Camera', { 'userInfo': this.user, 'userCoords': this.parkLatLng }) });
                            // }}
                            />
                        </DialogFooter>

                    }
                >
                    {/* <DialogContent style={{backgroundColor:'lime', padding:0,margin:0}}> */}
                    {/* <Text style={styles.text}>Pic of Park</Text> */}
                    {/* <Text style={styles.text}>{this.state.picURL}</Text> */}
                    <View style={{ height: 60, backgroundColor: "floralwhite", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                        <FontAwesome name="shekel" size={48} color={this.isFreeColor} />
                        {/* <MaterialIcons name="accessible" size={48} color="dodgerblue"/> */}
                        <MaterialIcons name="accessible" size={48} color={this.isDisabledParkingColor} />

                        <FontAwesome name="truck" size={48} color={this.forVanColor} />
                        {/* <Image source={require('../assets/parkingLotIMG.png')} style={{ width: 48, height: 48, }}></Image> */}
                        <Image source={this.ParkingLotColor} style={{ width: 48, height: 48, }}></Image>
                    </View>

                    <View>
                        <Text>{this.parkDate}</Text>
                    </View>

                    <Image
                        style={{ width: 350, height: 300, padding: 0, margin: 0, }}
                        // source={{uri: `${this.state.picURL}`}}
                        // source={{uri:this.state.picURL}}
                        // source={this.state.picURL}
                        source={this.parkPicURL}
                    />
                    {/* </DialogContent> */}

                </Dialog>








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
