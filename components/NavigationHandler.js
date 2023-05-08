import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import TopBar from "./screens/TopBar";
import DriverDetails from "./screens/DriverDetails";
import RegisterDriver from "./screens/RegisterDriver";
import RegisterBank from "./screens/RegisterBank";
import RegisterAuto from "./screens/RegisterAuto";
import DriverList from "./screens/DriverList";
import AccountSection from "./screens/AccountSection";
import RegisterationStatusSubmission from "./screens/RegisterationStatusSubmission";
import RegisterQualificationScreen from "./screens/RegisterQualificationScreen";
import RegisterVehicle from "./screens/RegisterVehicle";
import RegisterAddress from "./screens/RegisterAddress";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useDispatch, useSelector } from "react-redux";
import { resetDriver, toggleAccountSection } from "./actions/UserActions";
import { useEffect } from "react";
import DrawerSection from "./screens/DrawerSection";
import { AWSIoTProvider } from "@aws-amplify/pubsub";
import { Amplify, PubSub } from "aws-amplify";
import { CONNECTION_STATE_CHANGE } from "@aws-amplify/pubsub";
import { Hub } from "aws-amplify";

//NavigationHandler consumes Provider Store, and Provides navigation inside the App, by using 2 Navigators, Drawer, and Stack
//Stack Navigator has 3 screens and is used for registeration, and is called inside Drawer Navigator, which is the main navigator, with Top Bar Also
//The Navigation Handler also, includes PubSub for MQTT Communication

Amplify.addPluggable(
  new AWSIoTProvider({
    aws_pubsub_region: "ap-south-1",
    aws_pubsub_endpoint:
      "wss://ata8s3hvseeyg-ats.iot.ap-south-1.amazonaws.com/mqtt",
  })
);
PubSub.configure();

Hub.listen("pubsub", (data) => {
  const { payload } = data;
  if (payload.event === CONNECTION_STATE_CHANGE) {
    const connectionState = payload.data.connectionState;
    console.log(connectionState);
  }
});

const RegisterStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function NavigationHandler() {
  const dispatch = useDispatch();

  const showAccountSection = useSelector(
    (store) => store.driver.showAccountSection
  );

  useEffect(() => {
    if (showAccountSection) {
      dispatch(toggleAccountSection());
    }
    dispatch(resetDriver());
  }, []);

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="List"
          screenOptions={{
            header: ({ navigation, route, options, layout }) => {
              return (
                <TopBar
                  navigation={navigation}
                  route={route}
                  options={options}
                  layout={layout}
                />
              );
            },
          }}
          backBehavior="initialRoute"
          drawerContent={({ state, navigation, descriptors }) => (
            <DrawerSection
              state={state}
              navigation={navigation}
              descriptors={descriptors}
            />
          )}
        >
          <Drawer.Screen
            name="List"
            component={DriverList}
            options={{ title: "Driver List", unmountOnBlur: true }}
          />
          <Drawer.Screen
            name="Register"
            component={DriverRegisteration}
            options={{ title: "Register Driver", unmountOnBlur: true }}
            listeners={() => ({
              blur: () => {
                dispatch(resetDriver());
              },
            })}
          />
          <Drawer.Screen
            name="Details"
            component={DriverDetails}
            options={{ unmountOnBlur: true }}
          />
          <Drawer.Screen
            name="Auto"
            component={RegisterAuto}
            options={{ title: "Vehicle Details", unmountOnBlur: true }}
            listeners={() => ({
              blur: () => {
                dispatch(resetDriver());
              },
            })}
          />
        </Drawer.Navigator>
      </NavigationContainer>
      <AccountSection />
    </View>
  );
}

function DriverRegisteration() {
  return (
    <RegisterStack.Navigator
      initialRouteName="Driver"
      screenOptions={{
        headerShown: false,
      }}
    >
      <RegisterStack.Screen
        name="Driver"
        component={RegisterQualificationScreen}
        options={{ title: "Customer Details" }}
      />
      <RegisterStack.Screen
        name="Vehicle"
        component={RegisterVehicle}
        options={{ title: "Vehicle Details" }}
      />
      <RegisterStack.Screen
        name="Address"
        component={RegisterAddress}
        options={{ title: "Address Details" }}
      />
      <RegisterStack.Screen
        name="Status"
        component={RegisterationStatusSubmission}
        options={{ title: "Registeration Status" }}
      />
    </RegisterStack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFEFB",
  },
});
