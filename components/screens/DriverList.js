import React, { useState } from 'react'
import { Surface, List, Portal, Modal, IconButton, Avatar, ActivityIndicator, Badge, Button, AnimatedFAB } from 'react-native-paper'
import { StyleSheet, ScrollView, Pressable, View, Image, Text, Linking, Dimensions, TouchableOpacity } from 'react-native'
import MapService from '../supportComponents/MapService';
import { Amplify, PubSub } from 'aws-amplify';
import { updateMQTTdata } from '../actions/UserActions';
import { useSelector, useDispatch } from 'react-redux';
import { GET_USER_LIST } from "@env";
import { driverStatus } from "../responses/driverStatus.json";


export default function DriverList({ navigation }) {

    const [isLoading, setLoading] = useState(true)
    const [driverList, setDriverList] = useState([])
    const [showLocation, setShowLocation] = useState({})
    //const [topics, setTopics] = useState([])

    const dispatch = useDispatch();
    const mqttData = useSelector((store) => store.driver.mqttData);

    const getUsers = async () => {

        fetch(GET_USER_LIST) //S3 Link for Json
            .then((response) => response.json())
            .then(
                (data) => {
                    setDriverList(data.body);
                    let tempDevicesList = _setDevicesList(data.body);
                    let topics = tempDevicesList.map(element => "aws/deviceUpdate/" + element);
                    //setTopics(topics);
                    subscribeMqtt(topics);
                }
            )
            .catch((error) => console.error(error))
            .finally(
                () => {
                    setLoading(false);
                }
            );

    }

    const subscribeMqtt = (topics) => {
        PubSub.subscribe(topics).subscribe({
            next: data => _extractMQTTData(data),
            error: error => resubscribe(error, topics),
            complete: () => console.log('Done'),
        });
    }

    const resubscribe = (error, topics) => {
        console.error(error);
        subscribeMqtt(topics);
    }

    //Location, Speed, Rickshaw Running Status, Last Updated Time, Battery Life
    const _extractMQTTData = (data) => {
        if (!data.value.DeviceId) {
            return;
        }

        let deviceId = data.value.DeviceId;
        let Location = data.value.Location;
        let RickshawStopped = data.value.RickshawStopped;
        let Batterylife = data.value.Batterylife;
        let timeUTC = new Date();
        let offset = (330 * 60 * 1000);
        let currentTime = new Date(timeUTC.getTime() + offset);

        let locationHistory = [];
        let currentLocation = {}
        let currentSpeed = 0;

        if (Location != null) {
            Object.keys(Location).forEach((key, index) => {
                if (Location[key] != null && checkRecentEvent(key, currentTime)) {
                    let unformattedLocationString = Location[key];
                    let formattedStringArray = ("[" + unformattedLocationString.replace(/[{}]/g, "").replace(/, /g, ",") + "]").replace(",]", "]");
                    let formattedLocationArray = JSON.parse(formattedStringArray);
                    //let unformattedLocationArray = JSON.parse(unformattedLocationString.split(",")[1]);
                    let location = {};
                    location.latitude = formattedLocationArray[0];
                    location.longitude = formattedLocationArray[1];
                    currentSpeed = formattedLocationArray[2];
                    if (index == Object.keys(Location).length - 1) {
                        currentLocation = location;
                    }
                    else {
                        locationHistory = [location, ...locationHistory]
                    }
                }
            })
        }

        let tempDeviceStore = { locationHistory, currentLocation, currentSpeed, RickshawStopped, Batterylife, currentTime };

        let payload = {
            key: deviceId,
            value: tempDeviceStore
        }

        dispatch(updateMQTTdata(payload));

    }

    function checkRecentEvent(eventTime, IST_time) {
        return true;
        let eventDate = new Date(eventTime);
        let timeDifference = IST_time.getTime() - eventDate.getTime();
        let oneMinute = 60000;
        if (timeDifference < oneMinute) {
            return true;
        } else {
            return false;
        }
    }

    React.useEffect(() => {
        getUsers();
    }, [])

    const _setShowLocation = (driverId, value) => {
        setShowLocation({ ...showLocation, [driverId]: value });
    }

    const _setDevicesList = (driverList) => {
        let tempDevicesList = [];
        driverList.forEach(element => {
            if (!tempDevicesList.includes(element.deviceId)) {
                tempDevicesList = [...tempDevicesList, element.deviceId];
            }
        });
        return tempDevicesList;
    }


    return (
        <View style={styles.container}>

            {isLoading ? <Surface style={[styles.surface, { justifyContent: "center", alignItems: "center" }]}><ActivityIndicator animating={true} /></Surface> :
                (<Surface style={styles.surface} elevation={2}>

                    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>

                        {driverList.map((driver, index) => {
                            return (
                                <View key={index}>
                                    <Pressable onPress={() => navigation.navigate('Details', {
                                        driverid: driver.driverId
                                    })}
                                    >
                                        <Surface style={driver.activeStatus !== "active" ? { height: 100, paddingHorizontal: 10, marginTop: 10, margin: 10, flexDirection: "row", backgroundColor: "#EFF1F3" } : { height: 100, paddingHorizontal: 10, margin: 10, flexDirection: "row", backgroundColor: "#FEF5D8" }} elevation={2}>
                                            {driver.activeStatus != "active" &&
                                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'tomato', position: "absolute", left: 4, top: 4 }}>
                                                </View>
                                            }
                                            <View style={{ flex: 1, margin: 5 }}>
                                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                                    <Image resizeMode="contain" style={styles.avatar} source={{ uri: driver.image.uri }} />
                                                </View>
                                            </View>
                                            <View style={{ flex: 2, margin: 5 }}>
                                                <View style={{ flex: 1, justifyContent: "center", paddingVertical: 5 }}>
                                                    <View style={{ flex: 2, justifyContent: "center" }}>
                                                        <Text style={{ fontWeight: "500", fontSize: 20 }}>
                                                            {driver.firstName} {driver.lastName}
                                                        </Text>
                                                    </View>
                                                    {driver.activeStatus == "active" &&
                                                        <View style={{ flex: 1, justifyContent: "flex-end" }}>
                                                            <Text style={{ fontWeight: "300", fontSize: 15 }}>
                                                                Rs {driver.totalAmountPending} Pending
                                                            </Text>
                                                        </View>
                                                    }
                                                </View>
                                            </View>
                                            <View style={{ flex: 1, margin: 5 }}>
                                                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                                                    <IconButton icon="phone-in-talk" mode="contained" onPress={() => Linking.openURL(`tel:${driver.phoneNumber}`)} />
                                                </View>
                                                {driver.activeStatus == "active" &&
                                                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                                                        <IconButton icon="map-marker-check" mode="contained" onPress={() => _setShowLocation(driver.driverId, !showLocation[driver.driverId])} />
                                                    </View>
                                                }
                                            </View>
                                        </Surface>
                                    </Pressable>
                                    {driver.activeStatus != "active" &&
                                        <Surface style={{ height: 40, marginHorizontal: 10, marginTop: -10, flexDirection: "row" }}>
                                            <View style={{ flex: 2, justifyContent: "center", marginHorizontal: 10 }}>
                                                <Text style={{ fontWeight: "500", fontSize: 15 }}>
                                                    {driverStatus[driver.activeStatus].field}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: "center", marginHorizontal: 10 }}>
                                                {driver.activeStatus == "pending_auto_registeration" &&
                                                    <TouchableOpacity style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#674FA3", borderRadius: 5, padding: 5 }} onPress={() => navigation.navigate("Auto", {
                                                        driverid: driver.driverId
                                                    })}>
                                                        <View>
                                                            <Text style={{ fontWeight: "400", fontSize: 15, color: "white" }}>
                                                                Register Auto
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                        </Surface>
                                    }
                                    {(Object.keys(showLocation).includes(driver.driverId) && showLocation[driver.driverId] == true) &&
                                        <Surface elevation={2} style={{ height: 200, margin: 10, }}>
                                            {(mqttData[driver.deviceId]) && <MapService currentLocation={mqttData[driver.deviceId].currentLocation} locationHistory={mqttData[driver.deviceId].locationHistory} style={{ flex: 1 }} icon="circle-slice-8" />}
                                            {(!mqttData[driver.deviceId]) && <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><Text>Trying to fetch Driver's Location</Text></View>}
                                            <IconButton icon="chevron-up" onPress={() => _setShowLocation(driver.driverId, false)} style={{ position: "absolute", right: 2, top: 2, backgroundColor: "white", borderWidth: 0.5 }} />
                                        </Surface>
                                    }
                                </View>
                            )
                        })}
                    </ScrollView>
                    <View style={{ margin: 20, height: 50, flexDirection: "row" }}>
                        <View style={{ flex: 1, marginHorizontal: 5 }}>
                            <Button mode="contained" onPress={() => navigation.navigate("Register")}>
                                Register Driver
                            </Button>
                        </View>
                    </View>
                </Surface>)
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    surface: {
        flex: 1,
        margin: 10,
    },
    listitem: {
        height: 100,
        margin: 10,
        flexDirection: 'row'
    },
    avatar: {
        height: 72,
        width: 72,
        borderRadius: 72 / 2
    },
    paddingHorizontal: {
        paddingHorizontal: 10
    },
    setFontSizeOne: {
        fontSize: 15 // Define font size here in Pixels
    },
    setFontSizeTwo: {
        fontSize: 20 // Define font size here in Pixels
    },
    setFontSizeThree: {
        fontSize: 25 // Define font size here in Pixels
    },
    setFontSizeFour: {
        fontSize: 30 // Define font size here in Pixels
    },
})