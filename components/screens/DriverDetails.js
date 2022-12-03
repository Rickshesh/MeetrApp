import * as React from 'react'
import { Surface, List, Portal, Modal, IconButton, ActivityIndicator } from 'react-native-paper'
import { StyleSheet, ScrollView, Pressable, View, Text, Image } from 'react-native'
import driverDetailsConfig from '../responses/driverDetailsConfig.json';
import MapService from '../supportComponents/MapService';

export default function DriverDetails(props) {
    const [user, setUser] = React.useState([]);
    const [imageVisible, setImageVisible] = React.useState(false)
    const [startCamera, setStartCamera] = React.useState(false)
    const [showAddress, setShowAddress] = React.useState(false)
    const [showAadhaar, setShowAadhaar] = React.useState(false)
    const [showAutoFront, setShowAutoFront] = React.useState(false)
    const [showAutoBack, setShowAutoBack] = React.useState(false)
    const [isLoading, setLoading] = React.useState(true)

    const showModal = () => setImageVisible(true)
    const hideModal = () => setImageVisible(false)

    const _showAddress = () => setShowAddress(true)
    const _hideAddress = () => setShowAddress(false)

    const _showAadhaar = () => setShowAadhaar(true)
    const _hideAadhaar = () => setShowAadhaar(false)

    const _showAutoFront = () => setShowAutoFront(true)
    const _hideAutoFront = () => setShowAutoFront(false)

    const _showAutoBack = () => setShowAutoBack(true)
    const _hideAutoBack = () => setShowAutoBack(false)



    const getUserDetails = (driverid) => {
        fetch('https://ri6c0kl11e.execute-api.ap-south-1.amazonaws.com/beta/getuser/?driverid=' + driverid.toString()) //S3 Link for Json
            .then((response) => response.json())
            .then((json) => {
                setUser(json)
                console.log(json)
            })
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }

    const __setStartCamera = () => {
        setStartCamera(!startCamera)
    }

    //To fetch the API, pass the User ID
    React.useEffect(() => {
        setLoading(true);
        console.log(props.route.params.driverid)
        getUserDetails(props.route.params.driverid);
        console.log(props.navigation.getState());
    }, [])

    const displayInfo = driverDetailsConfig.displayInfo;


    return (
        <View style={styles.container}>
            {isLoading ? <Surface style={[styles.surface, { justifyContent: "center", alignItems: "center" }]}><ActivityIndicator animating={true} /></Surface> :
                (<Surface style={styles.surface} elevation={2}>
                    <Portal>
                        <Modal visible={showAddress} contentContainerStyle={styles.containerStyle} onDismiss={_hideAddress}>
                            <MapService currentLocation={{ latitude: parseFloat(user.identityParameters.registerAddress.lat), longitude: parseFloat(user.identityParameters.registerAddress.lon) }} />
                        </Modal>
                        <Modal visible={showAadhaar} contentContainerStyle={styles.containerStyle} onDismiss={_hideAadhaar}>
                            <Image source={{ uri: user.identityParameters.frontAadhaar.uri }} style={styles.modalImageStyle} />
                            <Image source={{ uri: user.identityParameters.backAadhaar.uri }} style={styles.modalImageStyle} />
                        </Modal>
                        <Modal visible={imageVisible} onDismiss={hideModal} contentContainerStyle={styles.containerStyle}>
                            <Image source={{ uri: user.identityParameters.image.uri }} style={styles.modalImageStyle} />
                        </Modal>
                        <Modal visible={showAutoFront} onDismiss={_hideAutoFront} contentContainerStyle={styles.containerStyle}>
                            <Image source={{ uri: user.autoDetails.frontAuto.uri }} style={styles.modalImageStyle} />
                        </Modal>
                        <Modal visible={showAutoBack} onDismiss={_hideAutoBack} contentContainerStyle={styles.containerStyle}>
                            <Image source={{ uri: user.autoDetails.backAuto.uri }} style={styles.modalImageStyle} />
                        </Modal>
                    </Portal>
                    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                        <View>
                            <Surface elevation={2} style={user.activeStatus !== "Active" ? { alignItems: 'center', backgroundColor: "#EFF1F3", margin: 10, flexDirection: "row" } : { alignItems: 'center', backgroundColor: "#FEF5D8", margin: 10, flexDirection: "row" }}>
                                <View style={{ flex: 1 }}>

                                </View>
                                <View style={{ flex: 1, alignItems: "center" }}>
                                    <Pressable onPress={() => { showModal() }} >
                                        <Image source={{ uri: user.identityParameters.image.uri }} style={styles.avatar} />
                                    </Pressable>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flex: 1, alignItems: "flex-end", paddingHorizontal: 10 }}>
                                        <Text style={user.activeStatus == "Pending" ? { color: "red", fontSize: 15, fontWeight: "600" } : { color: "green", fontSize: 15, fontWeight: "600" }}>{user.activeStatus}</Text>
                                    </View>
                                    <View style={{ flex: 1, alignItems: "flex-end", justifyContent: "flex-end", paddingHorizontal: 10 }}>
                                        <IconButton icon="phone-in-talk" mode="contained" onPress={() => Linking.openURL(`tel:${user.identityParameters.phoneNumber}`)} />
                                    </View>
                                </View>
                            </Surface>
                            <Surface elevation={2} style={{ height: 200, margin: 10, }}>
                                <MapService currentLocation={{ latitude: 28.539473, longitude: 77.188727 }} locationHistory={[{ latitude: 28.538529, longitude: 77.191254 }, { latitude: 28.537046, longitude: 77.195523 }]} style={{ flex: 1 }} icon="circle-slice-8" />
                            </Surface>
                        </View>
                        <Surface elevation={2} style={{ margin: 10 }}>
                            <List.Subheader style={{ fontSize: 18 }}>
                                {displayInfo.head.identityParameters}
                            </List.Subheader>
                            {Object.keys(displayInfo.body.identityParameters).map((key, index) => {
                                return (
                                    <List.Item key={index} title={displayInfo.body.identityParameters[key]} description={user.identityParameters[key]} />
                                )
                            })}
                            <List.Item title={displayInfo.body.exceptions.identityParameters.aadhaar} description={user.identityParameters.aadhaar} right={props => <IconButton {...props} icon="smart-card" color="mediumblue" onPress={_showAadhaar} />} />

                            <List.Item title={displayInfo.body.exceptions.identityParameters.registerAddress} description={user.identityParameters.registerAddress.address} right={props => <IconButton {...props} icon="map-marker-check" color="mediumblue" onPress={_showAddress} />} />
                        </Surface>
                        <Surface elevation={2} style={{ margin: 10 }}>
                            <List.Subheader style={{ fontSize: 18 }}>
                                {displayInfo.head.bankingDetails}
                            </List.Subheader>
                            {Object.keys(displayInfo.body.bankingDetails).map((key, index) => {
                                return (
                                    < List.Item key={index} title={displayInfo.body.bankingDetails[key]} description={user.bankingDetails[key]} />
                                )
                            })}
                        </Surface>
                        <Surface elevation={2} style={{ margin: 10 }}>
                            <List.Subheader style={{ fontSize: 18 }}>
                                {displayInfo.head.autoDetails}
                            </List.Subheader>
                            {Object.keys(displayInfo.body.autoDetails).map((key, index) => {
                                return (

                                    <List.Item key={index} title={displayInfo.body.autoDetails[key]} description={user.autoDetails[key]} />
                                )
                            })}
                            <List.Item title={displayInfo.body.exceptions.autoDetails.autoImages} />
                            <View style={styles.inlineElement}>
                                <Pressable onPress={_showAutoFront}><Image source={{ uri: user.autoDetails.frontAuto.uri }} style={styles.inlineImage} /></Pressable>
                                <Pressable onPress={_showAutoBack}><Image source={{ uri: user.autoDetails.backAuto.uri }} style={styles.inlineImage} /></Pressable>
                            </View>
                        </Surface>
                        {user.creditPerformance && (
                            <Surface elevation={2} style={{ margin: 10 }}>
                                <List.Subheader style={{ fontSize: 18 }}>
                                    {displayInfo.head.creditPerformance}
                                </List.Subheader>
                                {Object.keys(displayInfo.body.creditPerformance).map((key, index) => {
                                    return (
                                        (<List.Item key={index} title={displayInfo.body.creditPerformance[key]} description={user.creditPerformance[key]} />)
                                    )
                                })}
                            </Surface>
                        )}

                    </ScrollView>
                </Surface>
                )
            }
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    surface: {
        flex: 1,
        margin: 10
    },
    title: {
        fontSize: 16,
        color: '#A4919B'
    },
    description: {
        fontSize: 18
    },
    topSection: {
        backgroundColor: '#FAF9F9',
        alignItems: 'center',
        padding: 5
    },
    avatar: {
        width: 96,
        height: 96,
    },
    inlineImage: {
        width: 144,
        height: 144,
        resizeMode: 'contain'
    },
    inlineElement: {
        flexDirection: "row",
        justifyContent: "space-around"
    },
    containerStyle: {
        flex: 0.75,
        margin: 10,
        backgroundColor: 'white'
    },
    modalImageStyle: {
        flex: 1,
        resizeMode: 'contain'
    },
    cameraButtonStyle: {
        backgroundColor: 'white',
        position: 'absolute',
        top: 0,
        right: 0
    }
})
