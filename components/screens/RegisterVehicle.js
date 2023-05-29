import {
  Surface,
  Portal,
  Modal,
  IconButton,
  Text,
  TextInput,
  Button,
} from "react-native-paper";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  View,
  Image,
  BackHandler,
} from "react-native";
import RecordVideo from "../supportComponents/RecordVideo";
import QRCodeScanner from "../supportComponents/QRCodeScanner";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import ErrorDialog from "./ErrorDialog";
import CameraModule from "../supportComponents/CameraModule";
import {
  updateAutoDetails,
  retrieveAutoDetails,
  updateDriverAttribute,
} from "../actions/UserActions";
import { v4 as uuidv4 } from "uuid";
import MapService from "../supportComponents/MapService";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SvgXml } from "react-native-svg";
import QRCode from "qrcode";
import {
  ENCRYPT_SECRET_KEY,
  UPDATE_VEHICLE_AND_CHECK,
  CHECK_ACTIVE_STATUS,
} from "@env";
import CryptoJS from "crypto-js";
import * as FileSystem from "expo-file-system";
import axios from "axios";

const frontVehicleView = "frontVehicleView";
const backVehicleView = "backVehicleView";
const rightVehicleView = "rightVehicleView";
const numberPlateView = "numberPlateView";

export default function RegisterVehicle({ navigation, route }) {
  const [recordVideo, setRecordVideo] = useState(false);
  const driver = useSelector((store) => store.driver.driver);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mockLocation, setMockLocation] = useState(false);
  const [cameraType, setCameraType] = useState(null);
  const [showQRScan, setShowQRScan] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [nextDisabled, setNextDisabled] = useState(true);
  const [updatingLocationLoading, setUpdatingLocationLoading] = useState(false);
  const [qr, setQr] = useState(null);
  const [qrScreen, setQrScreen] = useState(null);
  const dispatch = useDispatch();

  const generateQRCode = async (code) => {
    try {
      const qrSvg = await QRCode.toString(code, {
        type: "svg",
        color: {
          dark: "#000", // QR Code color
          light: "#0000", // Transparent background
        },
      });
      setQr(qrSvg);
    } catch (err) {
      console.error(err);
    }
  };

  const encrypt = (data, key = ENCRYPT_SECRET_KEY) => {
    const ciphertext = CryptoJS.AES.encrypt(data, key).toString();
    return ciphertext;
  };

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

  const onSubmit = async () => {
    setSubmitLoading(true);
    console.log("Submitting the Request");
    let data = {
      driverId: route.params.driverId,
    };

    const activeStatusCheck = {
      method: "post",
      url: CHECK_ACTIVE_STATUS,
      headers: {
        "Content-Type": "application/json",
      },
      data,
    };

    const response = await axios(activeStatusCheck);
    const isActive = response.data.active_status;

    if (isActive) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "List",
          },
        ],
      });
    } else {
      setErrorMessage(
        "Delivery not yet confirmed, Please scan the QR from Driver App"
      );
      setErrorDialogVisible(true);
    }
    setSubmitLoading(false);
  };

  const onSave = async () => {
    if (route.params && route.params.driverId) {
      try {
        await AsyncStorage.setItem(
          route.params.driverId,
          JSON.stringify(driver.autoDetails)
        );
        console.log("Data Saved");
      } catch (err) {
        console.log(err);
      }
    }
  };

  const onBack = () => {
    setQrScreen(null);
  };

  const onNext = async () => {
    let submitResponse = await addVehicleDetails(
      driver,
      UPDATE_VEHICLE_AND_CHECK
    );
    if (submitResponse) {
      const activationCode = submitResponse.activationCode;
      generateQRCode(encrypt(activationCode));
      setQrScreen(true);
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

      let location = null;

      do {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
        });
      } while (location == null);

      if (location) {
        _updateVehicle("location", location);
        setMockLocation(location.mocked);
      }
    } catch (err) {
      console.log(err);
    }
    setUpdatingLocationLoading(false);
  };

  const addVehicleDetails = async (driver, url = UPDATE_VEHICLE_AND_CHECK) => {
    setNextLoading(true);

    let frontVehicleViewBase64 = await readBase64File(
      driver.autoDetails.frontVehicleView.uri,
      "base64"
    );

    let backVehicleViewBase64 = await readBase64File(
      driver.autoDetails.backVehicleView.uri,
      "base64"
    );

    let rightVehicleViewBase64 = await readBase64File(
      driver.autoDetails.rightVehicleView.uri,
      "base64"
    );

    let numberPlateViewBase64 = await readBase64File(
      driver.autoDetails.numberPlateView.uri,
      "base64"
    );

    driver.autoDetails.frontVehicleView.file = frontVehicleViewBase64;
    driver.autoDetails.backVehicleView.file = backVehicleViewBase64;
    driver.autoDetails.rightVehicleView.file = rightVehicleViewBase64;
    driver.autoDetails.numberPlateView.file = numberPlateViewBase64;

    const data = {
      driverId: driver.driverId,
      autoDetails: driver.autoDetails,
    };

    console.log(data);

    try {
      const driverConfig = {
        method: "post",
        url,
        headers: {
          "Content-Type": "application/json",
        },
        data,
      };
      const response = await axios(driverConfig);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.log(error.response.data);
        setErrorMessage(error.response.data.error);
        setErrorDialogVisible(true);
      } else if (error.request) {
        console.log("The server did not respond:", error.message);
        setErrorMessage(error.message);
        setErrorDialogVisible(true);
      } else {
        console.log("Error:", error.message);
        setErrorMessage("Something went Wrong");
        setErrorDialogVisible(true);
      }
    } finally {
      setNextLoading(false);
    }
  };

  async function readBase64File(uri) {
    try {
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64Data;
    } catch (error) {
      console.error("Error reading file:", error);
    }
  }

  const retrieveSavedData = async (driverId) => {
    try {
      let data = await AsyncStorage.getItem(driverId);
      console.log(data);
      if (data) {
        console.log("Retrieving Stored Details");
        dispatch(retrieveAutoDetails(JSON.parse(data)));
      } else {
        //getCurrentLocation();
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
        driver.autoDetails.numberPlateView &&
        driver.autoDetails.vehicleRegisterationNumber &&
        driver.autoDetails.vehicleRegisterationNumber != "" &&
        driver.autoDetails.deviceId &&
        driver.autoDetails.deviceId &&
        driver.autoDetails.location
      ) {
        setNextDisabled(false);
      } else {
        setNextDisabled(true);
      }
    }
  };

  const ConfirmActivation = () => {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <SvgXml xml={qr} width="200" height="200" />
        </View>
        <View style={{ flex: 1, justifyContent: "center", marginBottom: 20 }}>
          <Text style={{ fontWeight: "700", textAlign: "center" }}>
            Scan the following QR to complete the delivery
          </Text>
        </View>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ flex: 2, marginRight: 10 }}>
            <Button
              icon="step-backward"
              mode="contained"
              onPress={onBack}
              style={{ backgroundColor: "#8B2635" }}
            >
              Back
            </Button>
          </View>
          <View style={{ flex: 2 }}>
            <Button
              icon="step-forward"
              mode="contained"
              onPress={onSubmit}
              loading={submitLoading}
            >
              Submit
            </Button>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (route.params && route.params.driverId) {
      dispatch(updateDriverAttribute("driverId", route.params.driverId));
      retrieveSavedData(route.params.driverId);
    }
  }, []);

  useEffect(() => {
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
          {!qrScreen ? (
            <>
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
                    alignItems: "flex-start",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "space-around",
                    }}
                  >
                    <View style={{ alignItems: "center", marginTop: 5 }}>
                      {driver.autoDetails.numberPlateView ? (
                        <View
                          style={{
                            width: 72,
                            height: 72,
                            borderWidth: 2,
                          }}
                        >
                          <Pressable
                            onPress={() => _startCamera(numberPlateView)}
                          >
                            <Image
                              source={{
                                uri: driver.autoDetails.numberPlateView.uri,
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
                          onPress={() => _startCamera(numberPlateView)}
                        />
                      )}
                    </View>
                    <View
                      style={{
                        alignItems: "center",
                        marginBottom: 5,
                      }}
                    >
                      <Text style={{ fontWeight: "600", textAlign: "center" }}>
                        Number Plate
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "space-around",
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
                          <Pressable
                            onPress={() => _startCamera(frontVehicleView)}
                          >
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
                    <View
                      style={{
                        alignItems: "center",
                        marginBottom: 5,
                      }}
                    >
                      <Text style={{ fontWeight: "600", textAlign: "center" }}>
                        Front
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "space-around",
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
                          <Pressable
                            onPress={() => _startCamera(rightVehicleView)}
                          >
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
                      <Text style={{ fontWeight: "600", textAlign: "center" }}>
                        Right
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "space-around",
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
                          <Pressable
                            onPress={() => _startCamera(backVehicleView)}
                          >
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
                      <Text style={{ fontWeight: "600", textAlign: "center" }}>
                        Back
                      </Text>
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
                  autoCapitalize="characters"
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
                    _updateVehicle("deviceId", text);
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
                    style={{ backgroundColor: "#8B2635" }}
                  >
                    Save
                  </Button>
                </View>
                <View style={{ flex: 2 }}>
                  <Button
                    icon="step-forward"
                    mode="contained"
                    onPress={onNext}
                    loading={nextLoading}
                    disabled={nextDisabled}
                  >
                    Next
                  </Button>
                </View>
              </View>
            </>
          ) : (
            <ConfirmActivation />
          )}
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
