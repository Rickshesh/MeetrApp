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
import { useDispatch, useSelector } from 'react-redux';
import { resetDriver, toggleAccountSection } from "./actions/UserActions";
import { useEffect } from 'react';
import DrawerSection from './screens/DrawerSection';

const RegisterStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function NavigationHandler() {
    const dispatch = useDispatch();

    const showAccountSection = useSelector(store => store.driver.showAccountSection)

    useEffect(() => {
        if (showAccountSection) {
            dispatch(toggleAccountSection())
        }
        dispatch(resetDriver());
    }, [])

    return (
        <PaperProvider>
            <View style={styles.container}>
                <NavigationContainer>
                    <Drawer.Navigator initialRouteName="List"
                        screenOptions={{ header: ({ navigation, route, options, layout }) => { return (<TopBar navigation={navigation} route={route} options={options} layout={layout} />) } }}
                        backBehavior="initialRoute"
                        drawerContent={({ state, navigation, descriptors }) => <DrawerSection state={state} navigation={navigation} descriptors={descriptors} />}
                    >
                        <Drawer.Screen name="List" component={DriverList} options={{ title: "Driver List", unmountOnBlur: true }} />
                        <Drawer.Screen name="Register" component={Register} options={{ title: "Register Driver", unmountOnBlur: true }}
                            listeners={() => ({ blur: () => { dispatch(resetDriver()); } })}
                        />
                        <Drawer.Screen name="Details" component={DriverDetails} options={{ unmountOnBlur: true }} />
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