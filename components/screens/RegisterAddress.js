import {
  Surface,
  Portal,
  Modal,
  TextInput,
  IconButton,
  Text,
  Button,
} from "react-native-paper";
import { StyleSheet, ScrollView, View, Pressable } from "react-native";
import { useState, useEffect } from "react";
import RecordVideo from "../supportComponents/RecordVideo";
import VideoThumbnail from "../supportComponents/VideoThumbnail";
import ErrorDialog from "./ErrorDialog";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { GEO_FENCE_CITIES } from "@env";
import {
  retrieveAddressDetails,
  updateAddressDetails,
  updateReferenceDetails,
} from "../actions/UserActions";
import axios from "axios";
import DropDown from "react-native-paper-dropdown";
import MapService from "../supportComponents/MapService";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const insideVideo = "insideVideo";
const outsideVideo = "outsideVideo";
const verificationVideo = "verificationVideo";

export default function RegisterAddress({ navigation }) {
  const dispatch = useDispatch();
  const driver = useSelector((store) => store.driver.driver);
  const store = useSelector((store) => store.driver);
  const [showHelperAddressVideo, setShowHelperAddressVideo] = useState(false);
  const [recordVideo, setRecordVideo] = useState(null);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [geoCities, setGeoCities] = useState(null);
  const [mockLocation, setMockLocation] = useState(false);
  const [showCityDropDown, setShowCityDropDown] = useState(false);
  const [showSecondReferenceDropDown, setShowSecondReferenceDropDown] =
    useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [updatingLocationLoading, setUpdatingLocationLoading] = useState(false);

  const secondReferenceList = [
    { value: "past_employer", label: "Past Employer" },
    { value: "past_colleague", label: "Past Colleague" },
    { value: "current_employer", label: "Current Employer" },
    { value: "current_colleague", label: "Current Colleague" },
    { value: "land_lord", label: "Land Lord" },
    { value: "friend", label: "Friend" },
    { value: "other", label: "Other" },
  ];

  const _updateAddress = (key, value) => {
    dispatch(updateAddressDetails({ key, value }));
  };

  const _updateReference = (key, value) => {
    dispatch(updateReferenceDetails({ key, value }));
  };

  const _captureVideo = (fileURI, type) => {
    let videoID = uuidv4();
    let videoObj = { id: videoID, uri: fileURI };
    _updateAddress(type, videoObj);
  };

  const _hideVideo = () => {
    setRecordVideo(null);
  };

  const _startVideo = (type) => {
    setRecordVideo(type);
  };

  const updateCity = (city) => {
    console.log(city);
    _updateAddress("city", city);
  };

  const updateSecondReference = (type) => {
    console.log(type);
    _updateReference("secondReferenceType", type);
  };

  const retrieveSavedData = async () => {
    await getCurrentLocation();
    await retrieveGeoCities();
    try {
      let data = await AsyncStorage.getItem("address_id");
      if (data) {
        console.log("Retrieving Stored Details");
        dispatch(retrieveAddressDetails(JSON.parse(data)));
        console.log(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkFields = (driver) => {
    {
      if (
        !mockLocation &&
        driver.addressDetails &&
        driver.addressDetails.verificationVideo &&
        driver.addressDetails.verificationVideo != {} &&
        driver.addressDetails.insideVideo &&
        driver.addressDetails.insideVideo != {} &&
        driver.addressDetails.outsideVideo &&
        driver.addressDetails.outsideVideo != {} &&
        driver.addressDetails.city &&
        driver.addressDetails.locationAddress &&
        driver.addressDetails.userAddress &&
        driver.addressDetails.userAddress != {} &&
        driver.addressDetails.location &&
        driver.referenceDetails &&
        driver.referenceDetails.pastEmployerName &&
        driver.referenceDetails.pastEmployerName != "" &&
        driver.referenceDetails.pastEmployerNumber &&
        driver.referenceDetails.pastEmployerNumber != "" &&
        driver.referenceDetails.secondReferenceType &&
        driver.referenceDetails.secondReferenceName &&
        driver.referenceDetails.secondReferenceName != "" &&
        driver.referenceDetails.secondReferenceNumber &&
        driver.referenceDetails.secondReferenceNumber != ""
      ) {
        setSubmitDisabled(false);
      } else {
        setSubmitDisabled(true);
      }
    }
  };

  const onSubmit = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Vehicle",
          params: {
            driverId: driver.driverId,
          },
        },
      ],
    });
    //console.log("Submitted");
  };

  const onSave = async () => {
    try {
      await AsyncStorage.setItem(
        "address_id",
        JSON.stringify(driver.addressDetails)
      );
    } catch (err) {
      console.log(err);
    }
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
        _updateAddress("location", location);
        _updateAddress("locationAddress", location.locationAddress);
        setMockLocation(location.mocked);
      }
    } catch (err) {
      console.log(err);
    }
    setUpdatingLocationLoading(false);
  };

  const retrieveGeoCities = async () => {
    try {
      const geoCitiesConfig = {
        method: "get",
        url: GEO_FENCE_CITIES,
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await axios(geoCitiesConfig);
      console.log("Response: ");
      console.log(response.data.cities);
      setGeoCities(response.data.cities);
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  };

  const addAddressDetails = async () => {
    setSubmitLoading(true);

    let insideVideoBase64 = await readBase64File(
      driver.addressDetails.insideVideo.uri,
      "base64"
    );

    let outsideVideoBase64 = await readBase64File(
      driver.addressDetails.outsideVideo.uri,
      "base64"
    );

    let verificationVideoBase64 = await readBase64File(
      driver.addressDetails.verificationVideo.uri,
      "base64"
    );

    driver.addressDetails.insideVideo.file = insideVideoBase64;
    driver.addressDetails.outsideVideo.file = outsideVideoBase64;
    driver.addressDetails.verificationVideo.file = verificationVideoBase64;

    const data = {
      driverId: driver.driverId,
      addressDetails: driver.addressDetails,
      referenceDetails: driver.referenceDetails,
    };

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
      setSubmitLoading(false);
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

  useEffect(() => {
    retrieveSavedData();
  }, []);

  useEffect(() => {
    console.log(store);
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
          {driver.addressDetails && (
            <>
              <View>
                <Text style={{ fontWeight: "700", fontSize: 16 }}>
                  Address Details
                </Text>
              </View>
              <View style={styles.topSection}>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                    }}
                  >
                    {!driver.addressDetails.verificationVideo ? (
                      <Pressable onPress={() => _startVideo(verificationVideo)}>
                        <IconButton
                          size={36}
                          icon="video-account"
                          style={styles.avatar}
                        />
                      </Pressable>
                    ) : (
                      <View style={styles.avatar}>
                        <Pressable
                          onPress={() => _startVideo(verificationVideo)}
                        >
                          <VideoThumbnail
                            videoUri={
                              driver.addressDetails.verificationVideo.uri
                            }
                          />
                        </Pressable>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 2 }}></View>
                </View>
                <View>
                  {!driver.addressDetails.video && (
                    <View
                      style={{
                        marginVertical: 10,
                        marginLeft: 10,
                      }}
                    >
                      <Text style={{ fontWeight: "600" }}>
                        Record a Short Video Capturing the Applicant
                      </Text>
                    </View>
                  )}
                </View>
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
                      {driver.addressDetails.outsideVideo ? (
                        <View
                          style={{
                            width: 96,
                            height: 96,
                            borderWidth: 2,
                          }}
                        >
                          <Pressable onPress={() => _startVideo(outsideVideo)}>
                            <VideoThumbnail
                              videoUri={driver.addressDetails.outsideVideo.uri}
                            />
                          </Pressable>
                        </View>
                      ) : (
                        <IconButton
                          size={30}
                          icon="video-account"
                          style={styles.avatar}
                          onPress={() => _startVideo(outsideVideo)}
                        />
                      )}
                    </View>
                    <View style={{ alignItems: "center", marginBottom: 5 }}>
                      <Text style={{ fontWeight: "600" }}>Outside</Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ alignItems: "center", marginTop: 5 }}>
                      {driver.addressDetails.insideVideo ? (
                        <View
                          style={{
                            width: 96,
                            height: 96,
                            borderWidth: 2,
                          }}
                        >
                          <Pressable onPress={() => _startVideo(insideVideo)}>
                            <VideoThumbnail
                              videoUri={driver.addressDetails.insideVideo.uri}
                            />
                          </Pressable>
                        </View>
                      ) : (
                        <IconButton
                          size={30}
                          icon="video-account"
                          style={styles.avatar}
                          onPress={() => _startVideo(insideVideo)}
                        />
                      )}
                    </View>
                    <View style={{ alignItems: "center", marginBottom: 5 }}>
                      <Text style={{ fontWeight: "600" }}>Inside</Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                    }}
                  >
                    <IconButton
                      icon="help-box"
                      size={30}
                      onPress={() => console.log("Show Helper")}
                    />
                  </View>
                </View>
                <View
                  style={{
                    marginVertical: 10,
                    marginLeft: 10,
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>
                    Record Short Videos of the Home
                  </Text>
                </View>
              </View>
              {!geoCities && (
                <TextInput
                  label="Select City"
                  keyboardType="default"
                  style={{ flex: 1 }}
                  disabled={true}
                  mode="outlined"
                  onChangeText={(text) => {
                    console.log(text);
                  }}
                />
              )}
              {geoCities && (
                <View
                  style={{
                    justifyContent: "center",
                  }}
                >
                  <View style={styles.spacerStyle}>
                    <DropDown
                      label={"Select City"}
                      mode={"outlined"}
                      visible={showCityDropDown}
                      dropDownItemStyle={{ height: 50 }}
                      dropDownStyle={{
                        height: (geoCities.length - 1) * 50 + 60,
                      }}
                      placeholder="Select City"
                      showDropDown={() => setShowCityDropDown(true)}
                      onDismiss={() => setShowCityDropDown(false)}
                      value={driver.addressDetails.city}
                      setValue={updateCity}
                      list={geoCities}
                    />
                  </View>
                </View>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TextInput
                  label="Complete Address with City and State"
                  keyboardType="default"
                  style={{ backgroundColor: "#FBFEFB", flex: 1 }}
                  mode="outlined"
                  value={driver.addressDetails.userAddress}
                  onChangeText={(text) => {
                    _updateAddress("userAddress", text);
                  }}
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
                  {driver.addressDetails.location ? (
                    <MapService
                      currentLocation={{
                        latitude:
                          driver.addressDetails.location.coords.latitude,
                        longitude:
                          driver.addressDetails.location.coords.longitude,
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
            </>
          )}
          {driver.referenceDetails && (
            <>
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: "700", fontSize: 16 }}>
                  Reference Check Details
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TextInput
                  label="Past Employer Name"
                  keyboardType="default"
                  style={{ backgroundColor: "#FBFEFB", flex: 1 }}
                  mode="outlined"
                  value={driver.referenceDetails.pastEmployerName}
                  onChangeText={(text) => {
                    _updateReference("pastEmployerName", text);
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
                  label="Past Employer Number (+91-)"
                  keyboardType="numeric"
                  style={{ backgroundColor: "#FBFEFB", flex: 1 }}
                  mode="outlined"
                  value={driver.referenceDetails.pastEmployerNumber}
                  onChangeText={(text) => {
                    _updateReference("pastEmployerNumber", text);
                  }}
                />
              </View>
              <View
                style={{
                  justifyContent: "center",
                }}
              >
                <View style={styles.spacerStyle}>
                  <DropDown
                    label={"Second Reference Type"}
                    mode={"outlined"}
                    visible={showSecondReferenceDropDown}
                    dropDownItemStyle={{ height: 50 }}
                    dropDownStyle={{
                      height: (secondReferenceList.length - 1) * 50 + 60,
                    }}
                    placeholder="Second Reference Type"
                    showDropDown={() => setShowSecondReferenceDropDown(true)}
                    onDismiss={() => setShowSecondReferenceDropDown(false)}
                    value={driver.referenceDetails.secondReferenceType}
                    setValue={updateSecondReference}
                    list={secondReferenceList}
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
                  label="Second Reference Name"
                  keyboardType="default"
                  style={{ backgroundColor: "#FBFEFB", flex: 1 }}
                  mode="outlined"
                  value={driver.referenceDetails.secondReferenceName}
                  onChangeText={(text) => {
                    _updateReference("secondReferenceName", text);
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
                  label="Second Reference Number (+91-)"
                  keyboardType="numeric"
                  style={{ backgroundColor: "#FBFEFB", flex: 1 }}
                  mode="outlined"
                  value={driver.referenceDetails.secondReferenceNumber}
                  onChangeText={(text) => {
                    _updateReference("secondReferenceNumber", text);
                  }}
                />
              </View>
              <View
                style={{ flex: 1, flexDirection: "row", marginVertical: 10 }}
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
                    Next
                  </Button>
                </View>
              </View>
            </>
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
    width: 96,
    height: 96,
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
