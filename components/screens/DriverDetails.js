import * as React from "react";
import {
  Surface,
  List,
  Portal,
  Modal,
  IconButton,
  ActivityIndicator,
  Button,
  TextInput,
  Dialog,
  Paragraph,
  ProgressBar,
} from "react-native-paper";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import driverDetailsConfig from "../responses/driverDetailsConfig.json";
import MapService from "../supportComponents/MapService";
import { useSelector } from "react-redux";
import { driverStatus } from "../responses/driverStatus.json";
import { OFFLINE_PAYMENT_API } from "@env";
import { PubSub } from "aws-amplify";
import { Auth } from "aws-amplify";
import VideoThumbnail from "../supportComponents/VideoThumbnail";

export default function DriverDetails(props) {
  const [user, setUser] = React.useState([]);
  const [imageVisible, setImageVisible] = React.useState(false);
  const [startCamera, setStartCamera] = React.useState(false);
  const [showAddress, setShowAddress] = React.useState(false);
  const [showAadhaar, setShowAadhaar] = React.useState(false);
  const [showAutoFront, setShowAutoFront] = React.useState(false);
  const [showAutoBack, setShowAutoBack] = React.useState(false);
  const [showLiveLocation, setShowLiveLocation] = React.useState(false);
  const [paymentDialogBox, setPaymentDialogBox] = React.useState(false);
  const [errorDialog, setErrorDialogBox] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isLoading, setLoading] = React.useState(true);
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [deviceID, setDeviceID] = React.useState();
  const [paymentAmount, updatePaymentAmount] = React.useState("");

  const showModal = () => setImageVisible(true);
  const hideModal = () => setImageVisible(false);

  const _showAddress = () => setShowAddress(true);
  const _hideAddress = () => setShowAddress(false);

  const _showAadhaar = () => setShowAadhaar(true);
  const _hideAadhaar = () => setShowAadhaar(false);

  const _showAutoFront = () => setShowAutoFront(true);
  const _hideAutoFront = () => setShowAutoFront(false);

  const _showAutoBack = () => setShowAutoBack(true);
  const _hideAutoBack = () => setShowAutoBack(false);

  const _showLiveLocation = () => setShowLiveLocation(true);
  const _hideLiveLocation = () => setShowLiveLocation(false);

  const mqttData = useSelector((store) => store.driver.mqttData);

  const getUserDetails = (driverid) => {
    fetch(
      "https://ri6c0kl11e.execute-api.ap-south-1.amazonaws.com/beta/getuser/?driverid=" +
        driverid.toString()
    ) //S3 Link for Json
      .then((response) => response.json())
      .then((json) => {
        setUser(json);
        if (json.autoDetails.deviceID) {
          setDeviceID(json.autoDetails.deviceID);
        }
        if (json.creditPerformance) {
          updatePaymentAmount(
            json.creditPerformance.totalAmountPending.toString()
          );
        }
        //console.log(json)
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  };

  const __setStartCamera = () => {
    setStartCamera(!startCamera);
  };

  const getCurrentState = async () => {
    await PubSub.publish(
      "aws/device/" + deviceID,
      { message: "GET_CURRENT_STATE" },
      { provider: "AWSIoTProvider" }
    )
      .then((response) => console.log("Publish response:", response))
      .catch((err) => console.log("Publish Pub Err:", err));
  };

  const _updatePaymentAmount = (text) => {
    const filteredText = text.replace(/[^0-9]/g, "");
    updatePaymentAmount(filteredText);
  };

  async function collectPayment(partner_details, payment_amount, driverId) {
    const apiUrl = OFFLINE_PAYMENT_API;

    const data = {
      partner_details,
      payment_amount,
      driverId,
    };

    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    try {
      const response = await fetch(apiUrl, options);
      await response.json();
      setPaymentLoading(false);
      props.navigation.reset({
        index: 0,
        routes: [{ name: "List" }],
      });
    } catch (error) {
      setErrorDialogBox(true);
      setErrorMessage(error.toString()); //Handle 500 Error here
      setPaymentLoading(false);
    }
  }

  const recordPayment = () => {
    setPaymentLoading(true);
    Auth.currentAuthenticatedUser({
      bypassCache: true,
    }).then((partner) =>
      collectPayment(partner, parseInt(paymentAmount), user.driverId)
    );
  };

  //To fetch the API, pass the User ID
  React.useEffect(() => {
    setLoading(true);
    //console.log(props.route.params.driverid)
    getUserDetails(props.route.params.driverid);
    //console.log(mqttData);
    //console.log(props.navigation.getState());
  }, []);

  const displayInfo = driverDetailsConfig.displayInfo;

  return (
    <View style={styles.container}>
      <Portal>
        <Modal
          visible={showAddress}
          contentContainerStyle={styles.containerStyle}
          onDismiss={_hideAddress}
        >
          {user.identityParameters &&
            user.identityParameters.registerAddress && (
              <MapService
                currentLocation={{
                  latitude: parseFloat(
                    user.identityParameters.registerAddress.lat || 0
                  ),
                  longitude: parseFloat(
                    user.identityParameters.registerAddress.lon || 0
                  ),
                }}
              />
            )}
        </Modal>
        <Modal
          visible={showAadhaar}
          contentContainerStyle={styles.containerStyle}
          onDismiss={_hideAadhaar}
        >
          {user.identityParameters && user.identityParameters.frontAadhaar && (
            <Image
              source={{
                uri: user.identityParameters.frontAadhaar.uri || "",
              }}
              style={styles.modalImageStyle}
            />
          )}
          {user.identityParameters && user.identityParameters.backAadhaar && (
            <Image
              source={{
                uri: user.identityParameters.backAadhaar.uri || "",
              }}
              style={styles.modalImageStyle}
            />
          )}
        </Modal>
        <Modal
          visible={imageVisible}
          onDismiss={hideModal}
          contentContainerStyle={styles.containerStyle}
        >
          {user.identityParameters && user.identityParameters.image && (
            <Image
              source={{ uri: user.identityParameters.image.uri || "" }}
              style={styles.modalImageStyle}
            />
          )}
          {user.identityParameters && user.identityParameters.video && (
            <VideoThumbnail
              source={{ uri: user.identityParameters.video.uri || "" }}
              customStyle={styles.modalImageStyle}
            />
          )}
        </Modal>
        <Modal
          visible={showAutoFront}
          onDismiss={_hideAutoFront}
          contentContainerStyle={styles.containerStyle}
        >
          {user.autoDetails && user.autoDetails.frontAuto && (
            <Image
              source={{ uri: user.autoDetails.frontAuto.uri || "" }}
              style={styles.modalImageStyle}
            />
          )}
        </Modal>
        <Modal
          visible={showAutoBack}
          onDismiss={_hideAutoBack}
          contentContainerStyle={styles.containerStyle}
        >
          {user.autoDetails && user.autoDetails.backAuto && (
            <Image
              source={{ uri: user.autoDetails.backAuto.uri || "" }}
              style={styles.modalImageStyle}
            />
          )}
        </Modal>
        <Modal
          visible={showLiveLocation}
          onDismiss={_hideLiveLocation}
          contentContainerStyle={styles.containerStyle}
        >
          {mqttData[deviceID] && mqttData[deviceID].currentLocation && (
            <MapService
              currentLocation={mqttData[deviceID].currentLocation}
              locationHistory={mqttData[deviceID].locationHistory}
              style={{ flex: 1 }}
              icon="circle-slice-8"
            />
          )}
        </Modal>
        <Dialog
          visible={paymentDialogBox}
          onDismiss={() => {
            setPaymentDialogBox(false);
          }}
        >
          <Dialog.Content>
            <Paragraph style={{ fontSize: 16, fontWeight: "600" }}>
              Do you want to confirm collection of Rs. {paymentAmount}?
            </Paragraph>
            <Paragraph>
              By confirming, you confirm that the payment amount would be
              collected by Meetr from you on behalf of Driver.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setPaymentDialogBox(false);
              }}
            >
              Deny
            </Button>
            <Button
              onPress={() => {
                recordPayment();
              }}
              loading={paymentLoading}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={errorDialog}
          onDismiss={() => {
            setErrorDialogBox(false);
            setErrorMessage("");
          }}
        >
          <Dialog.Content>
            <Paragraph style={{ fontSize: 16, fontWeight: "600" }}>
              Payment Collection Failed
            </Paragraph>
            <Paragraph>{errorMessage}</Paragraph>
            <Paragraph>
              Currently, we are unable to record payment, retry later. Please
              contact support.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setErrorDialogBox(false);
                setErrorMessage("");
              }}
            >
              Okay
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {isLoading ? (
        <Surface
          style={[
            styles.surface,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator animating={true} />
        </Surface>
      ) : (
        <Surface style={styles.surface} elevation={2}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <View>
              <Surface
                elevation={2}
                style={
                  user.activeStatus !== "active"
                    ? {
                        flexDirection: "row",
                        backgroundColor: "#EFF1F3",
                        margin: 10,
                        padding: 10,
                      }
                    : {
                        backgroundColor: "#FFFFFF",
                        margin: 10,
                        padding: 10,
                        flexDirection: "row",
                      }
                }
              >
                <View style={{ flex: 1 }}></View>
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {user.identityParameters && user.identityParameters.image && (
                    <Pressable
                      onPress={() => {
                        showModal();
                      }}
                    >
                      <Image
                        source={{ uri: user.identityParameters.image.uri }}
                        style={styles.avatar}
                      />
                    </Pressable>
                  )}
                  {user.identityParameters && user.identityParameters.video && (
                    <VideoThumbnail
                      videoUri={user.identityParameters.video.uri}
                      customStyle={styles.avatar}
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flex: 1,
                      alignItems: "flex-end",
                      justifyContent: "flex-end",
                      paddingHorizontal: 10,
                    }}
                  >
                    <IconButton
                      icon="phone-in-talk"
                      mode="contained"
                      onPress={() =>
                        Linking.openURL(
                          `tel:${user.identityParameters.phoneNumber}`
                        )
                      }
                    />
                  </View>
                </View>
              </Surface>
              {user.activeStatus != "active" && (
                <Surface
                  style={{
                    height: 40,
                    marginHorizontal: 10,
                    marginTop: -10,
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      marginHorizontal: 5,
                    }}
                  >
                    <Text
                      style={{ fontWeight: "500", fontSize: 13, color: "red" }}
                    >
                      {driverStatus[user.activeStatus].field}
                    </Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "center",
                    }}
                  >
                    {(user.activeStatus == "pending_vehicle_registeration" ||
                      user.activeStatus == "pending_activation") && (
                      <TouchableOpacity
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#674FA3",
                          padding: 10,
                        }}
                        onPress={() =>
                          props.navigation.navigate("Register", {
                            screen: "Vehicle",
                            params: { driverId: user.driverId },
                          })
                        }
                      >
                        <View>
                          <Text
                            style={{
                              fontWeight: "400",
                              fontSize: 13,
                              color: "white",
                            }}
                          >
                            Register Vehicle
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    {user.activeStatus == "pending_driver_registeration" && (
                      <TouchableOpacity
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#674FA3",
                          padding: 10,
                        }}
                        onPress={() =>
                          props.navigation.navigate("Register", {
                            screen: "Address",
                            params: { driverId: user.driverId },
                          })
                        }
                      >
                        <View>
                          <Text
                            style={{
                              fontWeight: "400",
                              fontSize: 13,
                              color: "white",
                            }}
                          >
                            Register Address
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </Surface>
              )}
              {deviceID && user.activeStatus == "active" && (
                <Surface elevation={2} style={{ height: 200, margin: 10 }}>
                  {mqttData[deviceID] && (
                    <View style={{ flex: 1 }}>
                      <MapService
                        currentLocation={mqttData[deviceID].currentLocation}
                        locationHistory={mqttData[deviceID].locationHistory}
                        style={{ flex: 1 }}
                        icon="circle-slice-8"
                      />
                      <IconButton
                        icon="fullscreen"
                        onPress={() => _showLiveLocation()}
                        style={{
                          position: "absolute",
                          right: 2,
                          top: 2,
                          backgroundColor: "white",
                          borderWidth: 0.5,
                        }}
                      />
                      <Button
                        onPress={() => getCurrentState()}
                        style={{
                          position: "absolute",
                          right: 2,
                          bottom: 2,
                          backgroundColor: "white",
                          borderWidth: 0.5,
                        }}
                      >
                        Get Current State
                      </Button>
                    </View>
                  )}
                  {!mqttData[deviceID] && (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text>Trying to fetch Driver's Location</Text>
                    </View>
                  )}
                </Surface>
              )}
              {deviceID && mqttData[deviceID] && (
                <Surface
                  elevation={2}
                  style={{ height: 50, margin: 10, flexDirection: "row" }}
                >
                  <View
                    style={{
                      flex: 1,
                      marginHorizontal: 5,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "500" }}>
                      {parseFloat(mqttData[deviceID].Batterylife).toFixed(3) *
                        100}{" "}
                      %
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      marginHorizontal: 5,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "500" }}>
                      {mqttData[deviceID].currentSpeed} Km/Hr
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      marginHorizontal: 5,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={
                        mqttData[deviceID].RickshawStopped
                          ? { color: "red", fontWeight: "500" }
                          : { color: "green", fontWeight: "500" }
                      }
                    >
                      {mqttData[deviceID].RickshawStopped ? "OFF" : "ON"}
                    </Text>
                  </View>
                </Surface>
              )}
            </View>

            {user.creditPerformance && (
              <Surface elevation={2} style={{ margin: 10 }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    marginTop: 15,
                    marginHorizontal: 15,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, marginBottom: 5 }}>
                      {displayInfo.body.creditPerformance.totalAmountPending}
                    </Text>
                    <Text
                      style={
                        user.creditPerformance.totalAmountPending >= 600
                          ? { fontSize: 18, color: "red", fontWeight: "600" }
                          : { fontSize: 18, color: "green", fontWeight: "600" }
                      }
                    >
                      {user.creditPerformance.totalAmountPending}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      mode="contained"
                      onPress={() => setPaymentDialogBox(true)}
                    >
                      Collect Payment
                    </Button>
                  </View>
                </View>
                <View
                  style={{ flex: 0.5, marginTop: 15, marginHorizontal: 15 }}
                >
                  <TextInput
                    keyboardType="numeric"
                    mode="outlined"
                    value={paymentAmount}
                    onChangeText={(text) => {
                      _updatePaymentAmount(text);
                    }}
                    label="Collect Payment in Rs"
                  />
                </View>
                <View
                  style={{ flex: 0.5, marginTop: 15, marginHorizontal: 15 }}
                >
                  <Text style={{ fontSize: 18, marginBottom: 5 }}>
                    {displayInfo.body.creditPerformance.creditScore}
                  </Text>
                  <ProgressBar
                    animatedValue={user.creditPerformance.creditScore / 100}
                    color={
                      user.creditPerformance.creditScore < 60 ? "red" : "blue"
                    }
                  />
                </View>
                <View style={{ flex: 0.5, margin: 15 }}>
                  <Text style={{ fontSize: 18, marginBottom: 5 }}>
                    {displayInfo.body.creditPerformance.drivingScore}
                  </Text>
                  <ProgressBar
                    animatedValue={user.creditPerformance.drivingScore / 100}
                    color={
                      user.creditPerformance.drivingScore < 60 ? "red" : "blue"
                    }
                  />
                </View>
              </Surface>
            )}

            {user.identityParameters &&
              Object.keys(user.identityParameters).length != 0 && (
                <Surface
                  elevation={2}
                  style={{ margin: 10, paddingVertical: 10 }}
                >
                  <List.Subheader style={{ fontSize: 18 }}>
                    {displayInfo.head.identityParameters}
                  </List.Subheader>
                  {Object.keys(displayInfo.body.identityParameters).map(
                    (key, index) => {
                      return (
                        user.identityParameters[key] && (
                          <>
                            <List.Item
                              key={index}
                              title={displayInfo.body.identityParameters[key]}
                              description={user.identityParameters[key]}
                            />
                          </>
                        )
                      );
                    }
                  )}
                  <List.Item
                    title={
                      displayInfo.body.exceptions.identityParameters.aadhaar
                    }
                    description={user.identityParameters.aadhaar}
                    right={(props) => (
                      <IconButton
                        {...props}
                        icon="smart-card"
                        color="mediumblue"
                        onPress={_showAadhaar}
                      />
                    )}
                  />

                  {user.identityParameters &&
                    user.identityParameters.address && (
                      <List.Item
                        title={
                          displayInfo.body.exceptions.identityParameters
                            .registerAddress
                        }
                        description={
                          user.identityParameters.registerAddress.address
                        }
                        right={(props) => (
                          <IconButton
                            {...props}
                            icon="map-marker-check"
                            color="mediumblue"
                            onPress={_showAddress}
                          />
                        )}
                      />
                    )}
                </Surface>
              )}
            {user.bankingDetails &&
              Object.keys(user.bankingDetails).length != 0 && (
                <Surface
                  elevation={2}
                  style={{ margin: 10, paddingVertical: 10 }}
                >
                  <List.Subheader style={{ fontSize: 18 }}>
                    {displayInfo.head.bankingDetails}
                  </List.Subheader>
                  {Object.keys(displayInfo.body.bankingDetails).map(
                    (key, index) => {
                      return (
                        <List.Item
                          key={index}
                          title={displayInfo.body.bankingDetails[key]}
                          description={user.bankingDetails[key]}
                        />
                      );
                    }
                  )}
                </Surface>
              )}
            {user.autoDetails && Object.keys(user.autoDetails).length != 0 && (
              <Surface
                elevation={2}
                style={{ margin: 10, paddingVertical: 10 }}
              >
                <List.Subheader style={{ fontSize: 18 }}>
                  {displayInfo.head.autoDetails}
                </List.Subheader>
                {Object.keys(displayInfo.body.autoDetails).map((key, index) => {
                  return (
                    user.autoDetails[key] && (
                      <List.Item
                        key={index}
                        title={displayInfo.body.autoDetails[key]}
                        description={user.autoDetails[key] || ""}
                      />
                    )
                  );
                })}
                {
                  <View style={{ flex: 1 }}>
                    <List.Subheader style={{ fontSize: 18 }}>
                      {displayInfo.body.exceptions.autoDetails.autoImages}
                    </List.Subheader>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        {user.autoDetails.numberPlateView && (
                          <>
                            <View>
                              <Image
                                source={{
                                  uri: user.autoDetails.numberPlateView.uri,
                                }}
                                style={styles.vehicleImageStyle}
                              />
                            </View>
                            <View
                              style={{
                                justifyContent: "center",
                                marginTop: 5,
                              }}
                            >
                              <Text
                                style={{
                                  textAlign: "center",
                                  fontFamily: "sans-serif-light",
                                }}
                              >
                                {
                                  displayInfo.body.exceptions.autoDetails
                                    .numberPlateView
                                }
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        {user.autoDetails.frontVehicleView && (
                          <>
                            <View>
                              <Image
                                source={{
                                  uri: user.autoDetails.frontVehicleView.uri,
                                }}
                                style={styles.vehicleImageStyle}
                              />
                            </View>
                            <View
                              style={{
                                justifyContent: "center",
                                marginTop: 5,
                              }}
                            >
                              <Text
                                style={{
                                  textAlign: "center",
                                  fontFamily: "sans-serif-light",
                                }}
                              >
                                {
                                  displayInfo.body.exceptions.autoDetails
                                    .frontVehicleView
                                }
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                    <View
                      style={{ flex: 1, flexDirection: "row", marginTop: 10 }}
                    >
                      <View style={{ flex: 1 }}>
                        {user.autoDetails.rightVehicleView && (
                          <>
                            <View>
                              <Image
                                source={{
                                  uri: user.autoDetails.rightVehicleView.uri,
                                }}
                                style={styles.vehicleImageStyle}
                              />
                            </View>
                            <View
                              style={{
                                justifyContent: "center",
                                marginTop: 5,
                              }}
                            >
                              <Text
                                style={{
                                  textAlign: "center",
                                  fontFamily: "sans-serif-light",
                                }}
                              >
                                {
                                  displayInfo.body.exceptions.autoDetails
                                    .rightVehicleView
                                }
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        {user.autoDetails.backVehicleView && (
                          <>
                            <View>
                              <Image
                                source={{
                                  uri: user.autoDetails.backVehicleView.uri,
                                }}
                                style={styles.vehicleImageStyle}
                              />
                            </View>
                            <View
                              style={{
                                justifyContent: "center",
                                marginTop: 5,
                              }}
                            >
                              <Text
                                style={{
                                  textAlign: "center",
                                  fontFamily: "sans-serif-light",
                                }}
                              >
                                {
                                  displayInfo.body.exceptions.autoDetails
                                    .backVehicleView
                                }
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                }
                {}
                {user.autoDetails.frontAuto && (
                  <>
                    <List.Item
                      title={displayInfo.body.exceptions.autoDetails.autoImages}
                    />
                    <View style={styles.inlineElement}>
                      <Pressable onPress={_showAutoFront}>
                        {user.autoDetails.frontAuto && (
                          <Image
                            source={{
                              uri: user.autoDetails.frontAuto.uri || "",
                            }}
                            style={styles.inlineImage}
                          />
                        )}
                      </Pressable>
                      <Pressable onPress={_showAutoBack}>
                        {user.autoDetails.backAuto && (
                          <Image
                            source={{
                              uri: user.autoDetails.backAuto.uri || "",
                            }}
                            style={styles.inlineImage}
                          />
                        )}
                      </Pressable>
                    </View>
                  </>
                )}
              </Surface>
            )}
            {user.addressDetails &&
              Object.keys(user.addressDetails).length != 0 && (
                <Surface
                  elevation={2}
                  style={{ margin: 10, paddingVertical: 10 }}
                >
                  <List.Subheader style={{ fontSize: 18 }}>
                    {displayInfo.head.addressDetails}
                  </List.Subheader>
                  {user.addressDetails.userAddress && (
                    <List.Item
                      title={displayInfo.body.addressDetails.registeredAddress}
                      description={user.addressDetails.userAddress}
                    />
                  )}
                  <View
                    style={{
                      height: 200,
                      marginHorizontal: 10,
                      marginBottom: 10,
                      borderWidth: 1,
                    }}
                    elevation={2}
                  >
                    <MapService
                      currentLocation={{
                        latitude: user.autoDetails.location.coords.latitude,
                        longitude: user.autoDetails.location.coords.longitude,
                      }}
                      style={{ flex: 1 }}
                    />
                  </View>
                </Surface>
              )}
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
    borderRadius: 96 / 4,
  },
  inlineImage: {
    width: 144,
    height: 144,
    resizeMode: "contain",
  },
  inlineElement: {
    flexDirection: "row",
    justifyContent: "space-around",
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
  vehicleImageStyle: {
    height: 96,
    resizeMode: "contain",
  },
  cameraButtonStyle: {
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    right: 0,
  },
});
