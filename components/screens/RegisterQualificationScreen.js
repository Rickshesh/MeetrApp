import "react-native-get-random-values";
import {
  Surface,
  List,
  Portal,
  Modal,
  IconButton,
  TextInput,
  Button,
  Text,
  RadioButton,
} from "react-native-paper";
import { StyleSheet, ScrollView, Pressable, View, Image } from "react-native";
import registerDriver from "../config/registerDriver.json";
import React, { useEffect, useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import CameraModule from "../supportComponents/CameraModule";
import { v4 as uuidv4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { updateDriver } from "../actions/UserActions";
import { updateDriverAttribute } from "../actions/UserActions";
import RecordVideo from "../supportComponents/RecordVideo";
import VideoThumbnail from "../supportComponents/VideoThumbnail";
import { REGISTER_DRIVER_AND_CHECK } from "@env";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import ErrorDialog from "./ErrorDialog";
import AsyncStorage from "@react-native-async-storage/async-storage";

//RegisterDriver is the first Screen in Registeration Flow, inside Stack Navigator
//It helps collect the personal, as well as verification details of the customer
//It stores everything inside Store, for global access
//It needs Camera for Driver, and Aadhaar Card Photo Capture

//Image Link

const frontAadhaar = "frontAadhaar";
const backAadhaar = "backAadhaar";

const permissions = [
  "android.permission.RECORD_AUDIO",
  "android.permission.CAMERA",
];

export default function RegisterDriver({ navigation }) {
  const dispatch = useDispatch();
  const driver = useSelector((store) => store.driver.driver);
  const displayInfo = registerDriver.displayInfo;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cameraType, setCameraType] = useState(null);
  const [recordVideo, setRecordVideo] = useState(false);
  const [showHelperDriving, setShowHelperDriving] = useState(false);
  const [showAadhaarHelper, setShowAadhaarHelper] = useState(false);
  const [showAadhaarImageHelper, setShowAadhaarImageHelper] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const _updateDriver = (key, value) => {
    dispatch(updateDriver({ key, value }));
  };

  const onSubmit = async () => {
    let submitResponse = await createDriver(driver, REGISTER_DRIVER_AND_CHECK);
    if (submitResponse) {
      const registeration_status = submitResponse.registeration_status;
      if (registeration_status == "registeration_success") {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "Address",
              params: {
                driverId: driver.driverId,
              },
            },
          ],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "Status",
              params: {
                registeration_status: submitResponse.registeration_status,
              },
            },
          ],
        });
      }
    }
  };

  const storeDriverIdAsyncStorage = async (driverId) => {
    if (driverId == null) {
      await AsyncStorage.removeItem("driverId");
    } else {
      await AsyncStorage.setItem("driverId", driverId);
    }
  };

  const checkFields = (driver) => {
    if (
      driver &&
      driver.identityParameters &&
      driver.identityParameters.marriedStatus
    ) {
      if (
        driver.identityParameters.video &&
        driver.identityParameters.video != {} &&
        driver.identityParameters.frontAadhaar &&
        driver.identityParameters.frontAadhaar != {} &&
        driver.identityParameters.backAadhaar &&
        driver.identityParameters.backAadhaar != {} &&
        driver.identityParameters.firstName &&
        driver.identityParameters.firstName != "" &&
        driver.identityParameters.lastName &&
        driver.identityParameters.lastName != "" &&
        driver.identityParameters.numberOfChildren &&
        driver.identityParameters.numberOfOtherDependents &&
        driver.identityParameters.dateOfBirth &&
        driver.identityParameters.dateOfBirth != "DD-MM-YYYY" &&
        driver.identityParameters.drivingLicense &&
        driver.identityParameters.drivingLicense != "" &&
        driver.identityParameters.aadhaar &&
        driver.identityParameters.aadhaar != ""
      ) {
        setSubmitDisabled(false);
      } else {
        setSubmitDisabled(true);
      }
    } else if (
      driver &&
      driver.identityParameters &&
      !driver.identityParameters.marriedStatus
    ) {
      if (
        driver.identityParameters.video &&
        driver.identityParameters.frontAadhaar &&
        driver.identityParameters.backAadhaar &&
        driver.identityParameters.firstName &&
        driver.identityParameters.firstName != "" &&
        driver.identityParameters.lastName &&
        driver.identityParameters.lastName != "" &&
        driver.identityParameters.numberOfOtherDependents &&
        driver.identityParameters.dateOfBirth &&
        driver.identityParameters.dateOfBirth != "DD-MM-YYYY" &&
        driver.identityParameters.drivingLicense &&
        driver.identityParameters.drivingLicense != "" &&
        driver.identityParameters.aadhaar &&
        driver.identityParameters.aadhaar != ""
      ) {
        setSubmitDisabled(false);
      } else {
        setSubmitDisabled(true);
      }
    } else {
      setSubmitDisabled(true);
    }
  };

  async function readBase64File(uri) {
    try {
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("File contents (base64):", base64Data);
      return base64Data;
    } catch (error) {
      console.error("Error reading file:", error);
    }
  }

  const createDriver = async (driver, url) => {
    setSubmitLoading(true);

    let videoBase64 = await readBase64File(
      driver.identityParameters.video.uri,
      "base64"
    );

    let frontAadhaarBase64 = await readBase64File(
      driver.identityParameters.frontAadhaar.uri,
      "base64"
    );

    let backAadhaarBase64 = await readBase64File(
      driver.identityParameters.backAadhaar.uri,
      "base64"
    );

    driver.identityParameters.backAadhaar.file = backAadhaarBase64;

    driver.identityParameters.frontAadhaar.file = frontAadhaarBase64;
    driver.identityParameters.video.file = videoBase64;

    try {
      const driverConfig = {
        method: "post",
        url,
        headers: {
          "Content-Type": "application/json",
        },
        data: driver,
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
      setSubmitLoading(false);
    }
  };

  const generateDriverId = () => {
    if (driver && !driver.driverId) {
      let driverID = uuidv4();
      dispatch(updateDriverAttribute("driverId", driverID));
    }
  };

  useEffect(() => {
    console.log(driver);
    generateDriverId();
    _updateDriver(
      "dateOfRegisteration",
      moment(new Date()).format("DD-MM-YYYY").toString()
    );
    dispatch(
      updateDriverAttribute("activeStatus", "pending_driver_registeration")
    );
    dispatch(
      updateDriverAttribute("registerationType", "partner_registeration")
    );
  }, []);

  useEffect(() => {
    console.log(driver);
    checkFields(driver);
  }, [driver]);

  const _showDatePicker = () => {
    setShowDatePicker(true);
  };
  const _hideDatePicker = () => {
    setShowDatePicker(false);
  };

  const _handleConfirm = (date) => {
    _updateDriver("dateOfBirth", moment(date).format("DD-MM-YYYY"));
    _hideDatePicker();
  };

  const _captureImage = (file, type) => {
    let imageID = uuidv4();
    let imageObj = { id: imageID, uri: file.uri };
    _updateDriver(type, imageObj);
  };

  const _captureVideo = (fileURI) => {
    let videoID = uuidv4();
    let videoObj = { id: videoID, uri: fileURI };
    _updateDriver("video", videoObj);
  };

  const _startCamera = (type) => {
    setCameraType(type);
  };
  const _hideCamera = () => {
    setCameraType(null);
  };

  const _hideVideo = () => {
    setRecordVideo(false);
  };

  const _startVideo = () => {
    setRecordVideo(true);
  };

  return (
    <View style={styles.container}>
      <ErrorDialog
        visible={errorDialogVisible}
        hideDialog={() => setErrorDialogVisible(false)}
        errorMessage={errorMessage}
      />

      {driver && (
        <Surface style={styles.surface} elevation={2}>
          <Portal>
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
              visible={recordVideo}
              onDismiss={_hideVideo}
              contentContainerStyle={styles.containerStyle}
            >
              <RecordVideo
                _setVideo={(file) => _captureVideo(file)}
                _hideVideo={_hideVideo}
                timeToFinish={3}
              />
            </Modal>
            <Modal
              visible={showHelperDriving}
              onDismiss={() => setShowHelperDriving(false)}
              contentContainerStyle={styles.containerStyle}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={require("../assets/Driving_License_Helper.png")}
                  style={{
                    width: "100%",
                    height: undefined,
                    aspectRatio: 1,
                  }}
                  resizeMode="contain"
                />
              </View>
            </Modal>
            <Modal
              visible={showAadhaarHelper}
              onDismiss={() => setShowAadhaarHelper(false)}
              contentContainerStyle={styles.containerStyle}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={require("../assets/Aadhaar_Helper.png")}
                  style={{
                    width: "100%",
                    height: undefined,
                    aspectRatio: 1,
                  }}
                  resizeMode="contain"
                />
              </View>
            </Modal>
            <Modal
              visible={showAadhaarImageHelper}
              onDismiss={() => setShowAadhaarImageHelper(false)}
              contentContainerStyle={styles.containerStyle}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={require("../assets/Aadhaar_Image_Helper.png")}
                  style={{
                    width: "100%",
                    height: undefined,
                    aspectRatio: 1,
                  }}
                  resizeMode="contain"
                />
              </View>
            </Modal>
          </Portal>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ margin: 10 }}
          >
            <View style={styles.topSection}>
              <View>
                {!driver.identityParameters.video ? (
                  <Pressable onPress={() => _startVideo(true)}>
                    <IconButton
                      size={36}
                      icon="video-account"
                      style={styles.avatar}
                    />
                  </Pressable>
                ) : (
                  <View style={styles.avatar}>
                    <Pressable onPress={() => _startVideo(true)}>
                      <VideoThumbnail
                        videoUri={driver.identityParameters.video.uri}
                      />
                    </Pressable>
                  </View>
                )}
              </View>
              {!driver.identityParameters.video && (
                <View>
                  <Text variant="titleSmall">
                    Record a short video of customer
                  </Text>
                </View>
              )}
            </View>
            <List.Section>
              <List.Subheader>
                <Text variant="titleSmall">
                  {displayInfo.head.identityParameters}
                </Text>
              </List.Subheader>
              <View>
                {Object.keys(displayInfo.body.identityParameters).map(
                  (key, index) => {
                    return (
                      <View key={index}>
                        <TextInput
                          keyboardType={
                            displayInfo.body.identityParameters[key].format ==
                            "number"
                              ? "numeric"
                              : "default"
                          }
                          value={driver.identityParameters[key]}
                          onChangeText={(input) => _updateDriver(key, input)}
                          label={displayInfo.body.identityParameters[key].label}
                          style={{ backgroundColor: "#FBFEFB" }}
                          mode="outlined"
                        />
                      </View>
                    );
                  }
                )}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TextInput
                    label={
                      displayInfo.body.exceptions.identityParameters
                        .drivingLicense.label
                    }
                    keyboardType={
                      displayInfo.body.exceptions.identityParameters
                        .drivingLicense.format == "number"
                        ? "numeric"
                        : "default"
                    }
                    style={{ backgroundColor: "#FBFEFB", flex: 1 }}
                    mode="outlined"
                    value={driver.identityParameters.drivingLicense}
                    onChangeText={(text) =>
                      _updateDriver("drivingLicense", text)
                    }
                  />
                  <IconButton
                    icon="help-box"
                    size={30}
                    onPress={() => setShowHelperDriving(true)}
                  />
                </View>
                <View style={{ flexDirection: "row", margin: 10 }}>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                    }}
                  >
                    <Text variant="titleSmall">
                      {
                        displayInfo.body.exceptions.identityParameters
                          .marriedStatus.label
                      }
                    </Text>
                  </View>
                  <View style={{ flex: 1, flexDirection: "row" }}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "center",
                      }}
                    >
                      <View>
                        <RadioButton
                          status={
                            driver.identityParameters.marriedStatus == true &&
                            "checked"
                          }
                          onPress={() => {
                            _updateDriver("marriedStatus", true);
                          }}
                        />
                      </View>
                      <View style={{ justifyContent: "center" }}>
                        <Text>Yes</Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "center",
                      }}
                    >
                      <View>
                        <RadioButton
                          status={
                            driver.identityParameters.marriedStatus == false &&
                            "checked"
                          }
                          onPress={() => {
                            _updateDriver("marriedStatus", false);
                          }}
                        />
                      </View>
                      <View style={{ justifyContent: "center" }}>
                        <Text>No</Text>
                      </View>
                    </View>
                  </View>
                </View>
                {driver.identityParameters.marriedStatus == true && (
                  <View style={{ flexDirection: "row", margin: 10 }}>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <Text variant="titleSmall">
                        {
                          displayInfo.body.exceptions.identityParameters
                            .numberOfChildren.label
                        }
                      </Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <View style={{ flex: 1, flexDirection: "row" }}>
                        <View>
                          <RadioButton
                            status={
                              driver.identityParameters.numberOfChildren == 0 &&
                              "checked"
                            }
                            onPress={() => {
                              _updateDriver("numberOfChildren", 0);
                            }}
                          />
                        </View>
                        <View style={{ justifyContent: "center" }}>
                          <Text>0</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1, flexDirection: "row" }}>
                        <View>
                          <RadioButton
                            status={
                              driver.identityParameters.numberOfChildren == 1 &&
                              "checked"
                            }
                            onPress={() => {
                              _updateDriver("numberOfChildren", 1);
                            }}
                          />
                        </View>
                        <View style={{ justifyContent: "center" }}>
                          <Text>1</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1, flexDirection: "row" }}>
                        <View>
                          <RadioButton
                            status={
                              driver.identityParameters.numberOfChildren == 2 &&
                              "checked"
                            }
                            onPress={() => {
                              _updateDriver("numberOfChildren", 2);
                            }}
                          />
                        </View>
                        <View style={{ justifyContent: "center" }}>
                          <Text>2+</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
                <View style={{ flexDirection: "row", margin: 10 }}>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                    }}
                  >
                    <Text variant="titleSmall">
                      {
                        displayInfo.body.exceptions.identityParameters
                          .numberOfOtherDependents.label
                      }
                    </Text>
                  </View>
                  <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <View>
                        <RadioButton
                          status={
                            driver.identityParameters.numberOfOtherDependents ==
                              0 && "checked"
                          }
                          onPress={() => {
                            _updateDriver("numberOfOtherDependents", 0);
                          }}
                        />
                      </View>
                      <View style={{ justifyContent: "center" }}>
                        <Text>0</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <View>
                        <RadioButton
                          status={
                            driver.identityParameters.numberOfOtherDependents ==
                              1 && "checked"
                          }
                          onPress={() => {
                            _updateDriver("numberOfOtherDependents", 1);
                          }}
                        />
                      </View>
                      <View style={{ justifyContent: "center" }}>
                        <Text>1</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <View>
                        <RadioButton
                          status={
                            driver.identityParameters.numberOfOtherDependents ==
                              2 && "checked"
                          }
                          onPress={() => {
                            _updateDriver("numberOfOtherDependents", 2);
                          }}
                        />
                      </View>
                      <View style={{ justifyContent: "center" }}>
                        <Text>2+</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: "row", margin: 10 }}>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                    }}
                  >
                    <Text variant="titleSmall">Date of Birth</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      mode="contained"
                      color="#FBFEFB"
                      onPress={() => _showDatePicker()}
                    >
                      {" "}
                      {driver.identityParameters.dateOfBirth
                        ? driver.identityParameters.dateOfBirth.toString()
                        : "DD-MM-YYYY"}
                    </Button>
                  </View>
                </View>
                <View style={{ flexDirection: "row", margin: 10 }}>
                  <View style={{ flexDirection: "row" }}>
                    <View style={styles.inlineImage}>
                      {typeof driver.identityParameters.frontAadhaar ===
                      "undefined" ? (
                        <>
                          <IconButton
                            size={24}
                            icon="camera"
                            style={styles.avatar}
                            onPress={() => _startCamera(frontAadhaar)}
                          />
                          <Text variant="titleSmall">Aadhaar Front</Text>
                        </>
                      ) : (
                        <Pressable onPress={() => _startCamera(frontAadhaar)}>
                          <Image
                            source={{
                              uri: driver.identityParameters.frontAadhaar.uri,
                            }}
                            resizeMode="contain"
                            style={{ width: 144, height: 144 }}
                          />
                        </Pressable>
                      )}
                    </View>
                    <View style={styles.inlineImage}>
                      {typeof driver.identityParameters.backAadhaar ===
                      "undefined" ? (
                        <>
                          <IconButton
                            size={24}
                            icon="camera"
                            style={styles.avatar}
                            onPress={() => _startCamera(backAadhaar)}
                          />
                          <Text variant="titleSmall">Aadhaar Back</Text>
                        </>
                      ) : (
                        <Pressable onPress={() => _startCamera(backAadhaar)}>
                          <Image
                            source={{
                              uri: driver.identityParameters.backAadhaar.uri,
                            }}
                            resizeMode="contain"
                            style={{ width: 144, height: 144 }}
                          />
                        </Pressable>
                      )}
                    </View>
                  </View>
                  <View style={{ justifyContent: "center" }}>
                    <IconButton
                      icon="help-box"
                      size={30}
                      onPress={() => setShowAadhaarImageHelper(true)}
                    />
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
                    label={
                      displayInfo.body.exceptions.identityParameters.aadhaar
                        .label
                    }
                    keyboardType={
                      displayInfo.body.exceptions.identityParameters.aadhaar
                        .format == "number"
                        ? "numeric"
                        : "default"
                    }
                    style={{ backgroundColor: "#FBFEFB", flex: 1 }}
                    mode="outlined"
                    onChangeText={(text) => _updateDriver("aadhaar", text)}
                    value={driver.identityParameters.aadhaar}
                  />
                  <IconButton
                    icon="help-box"
                    size={30}
                    onPress={() => setShowAadhaarHelper(true)}
                  />
                </View>
                <DateTimePickerModal
                  isVisible={showDatePicker}
                  mode="date"
                  onConfirm={_handleConfirm}
                  onCancel={_hideDatePicker}
                />
              </View>
            </List.Section>
            <List.Section>
              <View style={{ flex: 1, flexDirection: "row", margin: 10 }}>
                <View style={{ flex: 2 }}></View>
                <View style={{ flex: 2 }}>
                  <Button
                    icon="step-forward"
                    mode="contained"
                    onPress={onSubmit}
                    loading={submitLoading}
                    disabled={submitDisabled}
                  >
                    Next
                  </Button>
                </View>
              </View>
            </List.Section>
          </ScrollView>
        </Surface>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surface: {
    flex: 1,
    margin: 10,
    paddingVertical: 10,
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
    backgroundColor: "#FAF9F9",
    alignItems: "center",
    padding: 5,
  },
  avatar: {
    width: 96,
    height: 96,
    borderColor: "#4C243B",
    borderWidth: 2,
    justifyContent: "center",
  },
  inlineImage: {
    width: 144,
    height: 144,
    justifyContent: "center",
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
});
