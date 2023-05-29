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

export default function PartnerStatus({ errorMessage }) {
  const [supportPhoneNumber, setSupportPhoneNumber] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [icon, setIcon] = useState("check");
  const [message1, setMessage1] = useState("");
  const [message2, setMessage2] = useState("");
  const [iconColor, setIconColor] = useState("green");

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
      case "pending_bank_registeration":
        setMessage1(
          "Congratulations your details have been recorded for Meetr."
        );
        setMessage2("Proceed ahead with your bank details");
        setIcon("bank-check");
        setIconColor("green");
        break;
    }
  }

  useEffect(() => {
    checkInitialRoute();
    fetchData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
          <Text variant="bodyLarge" style={{ textAlign: "center", margin: 5 }}>
            {message1 && message1}
          </Text>
          <Text variant="bodyLarge" style={{ textAlign: "center", margin: 5 }}>
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
