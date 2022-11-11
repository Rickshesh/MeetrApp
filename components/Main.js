import React from 'react';
import DriverDetails from './screens/DriverDetails';
import TopBar from './screens/TopBar';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MD3LightTheme as DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import MapService from './supportComponents/MapService';

const Main = () => {
    return (
        <PaperProvider>
            <View style={styles.container}>
                <TopBar />
                <DriverDetails driverid="000001" />
            </View>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFEFB',
    },
});

export default Main;