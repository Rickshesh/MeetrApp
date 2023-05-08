import {
  Surface,
  Portal,
  Modal,
  IconButton,
  Text,
  TextInput,
  Button,
} from "react-native-paper";
import { StyleSheet, ScrollView, Pressable, View, Image } from "react-native";
import RecordVideo from "../supportComponents/RecordVideo";
import QRCodeScanner from "../supportComponents/QRCodeScanner";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import ErrorDialog from "./ErrorDialog";
import CameraModule from "../supportComponents/CameraModule";
import { updateAutoDetails, retrieveAutoDetails } from "../actions/UserActions";
import { v4 as uuidv4 } from "uuid";
import MapService from "../supportComponents/MapService";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const frontVehicleView = "frontVehicleView";
const backVehicleView = "backVehicleView";
const leftVehicleView = "leftVehicleView";
const rightVehicleView = "rightVehicleView";

export default function RegisterAddress({ navigation }) {
  const [recordVideo, setRecordVideo] = useState(false);
  const driver = useSelector((store) => store.driver.driver);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mockLocation, setMockLocation] = useState(false);
  const [cameraType, setCameraType] = useState(null);
  const [showQRScan, setShowQRScan] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [updatingLocationLoading, setUpdatingLocationLoading] = useState(false);
  const dispatch = useDispatch();

  const _updateVehicle = (key, value) => {
    dispatch(updateAutoDetails({ key, value }));
  };

  const _hideVideo = () => {
    setRecordVideo(false);
  };

  const _startCamera = (type) => {
    setCameraType(type);
  };

  const _hideCamera = () => {
    setCameraType(null);
  };

  const _startQRScan = () => {
    setShowQRScan(true);
  };

  const _hideQRScan = () => {
    setShowQRScan(false);
  };

  const onSubmit = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "List",
        },
      ],
    });
    //console.log("Submitted");
  };

  const onSave = async () => {
    try {
      await AsyncStorage.setItem("auto_id", JSON.stringify(driver.autoDetails));
      console.log("Data Saved");
      console.log(driver.autoDetails);
    } catch (err) {
      console.log(err);
    }
  };

  const _captureImage = (file, type) => {
    let imageID = uuidv4();
    let imageObj = { id: imageID, uri: file.uri };
    _updateVehicle(type, imageObj);
  };

  const _captureQRScan = (data) => {
    _updateVehicle("deviceId", data);
  };

  const getCurrentLocation = async () => {
    setUpdatingLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log(status);

      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
      });
      if (location) {
        _updateVehicle("location", location);
        setMockLocation(location.mocked);
      }
    } catch (err) {
      console.log(err);
    }
    setUpdatingLocationLoading(false);
  };

  const retrieveSavedData = async () => {
    try {
      let data = await AsyncStorage.getItem("auto_id");
      if (data) {
        console.log("Retrieving Stored Details");
        dispatch(retrieveAutoDetails(JSON.parse(data)));
        console.log(data);
      } else {
        getCurrentLocation();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const checkFields = (driver) => {
    {
      if (
        !mockLocation &&
        driver.autoDetails.frontVehicleView &&
        driver.autoDetails.rightVehicleView &&
        driver.autoDetails.backVehicleView &&
        driver.autoDetails.leftVehicleView &&
        driver.autoDetails.vehicleRegisterationNumber &&
        driver.autoDetails.vehicleRegisterationNumber != "" &&
        driver.autoDetails.deviceId &&
        driver.autoDetails.location
      ) {
        setSubmitDisabled(false);
      } else {
        setSubmitDisabled(true);
      }
    }
  };

  useEffect(() => {
    retrieveSavedData();
  }, []);

  useEffect(() => {
    console.log(driver);
    checkFields(driver);
  }, [driver]);

  return (
    <View style={styles.container}>
      <Portal>
        <Modal
          visible={recordVideo}
          onDismiss={_hideVideo}
          contentContainerStyle={styles.containerStyle}
        >
          <RecordVideo
            _setVideo={(file, type) => _captureVideo(file, type)}
            _hideVideo={_hideVideo}
            type={recordVideo}
          />
        </Modal>
        <Modal
          visible={cameraType !== null}
          onDismiss={_hideCamera}
          contentContainerStyle={styles.containerStyle}
        >
          <CameraModule
            _setPhoto={(file, type) => _captureImage(file, type)}
            type={cameraType}
          />
        </Modal>
        <Modal
          visible={showQRScan}
          onDismiss={_hideQRScan}
          contentContainerStyle={styles.containerStyle}
        >
          <QRCodeScanner
            _setQRScan={(data) => _captureQRScan(data)}
            _hideScanner={_hideQRScan}
          />
        </Modal>
      </Portal>
      <ErrorDialog
        visible={errorDialogVisible}
        hideDialog={() => setErrorDialogVisible(false)}
        errorMessage={errorMessage}
      />
      <Surface style={styles.surface} elevation={2}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ margin: 10 }}
        >
          <View>
            <Text style={{ fontWeight: "700", fontSize: 16 }}>
              Vehicle Details
            </Text>
          </View>
          <View
            style={{
              marginVertical: 10,
              padding: 10,
              backgroundColor: "#FAF9F9",
              borderRadius: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "space-between",
                }}
              >
                <View style={{ alignItems: "center", marginTop: 5 }}>
                  {driver.autoDetails.frontVehicleView ? (
                    <View
                      style={{
                        width: 72,
                        height: 72,
                        borderWidth: 2,
                      }}
                    >
                      <Pressable onPress={() => _startCamera(frontVehicleView)}>
                        <Image
                          source={{
                            uri: driver.autoDetails.frontVehicleView.uri,
                          }}
                          style={{ height: "100%" }}
                          resizeMode="contain"
                        />
                      </Pressable>
                    </View>
                  ) : (
                    <IconButton
                      size={30}
                      icon="camera-outline"
                      style={styles.avatar}
                      onPress={() => _startCamera(frontVehicleView)}
                    />
                  )}
                </View>
                <View style={{ alignItems: "center", marginBottom: 5 }}>
                  <Text style={{ fontWeight: "600" }}>Front</Text>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "space-between",
                }}
              >
                <View style={{ alignItems: "center", marginTop: 5 }}>
                  {driver.autoDetails.rightVehicleView ? (
                    <View
                      style={{
                        width: 72,
                        height: 72,
                        borderWidth: 2,
                      }}
                    >
                      <Pressable onPress={() => _startCamera(rightVehicleView)}>
                        <Image
                          source={{
                            uri: driver.autoDetails.rightVehicleView.uri,
                          }}
                          style={{ height: "100%" }}
                          resizeMode="contain"
                        />
                      </Pressable>
                    </View>
                  ) : (
                    <IconButton
                      size={30}
                      icon="camera-outline"
                      style={styles.avatar}
                      onPress={() => _startCamera(rightVehicleView)}
                    />
                  )}
                </View>
                <View style={{ alignItems: "center", marginBottom: 5 }}>
                  <Text style={{ fontWeight: "600" }}>Right</Text>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "space-between",
                }}
              >
                <View style={{ alignItems: "center", marginTop: 5 }}>
                  {driver.autoDetails.backVehicleView ? (
                    <View
                      style={{
                        width: 72,
                        height: 72,
                        borderWidth: 2,
                      }}
                    >
                      <Pressable onPress={() => _startCamera(backVehicleView)}>
                        <Image
                          source={{
                            uri: driver.autoDetails.backVehicleView.uri,
                          }}
                          style={{ height: "100%" }}
                          resizeMode="contain"
                        />
                      </Pressable>
                    </View>
                  ) : (
                    <IconButton
                      size={30}
                      icon="camera-outline"
                      style={styles.avatar}
                      onPress={() => _startCamera(backVehicleView)}
                    />
                  )}
                </View>
                <View style={{ alignItems: "center", marginBottom: 5 }}>
                  <Text style={{ fontWeight: "600" }}>Back</Text>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "space-between",
                }}
              >
                <View style={{ alignItems: "center", marginTop: 5 }}>
                  {driver.autoDetails.leftVehicleView ? (
                    <View
                      style={{
                        width: 72,
                        height: 72,
                        borderWidth: 2,
                      }}
                    >
                      <Pressable onPress={() => _startCamera(leftVehicleView)}>
                        <Image
                          source={{
                            uri: driver.autoDetails.leftVehicleView.uri,
                          }}
                          style={{ height: "100%" }}
                          resizeMode="contain"
                        />
                      </Pressable>
                    </View>
                  ) : (
                    <IconButton
                      size={30}
                      icon="camera-outline"
                      style={styles.avatar}
                      onPress={() => _startCamera(leftVehicleView)}
                    />
                  )}
                </View>
                <View style={{ alignItems: "center", marginBottom: 5 }}>
                  <Text style={{ fontWeight: "600" }}>Left</Text>
                </View>
              </View>
            </View>
            <View
              style={{
                marginVertical: 10,
                marginLeft: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View style={{ justifyContent: "center" }}>
                <Text style={{ fontWeight: "600" }}>
                  Take pictures of vehicle from all sides
                </Text>
              </View>
              <View>
                <IconButton
                  icon="help-box"
                  size={30}
                  style={{ margin: 0 }}
                  onPress={() => console.log("Show Help Box")}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextInput
              label="Vehicle Registeration Number"
              keyboardType="default"
              style={{ backgroundColor: "#FBFEFB", flex: 1 }}
              mode="outlined"
              value={driver.autoDetails.vehicleRegisterationNumber}
              onChangeText={(text) => {
                _updateVehicle("vehicleRegisterationNumber", text);
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextInput
              label="Vehicle Device Number"
              keyboardType="default"
              style={{ backgroundColor: "#FBFEFB", flex: 1 }}
              mode="outlined"
              disabled={true}
              value={driver.autoDetails.deviceId}
              onChangeText={(text) => {
                _updateVehicle("vehicleRegisterationNumber", text);
              }}
            />
            <IconButton
              icon="qrcode-scan"
              size={30}
              style={{ margin: 10 }}
              onPress={() => _startQRScan()}
            />
          </View>
          <View style={{ marginTop: 5 }}>
            <View
              style={{
                padding: 10,
                backgroundColor: "#FAF9F9",
                borderRadius: 10,
                height: 200,
              }}
            >
              {driver.autoDetails.location ? (
                <MapService
                  currentLocation={{
                    latitude: driver.autoDetails.location.coords.latitude,
                    longitude: driver.autoDetails.location.coords.longitude,
                  }}
                  style={{ flex: 1 }}
                />
              ) : (
                <Text variant="bodyMedium">Retrieving Location...</Text>
              )}
            </View>
            <View style={{ position: "absolute", right: 20, bottom: 20 }}>
              <Button
                icon="update"
                mode="contained"
                textColor="black"
                style={{ backgroundColor: "#ffffff" }}
                onPress={() => getCurrentLocation()}
                loading={updatingLocationLoading}
                disabled={updatingLocationLoading}
              >
                Update Location
              </Button>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              marginVertical: 10,
            }}
          >
            <View style={{ flex: 2, marginRight: 10 }}>
              <Button
                icon="content-save"
                mode="contained"
                onPress={onSave}
                style={{ backgroundColor: "#805158" }}
              >
                Save
              </Button>
            </View>
            <View style={{ flex: 2 }}>
              <Button
                icon="step-forward"
                mode="contained"
                onPress={onSubmit}
                loading={submitLoading}
                //disabled={submitDisabled}
              >
                Submit
              </Button>
            </View>
          </View>
        </ScrollView>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surface: {
    flex: 1,
    paddingVertical: 10,
    margin: 10,
    borderRadius: 10,
  },
  button: {
    flex: 0.5,
    alignSelf: "flex-end",
    marginHorizontal: 10,
    alignSelf: "stretch",
  },
  title: {
    fontSize: 16,
    color: "#A4919B",
  },
  description: {
    fontSize: 18,
  },
  topSection: {
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FAF9F9",
    padding: 10,
  },
  avatar: {
    width: 72,
    height: 72,
    borderColor: "#4C243B",
    borderWidth: 2,
  },
  inlineImage: {
    flex: 1,
    alignItems: "center",
  },
  inlineElement: {
    flexDirection: "row",
  },
  containerStyle: {
    flex: 0.75,
    margin: 10,
    backgroundColor: "white",
  },
  modalImageStyle: {
    flex: 1,
    resizeMode: "contain",
  },
  cameraButtonStyle: {
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    right: 0,
  },
  spacerStyle: {
    marginBottom: 0,
  },
});
