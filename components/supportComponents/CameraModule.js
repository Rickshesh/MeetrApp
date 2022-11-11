import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, ImageBackground, Alert } from 'react-native'
import { Camera } from 'expo-camera'

export default function CameraModule() {
    const [previewVisible, setPreviewVisible] = React.useState(false)
    const [capturedImage, setCapturedImage] = React.useState(null)

    useEffect(() => async () => {
        const { status } = await Camera.requestCameraPermissionsAsync()
        if (status === 'granted') {
            // start the camera
            console.log('Permission given')
        } else {
            Alert.alert('Access denied')
        }
    }, [])

    const __takePicture = async () => {
        if (!Camera) return
        const photo = await Camera.takePictureAsync()
        console.log(photo)
        setPreviewVisible(true)
        setCapturedImage(photo)
    }

    return (
        <View style={styles.container}>
            {((previewVisible && capturedImage)
                ? (
                    <CameraPreview photo={capturedImage} />
                )
                : (
                    <Camera
                        style={{ flex: 1, width: '100%' }}
                    >
                        <View
                            style={{
                                flex: 1,
                                width: '100%',
                                backgroundColor: 'transparent',
                                flexDirection: 'row'
                            }}
                        >
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    flexDirection: 'row',
                                    flex: 1,
                                    width: '100%',
                                    padding: 20,
                                    justifyContent: 'space-between'
                                }}
                            >
                                <View
                                    style={{
                                        alignSelf: 'center',
                                        flex: 1,
                                        alignItems: 'center'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={__takePicture}
                                        style={{
                                            width: 70,
                                            height: 70,
                                            bottom: 0,
                                            borderRadius: 50,
                                            backgroundColor: '#fff'
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </Camera>
                ))
            }

            <StatusBar style="auto" />
        </View>
    )
}

const CameraPreview = (photo) => {
    console.log('sdsfds', photo)
    return (
        <View
            style={{
                backgroundColor: 'transparent',
                flex: 1,
                width: '100%',
                height: '100%'
            }}
        >
            <ImageBackground
                source={{ uri: photo && photo.uri }}
                style={{
                    flex: 1
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    }
})
