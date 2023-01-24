import React from 'react';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import NavigationHandler from './NavigationHandler';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react-native';
import awsExports from '../src/aws-exports';
Amplify.configure(awsExports);

// configure Amplify with the settings defined in the aws-exports.js file
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