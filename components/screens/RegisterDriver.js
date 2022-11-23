import 'react-native-get-random-values';
import { Surface, List, Portal, Modal, IconButton, TextInput, Button } from 'react-native-paper'
import { StyleSheet, ScrollView, Pressable, View, Image, Text } from 'react-native'
import registerDriver from '../responses/registerDriver.json';
import React, { useEffect, useState } from 'react';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import CameraModule from '../supportComponents/CameraModule';
import { RNS3 } from 'react-native-upload-aws-s3';
import { v4 as uuidv4 } from 'uuid';
import { useSelector, useDispatch } from 'react-redux';
import { updateDriver } from "../actions/UserActions";
import { S3_ACCESS_KEY, S3_SECRET_KEY } from "@env";


//Image Link

const frontAadhaar = "frontAadhaar";
const backAadhaar = "backAadhaar"


export default function RegisterDriver({ navigation }) {
    const dispatch = useDispatch();
    const driver = useSelector((store) => store.driver);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [cameraType, setCameraType] = useState(null);


    const _updateDriver = (key, value) => {
        dispatch(updateDriver({ key, value }))
    }

    const onNext = async () => {
        console.log(driver);
        navigation.navigate('Bank');
    }

    const generateDriverId = () => {
        if (!driver.driver.driverID) {
            let driverID = uuidv4();
            _updateDriver("driverID", driverID)
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


    const uploadImageToS3 = async image => {
        const options = {
            keyPrefix: "driverimages/",
            bucket: "testbucketpiinfo",
            region: "ap-south-1",
            accessKey: S3_ACCESS_KEY,
            secretKey: S3_SECRET_KEY,
            successActionStatus: 201
        }

        const file = {
            uri: `${image.uri}`,
            name: image.uri.substring(image.uri.lastIndexOf('/') + 1), //extracting filename from image path
            type: "image/jpg",
        };

        try {
            const response = await RNS3.put(file, options)
            if (response.status === 201) {
                console.log("Success: ", response.body)
                /**
                 * {
                 *   postResponse: {
                 *     bucket: "your-bucket",
                 *     etag : "9f620878e06d28774406017480a59fd4",
                 *     key: "uploads/image.png",
                 *     location: "https://your-bucket.s3.amazonaws.com/uploads%2Fimage.png"
                 *   }
                 * }
                 */
            } else {
                console.log("Failed to upload image to S3: ", response)
            }
            return response;
        } catch (error) {
            console.log(error)
        }
    };


    return (
        <View style={styles.container}>
            <Surface style={styles.surface} elevation={2}>
                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ margin: 10 }}>
                    <List.Section style={styles.topSection}>
                        {(!driver.driver.image) ?
                            <Pressable onPress={() => _startCamera("image")} >
                                <IconButton size={24} icon="camera" style={styles.avatar} />
                            </Pressable> :
                            <Pressable onPress={() => _startCamera("image")} >
                                <Image source={{ uri: driver.driver.image.uri }} style={styles.avatar} />
                            </Pressable>
                        }
                        <Portal>
                            <Modal visible={cameraType !== null} onDismiss={_hideCamera} contentContainerStyle={styles.containerStyle}>
                                <CameraModule _setPhoto={(file, type) => _captureImage(file, type)} type={cameraType} />
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
                                    <TextInput value={driver.driver[key]} key={index}
                                        onChangeText={text => _updateDriver(key, text)}
                                        label={displayInfo.body.identityParameters[key].label} style={{ backgroundColor: "#FBFEFB" }} mode="outlined" />
                                )
                            })}
                            <TextInput label={displayInfo.body.exceptions.identityParameters.aadhaar.label} style={{ backgroundColor: "#FBFEFB" }} mode="outlined" />
                            <View style={styles.inlineElement}>
                                <View style={styles.inlineImage}>
                                    {typeof driver.driver.frontAadhaar === 'undefined' ?
                                        <>
                                            <IconButton size={24} icon="camera" style={styles.avatar} onPress={() => _startCamera(frontAadhaar)} />
                                            <Text variant="titleMedium">Aadhaar Front</Text>
                                        </> :
                                        <Pressable onPress={() => _startCamera(frontAadhaar)}><Image source={{ uri: driver.driver.frontAadhaar.uri }} resizeMode="contain" style={{ width: 144, height: 144 }} /></Pressable>
                                    }
                                </View>
                                <View style={styles.inlineImage}>
                                    {typeof driver.driver.backAadhaar === 'undefined' ?
                                        <>
                                            <IconButton size={24} icon="camera" style={styles.avatar} onPress={() => _startCamera(backAadhaar)} />
                                            <Text variant="titleMedium">Aadhaar Back</Text>
                                        </> :
                                        <Pressable onPress={() => _startCamera(backAadhaar)}><Image source={{ uri: driver.driver.backAadhaar.uri }} resizeMode="contain" style={{ width: 144, height: 144 }} /></Pressable>
                                    }
                                </View>
                            </View>
                            <List.Item title="Date" right={() => <Button mode="contained" color="#FBFEFB" textColor="black" onPress={() => _showDatePicker}> {(driver.driver.dateOfBirth) ? driver.driver.dateOfBirth.toString() : moment(new Date()).format("DD-MM-YYYY").toString()} </Button>} />
                            <DateTimePickerModal
                                isVisible={showDatePicker}
                                mode="date"
                                onConfirm={() => _handleConfirm}
                                onCancel={() => _hideDatePicker}
                            />
                        </Surface>
                    </List.Section>
                    <List.Section>
                        <Button icon="step-forward" style={styles.button} mode="contained" onPress={onNext}>
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
        borderRadius: 96 / 2,
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