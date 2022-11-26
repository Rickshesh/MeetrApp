import 'react-native-get-random-values';
import { Surface, List, Portal, Modal, IconButton, TextInput, Button } from 'react-native-paper'
import { StyleSheet, ScrollView, Pressable, View, Image, Text } from 'react-native'
import registerDriver from '../responses/registerDriver.json';
import React, { useEffect, useState } from 'react';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import CameraModule from '../supportComponents/CameraModule';
import { v4 as uuidv4 } from 'uuid';
import { useSelector, useDispatch } from 'react-redux';
import { updateDriver } from "../actions/UserActions";
import { updateDriverId } from "../actions/UserActions";
import { deleteDriverAttribute } from "../actions/UserActions";
import GetLocation from '../supportComponents/GetLocation';

//Image Link

const frontAadhaar = "frontAadhaar";
const backAadhaar = "backAadhaar"


export default function RegisterDriver({ navigation }) {
    const dispatch = useDispatch();
    const driver = useSelector((store) => store.driver.driver);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [cameraType, setCameraType] = useState(null);
    const [location, setLocation] = useState(false);

    const _getLocation = () => { setLocation(true) };

    const _updateDriver = (key, value) => {
        dispatch(updateDriver({ key, value }))
    }

    const _deleteDriverAttribute = (attribute) => {
        dispatch(deleteDriverAttribute(attribute))
    }

    const _getAddress = (location, address) => {
        let getAddressObj = {
            lat: location.latitude,
            lon: location.longitude,
            address
        }
        _updateDriver("registerAddress", getAddressObj);
    }

    const onNext = async () => {
        _updateDriver("dateOfOnboarding", moment(new Date()).format("DD-MM-YYYY").toString());
        _updateDriver("activeStatus", "pending");

        console.log(driver);
        navigation.navigate('Bank');
    }

    const generateDriverId = () => {
        if (!driver.driverId) {
            let driverID = uuidv4();
            updateDriverId("driverId", driverID)
        }
    }

    useEffect(() => {
        generateDriverId();
    }, [])

    const _showDatePicker = () => { setShowDatePicker(true) }
    const _hideDatePicker = () => { setShowDatePicker(false) }


    const _handleConfirm = (date) => {
        console.log("A date has been picked: ", date);
        _updateDriver("dateOfBirth", moment(date).format("DD-MM-YYYY"));
        _hideDatePicker();
    };

    const _captureImage = (file, type) => {
        let imageID = uuidv4();
        let imageObj = { id: imageID, uri: file.uri }
        _updateDriver(type, imageObj)
    }

    const _startCamera = (type) => { setCameraType(type) }
    const _hideCamera = () => { setCameraType(null) }

    const displayInfo = registerDriver.displayInfo;


    return (
        <View style={styles.container}>
            <Surface style={styles.surface} elevation={2}>
                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ margin: 10 }}>
                    {console.log(driver)}
                    <List.Section style={styles.topSection}>
                        {(!driver.identityParameters.image) ?
                            <Pressable onPress={() => _startCamera("image")} >
                                <IconButton size={24} icon="camera" style={styles.avatar} />
                            </Pressable> :
                            <Pressable onPress={() => _startCamera("image")} >
                                <Image source={{ uri: driver.identityParameters.image.uri }} style={styles.avatar} />
                            </Pressable>
                        }
                        <Portal>
                            <Modal visible={cameraType !== null} onDismiss={_hideCamera} contentContainerStyle={styles.containerStyle}>
                                <CameraModule _setPhoto={(file, type) => _captureImage(file, type)} type={cameraType} />
                            </Modal>
                            <Modal visible={location} onDismiss={() => setLocation(false)} contentContainerStyle={styles.containerStyle}>
                                <GetLocation _getAddress={_getAddress} />
                            </Modal>
                        </Portal>
                    </List.Section>
                    <List.Section>
                        <List.Subheader>
                            {displayInfo.head.identityParameters}
                        </List.Subheader>
                        <Surface>
                            {Object.keys(displayInfo.body.identityParameters).map((key, index) => {
                                return (
                                    <TextInput value={driver.identityParameters[key]} key={index}
                                        onChangeText={text => _updateDriver(key, text)}
                                        label={displayInfo.body.identityParameters[key].label} style={{ backgroundColor: "#FBFEFB" }} mode="outlined" />
                                )
                            })}
                            <TextInput label={displayInfo.body.exceptions.identityParameters.aadhaar.label} style={{ backgroundColor: "#FBFEFB" }} mode="outlined" onChangeText={text => _updateDriver("aadhaar", text)} />
                            <View style={styles.inlineElement}>
                                <View style={styles.inlineImage}>
                                    {typeof driver.identityParameters.frontAadhaar === 'undefined' ?
                                        <>
                                            <IconButton size={24} icon="camera" style={styles.avatar} onPress={() => _startCamera(frontAadhaar)} />
                                            <Text variant="titleMedium">Aadhaar Front</Text>
                                        </> :
                                        <Pressable onPress={() => _startCamera(frontAadhaar)}><Image source={{ uri: driver.identityParameters.frontAadhaar.uri }} resizeMode="contain" style={{ width: 144, height: 144 }} /></Pressable>
                                    }
                                </View>
                                <View style={styles.inlineImage}>
                                    {typeof driver.identityParameters.backAadhaar === 'undefined' ?
                                        <>
                                            <IconButton size={24} icon="camera" style={styles.avatar} onPress={() => _startCamera(backAadhaar)} />
                                            <Text variant="titleMedium">Aadhaar Back</Text>
                                        </> :
                                        <Pressable onPress={() => _startCamera(backAadhaar)}><Image source={{ uri: driver.identityParameters.backAadhaar.uri }} resizeMode="contain" style={{ width: 144, height: 144 }} /></Pressable>
                                    }
                                </View>
                            </View>
                            <List.Item title="Date" right={() => <Button mode="contained" color="#FBFEFB" textColor="black" onPress={_showDatePicker}> {(driver.identityParameters.dateOfBirth) ? driver.identityParameters.dateOfBirth.toString() : moment(new Date()).format("DD-MM-YYYY").toString()} </Button>} />
                            <DateTimePickerModal
                                isVisible={showDatePicker}
                                mode="date"
                                onConfirm={_handleConfirm}
                                onCancel={_hideDatePicker}
                            />
                            <List.Section>
                                <Button icon="map-marker" mode="contained" color="#FBFEFB" onPress={() => _getLocation()}>
                                    {driver.identityParameters.registerAddress &&
                                        <Text>{driver.identityParameters.registerAddress.address}</Text>
                                    }
                                    {!driver.identityParameters.registerAddress &&
                                        <Text>Get Address</Text>}
                                </Button>

                            </List.Section>
                        </Surface>
                    </List.Section>
                    <List.Section>
                        <Button icon="step-forward" mode="contained" onPress={onNext}>
                            Next
                        </Button>
                    </List.Section>
                </ScrollView>
            </Surface>
        </View >
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    surface: {
        flex: 1,
        margin: 10,
        paddingVertical: 10
    },
    "button": {
        flex: 0.5,
        alignSelf: "flex-end",
        marginHorizontal: 10,
        alignSelf: "stretch"
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
        borderColor: "#4C243B",
        borderWidth: 2,
        justifyContent: "center"
    },
    inlineImage: {
        width: 144,
        height: 144,
        marginHorizontal: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    inlineElement: {
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: 10,
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