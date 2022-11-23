import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native'
import { Surface, List, TextInput, Button } from 'react-native-paper'
import MapService from './MapService';


export default function GetLocation() {

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        (async () => {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            setLocation(location);
        })();
    }, []);

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    return (
        <View style={styles.container}>
            {location === null ?
                <Text style={{ alignSelf: "center" }}>{text}</Text> :
                <View style={styles.mapsContainer}>
                    <MapService lat={location.coords.latitude} lon={location.coords.longitude} style={styles.container} />
                </View>
            }
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center"
    },
    mapsContainer: {
        flex: 1
    }
});