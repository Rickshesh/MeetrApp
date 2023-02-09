//import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native'
import { IconButton } from 'react-native-paper';
import { Camera, CameraType } from 'expo-camera'
import * as ImageManipulator from 'expo-image-manipulator';



export default function CameraModule({ _setPhoto, type }) {
    const [previewVisible, setPreviewVisible] = useState(false)
    const [capturedImage, setCapturedImage] = useState(null)
    const [cameraPermission, setCameraPermission] = useState(null)
    const [camera, setCamera] = useState(null);
    const [cameraType, setCameraType] = useState(CameraType.back);

    const permissionFunction = async () => {
        // here is how you can get the camera permission
        if (!cameraPermission) {
            const permission = await Camera.requestCameraPermissionsAsync();

            setCameraPermission(permission.status === 'granted');

            if (
                permission.status !== 'granted'
            ) {
                alert('Permission for camera needed.');
            }
        }

    };

    const flipCamera = () => {
        if (cameraType == CameraType.back) {
            setCameraType(CameraType.front);
        }
        else {
            setCameraType(CameraType.back);
        }
    }


    useEffect(() => {
        permissionFunction()
    }, [])

    const __takePicture = async () => {
        if (camera) {
            const photo = await camera.takePictureAsync()
            const file = await ImageManipulator.manipulateAsync(photo.uri, [], { compress: 0.1 });
            setPreviewVisible(true)
            setCapturedImage(file)
            _setPhoto(file, type)
        }
    }

    return (
        <View style={styles.container}>
            {((previewVisible && capturedImage)
                ? (
                    <CameraPreview photo={capturedImage} />
                )
                : (
                    <Camera
                        ref={(ref) => setCamera(ref)}
                        style={{ flex: 1, width: '100%' }}
                        type={cameraType}
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
                                        justifyContent: 'center',
                                        flexDirection: "row",
                                        alignItems: "center"
                                    }}
                                >
                                    <View style={{ flex: 1 }}></View>
                                    <View style={{ flex: 1, alignItems: "center" }}>
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
                                    <View style={{ flex: 1 }}>
                                        <IconButton icon="camera-flip-outline" style={{ backgroundColor: "white" }} onPress={() => flipCamera()} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Camera>
                ))
            }
        </View>
    )
}

const CameraPreview = ({ photo }) => {
    return (
        <>
            <Image source={{ uri: photo.uri }} style={{ flex: 1 }} />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    }
})
