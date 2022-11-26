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
    }, [])

    const displayInfo = driverDetailsConfig.displayInfo;


    return (
        <View style={styles.container}>
            {isLoading ? <ActivityIndicator animating={true} /> :
                (<Surface style={styles.surface} elevation={2}>
                    <Portal>
                        <Modal visible={showAddress} contentContainerStyle={styles.containerStyle} onDismiss={_hideAddress}>
                            <MapService lat={parseFloat(user.identityParameters.registerAddress.lat)} lon={parseFloat(user.identityParameters.registerAddress.lon)} />
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
                        <List.Section style={styles.topSection}>
                            <Pressable onPress={() => { showModal() }} >
                                <Image source={{ uri: user.identityParameters.image.uri }} style={styles.avatar} />
                                {console.log("URI is: " + user.identityParameters.image.uri)}
                            </Pressable>
                        </List.Section>
                        <List.Section>
                            <List.Subheader>
                                {displayInfo.head.identityParameters}
                            </List.Subheader>
                            {Object.keys(displayInfo.body.identityParameters).map((key, index) => {
                                return (
                                    <List.Item key={index} title={displayInfo.body.identityParameters[key]} description={user.identityParameters[key]} />
                                )
                            })}
                            <List.Item title={displayInfo.body.exceptions.identityParameters.aadhaar} description={user.identityParameters.aadhaar} right={props => <IconButton {...props} icon="smart-card" color="mediumblue" onPress={_showAadhaar} />} />

                            <List.Item title={displayInfo.body.exceptions.identityParameters.registerAddress} description={user.identityParameters.registerAddress.address} right={props => <IconButton {...props} icon="map-marker-check" color="mediumblue" onPress={_showAddress} />} />
                        </List.Section>
                        <List.Section>
                            <List.Subheader>
                                {displayInfo.head.bankingDetails}
                            </List.Subheader>
                            {Object.keys(displayInfo.body.bankingDetails).map((key, index) => {
                                return (
                                    < List.Item key={index} title={displayInfo.body.bankingDetails[key]} description={user.bankingDetails[key]} />
                                )
                            })}
                        </List.Section>
                        <List.Section>
                            <List.Subheader>
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
                        </List.Section>
                        <List.Section>
                            <List.Subheader>
                                {displayInfo.head.creditPerformance}
                            </List.Subheader>
                            {Object.keys(displayInfo.body.creditPerformance).map((key, index) => {
                                return (
                                    <List.Item key={index} title={displayInfo.body.creditPerformance[key]} description={user.creditPerformance[key]} />
                                )
                            })}
                        </List.Section>
                    </ScrollView>
                </Surface>
                )
            }
        </View>
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
        borderRadius: 96 / 2,
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
