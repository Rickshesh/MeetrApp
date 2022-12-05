import React from 'react';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import NavigationHandler from './NavigationHandler';

const store = configureStore()

const Main = () => {

    return (
        <Provider store={store}>
            <NavigationHandler />
        </Provider>
    );
};



export default Main;