import React from 'react';
import { Provider } from 'react-redux';
import { Text } from 'react-native'
import configureStore from './store/configureStore';
import NavigationHandler from './NavigationHandler';
import Dummy from "./Dummy";
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
import awsExports from '../src/aws-exports';
Amplify.configure(awsExports);


const store = configureStore()

const Main = () => {

    return (
        <Authenticator.Provider>
            <Authenticator
                components={{
                    SignIn: (props) => (
                        <Authenticator.SignIn {...props} hideSignUp />
                    ),
                }}
            >
                <Provider store={store}>
                    <NavigationHandler />
                </Provider>
            </Authenticator>
        </Authenticator.Provider>
    );
};



export default Main;