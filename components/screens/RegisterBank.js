import { StyleSheet, ScrollView, View } from 'react-native'
import { Surface, List, TextInput, Button, Text, Portal, Dialog, Paragraph } from 'react-native-paper'
import registerDriver from '../responses/registerDriver.json';
import { useSelector, useDispatch } from 'react-redux';
import { updateBankDetails, resetDriver, updateImages } from "../actions/UserActions";
import { S3_ACCESS_KEY, S3_SECRET_KEY, REGISTER_DRIVER_API } from "@env";
import imagesUploadDriver from "../responses/imagesUploadDriver.json";
import React, { useState } from 'react';
import { RNS3 } from 'react-native-upload-aws-s3';


//RegisterBank is the Second Screen in Registeration Flow, inside Stack Navigator
//It helps collect the details regarding the bank account of the driver
//It stores everything inside Store, for global access
//It uploads the photos of Auto to S3 Bucket

export default function RegisterBank({ navigation }) {

    const dispatch = useDispatch();
    const driver = useSelector((store) => store.driver.driver);

    const [submitLoading, setSubmitLoading] = useState(false);
    const [showFail, setShowFail] = useState(false);


    const displayInfo = registerDriver.displayInfo;

    const _updateBankDetails = (key, value) => {
        dispatch(updateBankDetails({ key, value }))
    }

    const onPrevious = async () => {
        navigation.navigate('Driver');
    }
    /*
        const onNext = async () => {
            console.log(driver);
            navigation.navigate('Auto');
        }
    */

    const onSubmit = async () => {
        setSubmitLoading(true);
        await uploadImagesBank(driver);
        console.log(driver);
        let response = await registerDriverAPI(driver);
        setSubmitLoading(false);

        if (response && response.driverId) {
            console.log("Response" + response.body);
            dispatch(resetDriver());
            navigateOnSubmit(response);
        }
        else {
            setShowFail(true);
        }
    }

    const navigateOnSubmit = (response) => {
        console.log(navigation.getState());
        navigation.reset({
            index: 0,
            routes: [{ name: 'List' }]
        });
    }

    const uploadImagesBank = async (input) => {

        try {
            return await Promise.all((imagesUploadDriver.imageFields.identityParameters).map(
                async key => {
                    console.log(input.identityParameters);
                    let response = await uploadImageToS3(input.identityParameters[key]);
                    //Update Image at Redux Store
                    dispatch(updateImages({ keyobject: "identityParameters", keyarray: key, imageuri: response.body.postResponse.location }))
                    return response;
                }
            ))
        }
        catch (err) {
            console.log(err);
        }

    };

    const registerDriverAPI = async (data) => {

        try {
            let response = await fetch(REGISTER_DRIVER_API, {
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
        catch (err) {
            return err;
        }
    }


    return (
        <View style={styles.container}>
            <Surface style={styles.surface} elevation={2}>
                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ margin: 10 }}>
                    <Portal>
                        <Dialog visible={showFail} onDismiss={() => setShowFail(false)}>
                            <Dialog.Content>
                                <Paragraph>Registeration Failed !! </Paragraph>
                                <Paragraph>Please Retry Later</Paragraph>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={() => { }}>Ok</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                    <List.Section>
                        <List.Subheader>
                            <Text variant='titleSmall'>{displayInfo.head.bankingDetails}</Text>
                        </List.Subheader>
                        <View>
                            {Object.keys(displayInfo.body.bankingDetails).map((key, index) => {
                                return (
                                    <View key={index}>
                                        <TextInput label={displayInfo.body.bankingDetails[key].label}
                                            keyboardType={displayInfo.body.bankingDetails[key].format == "number" ? "numeric" : "default"}
                                            value={driver.bankingDetails[key]}
                                            onChangeText={text => _updateBankDetails(key, text)}
                                            style={{ backgroundColor: "#FBFEFB" }} mode="outlined" />
                                    </View>
                                )
                            })}
                        </View>
                    </List.Section>
                    <List.Section flexDirection="row">
                        <Button icon="step-backward" style={styles.button} mode="contained" onPress={onPrevious}>
                            Previous
                        </Button>
                        <Button icon="step-forward" style={styles.button} mode="contained" loading={submitLoading} onPress={onSubmit}>
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
