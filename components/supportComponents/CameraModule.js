import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { IconButton } from "react-native-paper";
import { Camera, CameraType } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { Accelerometer } from "expo-sensors";

export default function CameraModule({ _setPhoto, type }) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [deviceOrientation, setDeviceOrientation] = useState("Unknown");

  const getRotationAngle = (orientation) => {
    switch (orientation) {
      case "PD":
        return 0;
      case "PU":
        return 180;
      case "LL":
        return -90;
      case "LR":
        return 90;
      default:
        return 0;
    }
  };

  const permissionFunction = async () => {
    // here is how you can get the camera permission
    if (!cameraPermission) {
      const permission = await Camera.requestCameraPermissionsAsync();

      setCameraPermission(permission.status === "granted");

      if (permission.status !== "granted") {
        alert("Permission for camera needed.");
      }
    }
  };

  const flipCamera = () => {
    if (cameraType == CameraType.back) {
      setCameraType(CameraType.front);
    } else {
      setCameraType(CameraType.back);
    }
  };

  useEffect(() => {
    permissionFunction();
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const _subscribe = () => {
    Accelerometer.setUpdateInterval(250); // sets the update interval to 250ms

    _subscription = Accelerometer.addListener((accelerometerData) => {
      const { x, y } = accelerometerData;

      if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) {
          setDeviceOrientation("LL");
        } else {
          setDeviceOrientation("LR");
        }
      } else {
        if (y > 0) {
          setDeviceOrientation("PD");
        } else {
          setDeviceOrientation("PU");
        }
      }
    });
  };

  const _unsubscribe = () => {
    _subscription && _subscription.remove();
    _subscription = null;
  };

  const __takePicture = async () => {
    console.log(Camera.Constants);
    let orientation = deviceOrientation;
    if (camera) {
      const photo = await camera.takePictureAsync({
        exif: true,
      });
      let rotationAngle = getRotationAngle(orientation);
      //console.log(photo.exif);
      const file = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ rotate: rotationAngle }],
        {
          compress: 0.1,
        }
      );
      setPreviewVisible(true);
      setCapturedImage(file);
      _setPhoto(file, type);
    }
  };

  return (
    <View style={styles.container}>
      {previewVisible && capturedImage ? (
        <CameraPreview photo={capturedImage} />
      ) : (
        <Camera
          ref={(ref) => setCamera(ref)}
          style={{ flex: 1, width: "100%" }}
          type={cameraType}
        >
          <View
            style={{
              flex: 1,
              width: "100%",
              backgroundColor: "transparent",
              flexDirection: "row",
            }}
          >
            <View
              style={{
                position: "absolute",
                bottom: 0,
                flexDirection: "row",
                flex: 1,
                width: "100%",
                padding: 20,
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  alignSelf: "center",
                  flex: 1,
                  justifyContent: "center",
                  flexDirection: "row",
                  alignItems: "center",
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
                      backgroundColor: "#fff",
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <IconButton
                    icon="camera-flip-outline"
                    style={{ backgroundColor: "white" }}
                    onPress={() => flipCamera()}
                  />
                </View>
              </View>
            </View>
          </View>
        </Camera>
      )}
    </View>
  );
}

const CameraPreview = ({ photo }) => {
  return (
    <>
      <Image
        source={{ uri: photo.uri }}
        style={{ flex: 1 }}
        resizeMode="contain"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
});
