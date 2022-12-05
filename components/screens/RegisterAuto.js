import { StyleSheet, ScrollView, View, Pressable, Image } from 'react-native'
import { Surface, List, TextInput, Button, IconButton, Text, Portal, Modal } from 'react-native-paper'
import registerDriver from '../responses/registerDriver.json';
import { useSelector, useDispatch } from 'react-redux';
import React, { useState } from 'react';
import CameraModule from '../supportComponents/CameraModule';
import { v4 as uuidv4 } from 'uuid';
import { updateAutoDetails, updateImages, resetDriver } from "../actions/UserActions";
import imagesUploadFields from "../responses/imagesUploadFields.json";
import { S3_ACCESS_KEY, S3_SECRET_KEY } from "@env";
import { RNS3 } from 'react-native-upload-aws-s3';


const frontAuto = "frontAuto";
const backAuto = "backAuto"


export default function RegisterBank({ navigation }) {

    const [cameraType, setCameraType] = useState(null);

    const dispatch = useDispatch();
    const driver = useSelector((store) => store.driver.driver);

    const displayInfo = registerDriver.displayInfo;

    const _startCamera = (type) => { setCameraType(type) }
    const _hideCamera = () => { setCameraType(null) }

    const _updateAutoDetails = (key, value) => {
        dispatch(updateAutoDetails({ key, value }))
    }

    const onPrevious = async () => {
        navigation.navigate('Bank');
    }

    const onSubmit = async () => {

        await uploadImages_v2(driver);
        console.log(driver);
        let response = await registerDriverAPI(driver);
        console.log("Response" + JSON.stringify(response));
        dispatch(resetDriver());


        console.log(navigation.getState());
        navigation.reset({
            index: 0,
            routes: [{ name: 'Details', params: { driverid: response.driverId } }]
        });


    }

    const _captureImage = (file, type) => {
        let imageID = uuidv4();
        let imageObj = { id: imageID, uri: file.uri }
        _updateAutoDetails(type, imageObj)
    }

    const uploadImages_v2 = async (input) => {

        try {
            await Promise.all(Object.keys(imagesUploadFields.imageFields).map(
                async keyobject => {
                    return await Promise.all(imagesUploadFields.imageFields[keyobject].map(
                        async keyarray => {
                            let response = await uploadImageToS3(input[keyobject][keyarray]);
                            dispatch(updateImages({ keyobject, keyarray, imageuri: response.body.postResponse.location }))
                            return response;
                        }
                    ))
                }
            )
            )

        }
        catch (err) {
            console.log(err)
        }

    };

    const registerDriverAPI = async (data) => {
        let response = await fetch("https://84qnnnkedj.execute-api.ap-south-1.amazonaws.com/beta/create", {
            method: "PUT",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        console.log("Response: " + JSON.stringify(response));

        return response.json();
    }


    return (
        <View style={styles.container}>
            <Surface style={styles.surface} elevation={2}>
                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ margin: 10 }}>
                    <Portal>
                        <Modal visible={cameraType !== null} onDismiss={_hideCamera} contentContainerStyle={styles.containerStyle}>
                            <CameraModule _setPhoto={(file, type) => _captureImage(file, type)} type={cameraType} />
                        </Modal>
                    </Portal>
                    <List.Section>
                        <List.Subheader>
                            <Text variant='titleSmall'>{displayInfo.head.autoDetails}</Text>
                        </List.Subheader>
                        <View>
                            {Object.keys(displayInfo.body.autoDetails).map((key, index) => {
                                return (
                                    <TextInput key={index}
                                        value={driver.autoDetails[key]}
                                        onChangeText={text => _updateAutoDetails(key, text)}
                                        label={displayInfo.body.autoDetails[key].label} style={{ backgroundColor: "#FBFEFB" }} mode="outlined" />
                                )
                            })}
                            <View style={styles.inlineElement}>
                                <View style={styles.inlineImage}>
                                    {typeof driver.autoDetails.frontAuto === 'undefined' ?
                                        <>
                                            <IconButton size={24} icon="camera" style={styles.avatar} onPress={() => _startCamera(frontAuto)} />
                                            <Text variant="titleSmall">Auto Front</Text>
                                        </> :
                                        <Pressable onPress={() => _startCamera(frontAuto)}><Image source={{ uri: driver.autoDetails.frontAuto.uri }} resizeMode="contain" style={{ width: 144, height: 144 }} /></Pressable>
                                    }
                                </View>
                                <View style={styles.inlineImage}>
                                    {typeof driver.autoDetails.backAuto === 'undefined' ?
                                        <>
                                            <IconButton size={24} icon="camera" style={styles.avatar} onPress={() => _startCamera(backAuto)} />
                                            <Text variant="titleSmall">Auto Back</Text>
                                        </> :
                                        <Pressable onPress={() => _startCamera(backAuto)}><Image source={{ uri: driver.autoDetails.backAuto.uri }} resizeMode="contain" style={{ width: 144, height: 144 }} /></Pressable>
                                    }
                                </View>
                            </View>
                        </View>
                    </List.Section>
                    <List.Section flexDirection="row">
                        <Button icon="step-backward" style={styles.button} mode="contained" onPress={onPrevious}>
                            Previous
                        </Button>
                        <Button icon="step-forward" style={styles.button} mode="contained" onPress={onSubmit}>
                            Submit
                        </Button>
                    </List.Section>
                </ScrollView>
            </Surface>
        </View>
    )
}

const uploadImageToS3 = async image => {

    const options = {
        keyPrefix: "registerDriverImages/",
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
        } else {
            console.log("Failed to upload image to S3: ", response)
        }
        return response;
    } catch (error) {
        console.log(error)
    }
};



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
