import { Surface, List, Portal, Modal, IconButton, TextInput, Button, Avatar, Text } from 'react-native-paper'
import { StyleSheet, ScrollView, Pressable, View, Image } from 'react-native'
import registerDriver from '../responses/registerDriver.json';
import React, { useState } from 'react';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import CameraModule from '../supportComponents/CameraModule';
import { RNS3 } from 'react-native-aws3';


export default function RegisterDriver({ navigation }) {
    const [selectedDate, setSelectedDate] = useState(moment(new Date()).format("DD-MM-YYYY"));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startCamera, setStartCamera] = useState(false);
    const [photo, setPhoto] = useState(null);

    const uploadImageToS3 = async image => {
        const options = {
            keyPrefix: "driverimages/",
            bucket: "testbucketpiinfo",
            region: "ap-south-1",
            accessKey: "AKIA6EGOGYNI4FOFDT6E",
            secretKey: "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",
            successActionStatus: 201
        }

        console.log(image);

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
        } catch (error) {
            console.log(error)
        }
    };


    const _showDatePicker = () => { setShowDatePicker(true) }
    const _hideDatePicker = () => { setShowDatePicker(false) }
    const _handleConfirm = (date) => {
        console.log("A date has been picked: ", date);
        setSelectedDate(moment(date).format("DD-MM-YYYY"));
        _hideDatePicker();
    };

    const _startCamera = () => {
        setStartCamera(true);
    }

    const _hideCamera = () => {
        setStartCamera(false);
    }

    const displayInfo = registerDriver.displayInfo;


    return (
        <View style={styles.container}>
            <Surface style={styles.surface} elevation={2}>
                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ margin: 10 }}>
                    <List.Section style={styles.topSection}>
                        {!photo ?
                            <Pressable onPress={_startCamera} >
                                <IconButton size={24} icon="camera" style={styles.avatar} />
                            </Pressable> :
                            <Pressable onPress={_startCamera} >
                                <Image source={{ uri: photo.uri }} style={styles.avatar} />
                            </Pressable>
                        }
                        <Portal>
                            <Modal visible={startCamera} onDismiss={_hideCamera} contentContainerStyle={styles.containerStyle}>
                                <CameraModule _setPhoto={setPhoto} />
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
                                    <TextInput key={index} label={displayInfo.body.identityParameters[key].label} style={{ backgroundColor: "#FBFEFB" }} mode="outlined" />
                                )
                            })}
                            <List.Item title="Date" right={props => <Button mode="contained" color="#FBFEFB" textColor="black" onPress={_showDatePicker}> {selectedDate.toString()} </Button>} />
                            <DateTimePickerModal
                                isVisible={showDatePicker}
                                mode="date"
                                onConfirm={_handleConfirm}
                                onCancel={_hideDatePicker}
                            />
                        </Surface>
                    </List.Section>
                    <List.Section>
                        <Button icon="step-forward" style={styles.button} mode="contained" onPress={() => { navigation.navigate('Bank'); uploadImageToS3(photo) }}>
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
        margin: 10
    },
    "button": {
        flex: 0.5,
        alignSelf: "flex-end",
        marginHorizontal: 10
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
