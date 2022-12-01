import React from 'react';
import DriverDetails from './screens/DriverDetails';
import RegisterDriver from './screens/RegisterDriver';
import RegisterBank from './screens/RegisterBank';
import RegisterAuto from './screens/RegisterAuto';
import TopBar from './screens/TopBar';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { StatusBar } from 'expo-status-bar';



const store = configureStore()


const Stack = createNativeStackNavigator()


const Main = () => {
    return (
        <Provider store={store}>
            <PaperProvider>
                <View style={styles.container}>
                    <NavigationContainer>
                        <TopBar />
                        <Stack.Navigator>
                            <Stack.Screen name="Details" component={DriverDetails} initialParams={{ 'driverid': '87823a70-4f2e-4904-ae2a-724e88dcf7f5' }} />
                            <Stack.Screen name="Driver" component={RegisterDriver} />
                            <Stack.Screen name="Bank" component={RegisterBank} />
                            <Stack.Screen name="Auto" component={RegisterAuto} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </View>
            </PaperProvider>
        </Provider>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFEFB',
    },
});

export default Main;