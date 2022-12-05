import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import TopBar from './screens/TopBar';
import DriverDetails from './screens/DriverDetails';
import RegisterDriver from './screens/RegisterDriver';
import RegisterBank from './screens/RegisterBank';
import RegisterAuto from './screens/RegisterAuto';
import DriverList from './screens/DriverList';
import AccountSection from './screens/AccountSection';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useDispatch } from 'react-redux';
import { resetDriver } from "./actions/UserActions";





const RegisterStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function NavigationHandler() {
    const dispatch = useDispatch();

    return (
        <PaperProvider>
            <View style={styles.container}>
                <NavigationContainer>
                    <Drawer.Navigator initialRouteName="List"
                        screenOptions={{ header: ({ navigation, route, options, layout }) => { return (<TopBar navigation={navigation} route={route} options={options} layout={layout} />) } }}
                        backBehavior="initialRoute"
                    >
                        <Drawer.Screen name="List" component={DriverList} options={{ title: "Driver List" }} />
                        <Drawer.Screen name="Register" component={Register} options={{ title: "Register Driver", unmountOnBlur: true }}
                            listeners={() => ({ blur: () => { dispatch(resetDriver()); } })}
                        />
                        <Drawer.Screen name="Details" component={DriverDetails} initialParams={{ driverid: "000003" }} />
                    </Drawer.Navigator>
                </NavigationContainer>
                <AccountSection />
            </View>
        </PaperProvider>
    )
}


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