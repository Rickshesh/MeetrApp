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
} from "react-native-paper";
import { StyleSheet, ScrollView, Pressable, View, Image } from "react-native";
import registerPartner from "../config/registerPartner.json";
import React, { useEffect, useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import CameraModule from "../supportComponents/CameraModule";
import { v4 as uuidv4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { updatePartner } from "../actions/UserActions";
import RecordVideo from "../supportComponents/RecordVideo";
import VideoThumbnail from "../supportComponents/VideoThumbnail";
import { REGISTER_PARTNER } from "@env";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import ErrorDialog from "./ErrorDialog";
import PartnerBankRegisteration from "./PartnerBankRegisteration";
import AsyncStorage from "@react-native-async-storage/async-storage";

//RegisterPartner is the first Screen in Registeration Flow, inside Stack Navigator
//It helps collect the personal, as well as verification details of the customer
//It stores everything inside Store, for global access
//It needs Camera for Driver, and Aadhaar Card Photo Capture

//Image Link

const frontAadhaar = "frontAadhaar";
const backAadhaar = "backAadhaar";

export default function RegisterPartner() {
  const dispatch = useDispatch();
  const partner = useSelector((store) => store.driver.partner);
  const displayInfo = registerPartner.displayInfo;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cameraType, setCameraType] = useState(null);
  const [recordVideo, setRecordVideo] = useState(false);
  const [showHelperPAN, setShowHelperPAN] = useState(false);
  const [showAadhaarHelper, setShowAadhaarHelper] = useState(false);
  const [showAadhaarImageHelper, setShowAadhaarImageHelper] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [bankRegisteration, setBankRegisteration] = useState(false);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const _updatePartner = (key, value) => {
    dispatch(updatePartner({ key, value }));
  };

  const _showDatePicker = () => {
    setShowDatePicker(true);
  };
  const _hideDatePicker = () => {
    setShowDatePicker(false);
  };

  const _handleConfirm = (date) => {
    _updatePartner("dateOfBirth", moment(date).format("DD-MM-YYYY"));
    _hideDatePicker();
  };

  const _captureImage = (file, type) => {
    let imageID = uuidv4();
    let imageObj = { id: imageID, uri: file.uri };
    _updatePartner(type, imageObj);
  };

  const _captureVideo = (fileURI) => {
    let videoID = uuidv4();
    let videoObj = { id: videoID, uri: fileURI };
    _updatePartner("video", videoObj);
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

  const checkFields = () => {
    if (
      partner &&
      partner.video &&
      partner.firstName &&
      partner.firstName != "" &&
      partner.lastName &&
      partner.lastName != "" &&
      partner.phoneNumber &&
      partner.phoneNumber != "" &&
      partner.email &&
      partner.email != "" &&
      partner.dateOfBirth &&
      partner.aadhaar &&
      partner.aadhaar != "" &&
      partner.frontAadhaar &&
      partner.backAadhaar &&
      partner.panCardDetails &&
      partner.panCardDetails != ""
    ) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  };

  const onSubmit = async () => {
    setSubmitLoading(true);
    try {
      let registerationData = await partnerRegisteration();
      console.log(registerationData);
      if (registerationData) {
        const registeration_status = registerationData.registeration_status;
        if (registeration_status == "registeration_success") {
          setBankRegisteration(true);
        }
      }
      /*
      if (registerationData) {
        const registeration_status = registerationData.registeration_status;
        if (registeration_status == "registeration_success") {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "Address",
                params: {
                  driverId: driver.driverId,
                  registeration_status,
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
                  registeration_status,
                },
              },
            ],
          });
        }
      }
      */
    } catch (err) {
      console.log(err);
      //setErrorMessage(err);
      //setErrorDialogVisible(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  async function readBase64File(uri) {
    try {
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      //console.log("File contents (base64):", base64Data);
      return base64Data;
    } catch (error) {
      console.error("Error reading file:", error);
    }
  }

  const partnerRegisteration = async () => {
    let videoBase64 = await readBase64File(partner.video.uri, "base64");

    let frontAadhaarBase64 = await readBase64File(
      partner.frontAadhaar.uri,
      "base64"
    );

    let backAadhaarBase64 = await readBase64File(
      partner.backAadhaar.uri,
      "base64"
    );

    partner.backAadhaar.file = backAadhaarBase64;
    partner.frontAadhaar.file = frontAadhaarBase64;
    partner.video.file = videoBase64;

    try {
      const partnerConfig = {
        method: "post",
        url: REGISTER_PARTNER,
        headers: {
          "Content-Type": "application/json",
        },
        data: partner,
      };
      const response = await axios(partnerConfig);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      } else if (error.request) {
        throw error.message;
      } else {
        throw error.message;
      }
    }
  };

  useEffect(() => {
    checkFields(partner);
  }, [partner]);

  return (
    <>
      {!bankRegisteration ? (
        <View style={styles.container}>
          <ErrorDialog
            visible={errorDialogVisible}
            hideDialog={() => setErrorDialogVisible(false)}
            errorMessage={errorMessage}
          />
          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            onConfirm={_handleConfirm}
            onCancel={_hideDatePicker}
          />
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
              visible={showHelperPAN}
              onDismiss={() => setShowHelperPAN(false)}
              contentContainerStyle={styles.containerStyle}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={require("../assets/PAN_Helper.png")}
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
          {partner && (
            <Surface style={styles.surface} elevation={2}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ margin: 10 }}
              >
                <View style={styles.topSection}>
                  <View>
                    {!partner.video ? (
                      <Pressable onPress={() => _startVideo(true)}>
                        <IconButton
                          size={36}
                          icon="video-account"
                          style={styles.avatar}
                        />
                      </Pressable>
                    ) : (
                      <View>
                        <Pressable onPress={() => _startVideo(true)}>
                          <VideoThumbnail
                            videoUri={partner.video.uri}
                            customStyle={styles.avatar}
                          />
                        </Pressable>
                      </View>
                    )}
                  </View>
                  {!partner.video && (
                    <View>
                      <Text variant="titleSmall">
                        Record a short video of yourself
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
                                displayInfo.body.identityParameters[key].format
                              }
                              value={partner[key]}
                              onChangeText={(input) =>
                                _updatePartner(key, input)
                              }
                              label={
                                displayInfo.body.identityParameters[key].label
                              }
                              style={{ backgroundColor: "#FBFEFB" }}
                              mode="outlined"
                            />
                          </View>
                        );
                      }
                    )}

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
                          {partner.dateOfBirth
                            ? partner.dateOfBirth.toString()
                            : "DD-MM-YYYY"}
                        </Button>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        marginHorizontal: 10,
                      }}
                    >
                      <View style={{ flexDirection: "row" }}>
                        <View style={styles.inlineImage}>
                          {typeof partner.frontAadhaar === "undefined" ? (
                            <>
                              <IconButton
                                size={24}
                                icon="camera"
                                style={styles.avatar}
                                onPress={() => _startCamera(frontAadhaar)}
                              />
                              <Text
                                variant="titleSmall"
                                style={{ marginLeft: 10 }}
                              >
                                Aadhaar Front
                              </Text>
                            </>
                          ) : (
                            <Pressable
                              onPress={() => _startCamera(frontAadhaar)}
                            >
                              <Image
                                source={{
                                  uri: partner.frontAadhaar.uri,
                                }}
                                resizeMode="contain"
                                style={{
                                  width: 120,
                                  height: 120,
                                }}
                              />
                            </Pressable>
                          )}
                        </View>
                        <View style={styles.inlineImage}>
                          {typeof partner.backAadhaar === "undefined" ? (
                            <>
                              <IconButton
                                size={24}
                                icon="camera"
                                style={styles.avatar}
                                onPress={() => _startCamera(backAadhaar)}
                              />
                              <Text
                                variant="titleSmall"
                                style={{ marginLeft: 10 }}
                              >
                                Aadhaar Back
                              </Text>
                            </>
                          ) : (
                            <Pressable
                              onPress={() => _startCamera(backAadhaar)}
                            >
                              <Image
                                source={{
                                  uri: partner.backAadhaar.uri,
                                }}
                                resizeMode="contain"
                                style={{ width: 120, height: 120 }}
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
                            .format
                        }
                        style={{ backgroundColor: "#FBFEFB", flex: 1 }}
                        mode="outlined"
                        onChangeText={(text) => _updatePartner("aadhaar", text)}
                        value={partner.aadhaar}
                      />
                      <IconButton
                        icon="help-box"
                        size={30}
                        onPress={() => setShowAadhaarHelper(true)}
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
                        label={
                          displayInfo.body.exceptions.identityParameters
                            .panCardDetails.label
                        }
                        keyboardType={
                          displayInfo.body.exceptions.identityParameters
                            .panCardDetails.format
                        }
                        autoCapitalize="characters"
                        style={{ backgroundColor: "#FBFEFB", flex: 1 }}
                        mode="outlined"
                        value={partner.panCardDetails}
                        onChangeText={(text) =>
                          _updatePartner("panCardDetails", text)
                        }
                      />
                      <IconButton
                        icon="help-box"
                        size={30}
                        onPress={() => setShowHelperPAN(true)}
                      />
                    </View>
                  </View>
                </List.Section>
                <List.Section>
                  <View style={{ flex: 1, flexDirection: "row", margin: 10 }}>
                    <View style={{ flex: 2 }}></View>
                    <View style={{ flex: 2 }}>
                      <Button
                        icon="step-forward"
                        mode="contained"
                        onPress={() => onSubmit()}
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
      ) : (
        <PartnerBankRegisteration setBankRegisteration={setBankRegisteration} />
      )}
    </>
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
    borderRadius: 96 / 4,
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
