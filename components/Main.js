import React from 'react';
import DriverDetails from './screens/DriverDetails';
import RegisterDriver from './screens/RegisterDriver';
import RegisterBank from './screens/RegisterBank';
import RegisterAuto from './screens/RegisterAuto';
import DriverList from './screens/DriverList';
import TopBar from './screens/TopBar';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { StatusBar } from 'expo-status-bar';



const store = configureStore()


const Stack = createNativeStackNavigator();
const RegisterStack = createNativeStackNavigator();

const Main = () => {
    return (
        <Provider store={store}>
            <PaperProvider>
                <View style={styles.container}>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName="List" screenOptions={{ header: ({ navigation, route, options, back }) => { return (<TopBar navigation={navigation} route={route} options={options} back={back} />) } }}>
                            <Stack.Screen name="Register" component={Register} initialParams={{ initial: false }} />
                            <Stack.Screen name="List" component={DriverList} />
                            <Stack.Screen name="Details" component={DriverDetails} initialParams={{ driverid: "000003" }} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </View>
            </PaperProvider>
        </Provider>
    );
};

function Register() {
    return (
        <RegisterStack.Navigator initialRouteName="Driver">
            <RegisterStack.Screen name="Driver" component={RegisterDriver} options={{ title: "Driver Details" }} />
            <RegisterStack.Screen name="Bank" component={RegisterBank} options={{ title: "Bank Details" }} />
            <RegisterStack.Screen name="Auto" component={RegisterAuto} options={{ title: "Vehicle Details" }} />
        </RegisterStack.Navigator>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFEFB',
    },
});

export default Main;