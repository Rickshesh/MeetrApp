import { View, Linking } from "react-native";
import {
  Button,
  Text,
  Surface,
  Avatar,
  AnimatedFAB,
  ActivityIndicator,
} from "react-native-paper";
import Amplify from "@aws-amplify/core";
import awsconfig from "../../src/aws-exports";
import { useState, useEffect } from "react";
import { GET_SUPPORT_NUMBER } from "@env";
import { useRoute } from "@react-navigation/native";
Amplify.configure(awsconfig);

export default function RegisterationStatusSubmission({ errorMessage }) {
  const [supportPhoneNumber, setSupportPhoneNumber] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [icon, setIcon] = useState("check");
  const [message1, setMessage1] = useState("");
  const [message2, setMessage2] = useState("");
  const [iconColor, setIconColor] = useState("green");
  const [status, setStatus] = useState("");
  const route = useRoute();

  const signOut = async () => {
    console.log("Signing out");
  };

  async function getSupportNumber(api_link) {
    try {
      const response = await fetch(api_link);
      const data = await response.json();
      setSupportPhoneNumber(JSON.parse(data.body).phone);
    } catch (error) {
      console.error(error); //Add an error dialog box here
    }
  }

  async function fetchData() {
    setLoading(true);
    await getSupportNumber(GET_SUPPORT_NUMBER);
    setLoading(false);
  }

  function displayStatus(status) {
    switch (status) {
      case "rejected":
        setMessage1(
          "The Case has been rejected, please apply after 6 months of application date"
        );
        setMessage2(null);
        setIcon("cancel");
        setIconColor("red");
        break;
      case "pending_driver_registeration":
        setMessage1("Congratulations on your eligibility with Meetr.");
        setMessage2(
          "Our Relationship Manager will get in contact with you shortly for address verification"
        );
        setIcon("check");
        setIconColor("green");
        break;
      case "pending_vehicle_registeration":
        setMessage1("Congratulations, physical verification is complete.");
        setMessage2(
          "Our representative will reach out shortly for vehicle onboarding"
        );
        setIcon("map-marker");
        setIconColor("green");
        break;
    }
  }

  function checkInitialRoute() {
    const { registeration_status } = route.params;
    if (registeration_status) {
      if (registeration_status == "registeration_success") {
        setStatus("pending_driver_registeration");
        displayStatus("pending_driver_registeration");
      } else if (registeration_status == "registeration_fail") {
        setStatus("rejected");
        displayStatus("rejected");
      } else if (registeration_status == "registeration_address_success") {
        setStatus("pending_vehicle_registeration");
        displayStatus("pending_vehicle_registeration");
      } else if (registeration_status == "registeration_vehicle_success") {
        setStatus("pending_vehicle_registeration");
        displayStatus("pending_vehicle_registeration");
      } else {
        setStatus("rejected");
        displayStatus("rejected");
      }
    }
  }

  useEffect(() => {
    checkInitialRoute();
    fetchData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {status && (
        <Surface
          style={{
            width: "80%",
            justifyContent: "center",
            padding: 10,
            height: 400,
          }}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Avatar.Icon
              size={72}
              icon={icon}
              style={{ backgroundColor: iconColor }}
            />
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text
              variant="bodyLarge"
              style={{ textAlign: "center", margin: 5 }}
            >
              {message1 && message1}
            </Text>
            <Text
              variant="bodyLarge"
              style={{ textAlign: "center", margin: 5 }}
            >
              {message2 && message2}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Button mode="contained" onPress={signOut}>
                Logout
              </Button>
            </View>
          </View>
        </Surface>
      )}
      {!status && (
        <View
          style={{ flex: 5, alignItems: "center", justifyContent: "center" }}
        >
          <Text variant="bodyMedium">{errorMessage}</Text>
        </View>
      )}
      <AnimatedFAB
        icon={
          isLoading
            ? () => <ActivityIndicator animating={true} color="white" />
            : "phone"
        }
        label={isLoading ? "" : "Contact Support"}
        animateFrom={"right"}
        extended={true}
        style={{
          bottom: 16,
          right: 16,
          position: "absolute",
          backgroundColor: "white",
        }}
        color="red"
        variant="surface"
        onPress={() => Linking.openURL(`tel:${supportPhoneNumber}`)}
      />
    </View>
  );
}
