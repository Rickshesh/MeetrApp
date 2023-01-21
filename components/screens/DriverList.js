import React, { useState } from 'react'
import { Surface, List, Portal, Modal, IconButton, Avatar, ActivityIndicator, Badge, Button, AnimatedFAB } from 'react-native-paper'
import { StyleSheet, ScrollView, Pressable, View, Image, Text, Linking, Dimensions } from 'react-native'
import MapService from '../supportComponents/MapService';

export default function DriverList({ navigation }) {

    const [isLoading, setLoading] = useState(true)
    const [driverList, setDriverList] = useState([])
    const [showLocation, setShowLocation] = useState({})

    const getUsers = async () => {

        fetch('https://ri6c0kl11e.execute-api.ap-south-1.amazonaws.com/beta/getuserlist') //S3 Link for Json
            .then((response) => response.json())
            .then(
                (data) => {
                    setDriverList(data.body);
                }
            )
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));

    }

    React.useEffect(() => {
        getUsers();
    }, [])

    const _setShowLocation = (driverId, value) => {
        setShowLocation({ ...showLocation, [driverId]: value });
    }


    return (
        <View style={styles.container}>

            {isLoading ? <Surface style={[styles.surface, { justifyContent: "center", alignItems: "center" }]}><ActivityIndicator animating={true} /></Surface> :
                (<Surface style={styles.surface} elevation={2}>

                    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={[styles.container]}>

                        {driverList.map((driver, index) => {
                            return (
                                <View key={index}>
                                    <Pressable onPress={() => navigation.navigate('Details', {
                                        driverid: driver.driverId
                                    })}
                                    >
                                        <Surface style={driver.activeStatus !== "Active" ? { height: 100, paddingHorizontal: 10, margin: 10, flexDirection: "row", backgroundColor: "#EFF1F3" } : { height: 100, paddingHorizontal: 10, margin: 10, flexDirection: "row", backgroundColor: "#FEF5D8" }} elevation={2}>
                                            <View style={{ flex: 1, margin: 5 }}>
                                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                                    <Image resizeMode="contain" style={styles.avatar} source={{ uri: driver.image.uri }} />
                                                </View>
                                            </View>
                                            <View style={{ flex: 2, margin: 5 }}>
                                                <View style={{ flex: 1, justifyContent: "center", paddingVertical: 5 }}>
                                                    <View style={{ flex: 2, justifyContent: "flex-end" }}>
                                                        <Text style={{ fontWeight: "500", fontSize: 20 }}>
                                                            {driver.firstName} {driver.lastName}
                                                        </Text>
                                                    </View>
                                                    <View style={{ flex: 1, justifyContent: "flex-end" }}>
                                                        <Text style={{ fontWeight: "300", fontSize: 15 }}>
                                                            Rs {driver.totalAmountPending} Pending
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1, margin: 5 }}>
                                                <View style={{ flex: 1, flexDirection: "row-reverse" }}>
                                                    <Badge style={driver.creditScore > 60 ? { alignSelf: "center", backgroundColor: "lightgreen" } : { alignSelf: "center", backgroundColor: "lightblue" }}></Badge>
                                                </View>
                                                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                                    <IconButton icon="map-marker-check" mode="contained" onPress={() => _setShowLocation(driver.driverId, !showLocation[driver.driverId])} />
                                                    <IconButton icon="phone-in-talk" mode="contained" onPress={() => Linking.openURL(`tel:${driver.phoneNumber}`)} />
                                                </View>
                                            </View>
                                        </Surface>
                                    </Pressable>
                                    {(Object.keys(showLocation).includes(driver.driverId) && showLocation[driver.driverId] == true) &&
                                        <Surface elevation={2} style={{ height: 200, margin: 10, }}>
                                            <MapService currentLocation={{ latitude: 28.539473, longitude: 77.188727 }} locationHistory={[{ latitude: 28.538529, longitude: 77.191254 }, { latitude: 28.537046, longitude: 77.195523 }]} style={{ flex: 1 }} icon="circle-slice-8" />
                                            <IconButton icon="chevron-up" onPress={() => _setShowLocation(driver.driverId, false)} style={{ position: "absolute", right: 2, top: 2, backgroundColor: "white", borderWidth: 0.5 }} />
                                        </Surface>}
                                </View>
                            )
                        })}

                    </ScrollView>
                    <View style={{ margin: 20 }}>
                        <Button mode="contained" onPress={() => navigation.navigate("Register")}>
                            Register Driver
                        </Button>
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