import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { Camera, CameraType } from "expo-camera";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";

const RecordVideo = ({ _setVideo, _hideVideo, type, timeToFinish }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [camera, setCamera] = useState(null);

  const permissionFunction = async () => {
    if (!cameraPermission) {
      const permission = await Camera.requestCameraPermissionsAsync();
      const audioPermission = await Audio.requestPermissionsAsync();

      setCameraPermission(
        permission.status === "granted" && audioPermission.status === "granted"
      );

      if (permission.status !== "granted") {
        alert("Permission for camera needed.");
      }
    }
  };

  useEffect(() => {
    permissionFunction();
  }, []);

  const startRecording = async () => {
    if (camera) {
      try {
        setIsRecording(true);
        const video = await camera.recordAsync({
          quality: Camera.Constants.VideoQuality["480p"],
          maxDuration: timeToFinish ? timeToFinish : 20, // Set a max duration for the video, in seconds.
        });
        console.log("Video recorded: ", video.uri);
        const fileInfo = await FileSystem.getInfoAsync(video.uri);
        console.log("Video size:", fileInfo.size, "bytes");
        _hideVideo();
        _setVideo(video.uri, type);
      } catch (error) {
        console.error("Error recording video:", error);
      }
    }
  };

  function stopRecording() {
    if (camera) {
      setIsRecording(false);
      camera.stopRecording();
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else if (!isRecording) {
      await startRecording();
    }
  };

  const flipCamera = () => {
    console.log(cameraType);
    if (cameraType == CameraType.back) {
      setCameraType(CameraType.front);
    } else {
      setCameraType(CameraType.back);
    }
  };

  if (cameraPermission === null) {
    return <View />;
  }

  if (cameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
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
              top: 0,
              width: "100%",
              padding: 20,
              alignItems: "center",
            }}
          >
            {isRecording && (
              <Text variant="titleMedium" style={{ color: "black" }}>
                Recording...
              </Text>
            )}
          </View>
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
                <IconButton
                  onPress={toggleRecording}
                  icon="record-circle-outline"
                  size={24}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: isRecording ? "white" : "#f7772d",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                ></IconButton>
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
    </View>
  );
};

export default RecordVideo;
