import { Surface, List, Portal, Modal, IconButton, TextInput, Button, Avatar, Text } from 'react-native-paper'
import { StyleSheet, ScrollView, Pressable, View, Image } from 'react-native'
import registerDriver from '../responses/registerDriver.json';
import React, { useEffect, useRef, useState } from 'react';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import CameraModule from '../supportComponents/CameraModule';




export default function RegisterDriver() {
    const [selectedDate, setSelectedDate] = useState(moment(new Date()).format("DD-MM-YYYY"));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startCamera, setStartCamera] = useState(false);

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
                        <Pressable onPress={_startCamera} >
                            <IconButton size={24} icon="camera" style={styles.avatar} />
                        </Pressable>
                        <Portal>
                            <Modal visible={startCamera} onDismiss={_hideCamera} contentContainerStyle={styles.containerStyle}>
                                <CameraModule />
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
                        <Button icon="step-forward" style={styles.button} mode="contained" onPress={() => console.log('Pressed')}>
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
        width: "50%",
        alignSelf: "flex-end",
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
        backgroundColor: "rgb(158, 42, 155)"
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
