import React from "react";
import { Provider } from "react-redux";
import { Provider as PaperProvider } from "react-native-paper";
import configureStore from "./store/configureStore"; // Importing configureStore function for setting up the redux store
import NavigationHandler from "./NavigationHandler"; // Importing NavigationHandler component for handling navigation within the application
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react-native";
import awsExports from "../src/aws-exports";
import RegisterAddress from "./screens/RegisterAddress";
import RegisterQualificationScreen from "./screens/RegisterQualificationScreen";
import RegisterVehicle from "./screens/RegisterVehicle";

//Main is the entry point of the App, and provides various functionalities, by importing Global Store, Amplify, Authentication Screen

// Configuring the Amplify library with the settings defined in the aws-exports.js file
Amplify.configure(awsExports);

// Setting up the redux store
const store = configureStore();

const Main = () => {
  return (
    <Authenticator.Provider>
      <Authenticator
        components={{
          SignIn: (props) => <Authenticator.SignIn {...props} hideSignUp />,
        }}
      >
        <Provider store={store}>
          <PaperProvider>
            <NavigationHandler />
          </PaperProvider>
        </Provider>
      </Authenticator>
    </Authenticator.Provider>
  );
};

export default Main;
