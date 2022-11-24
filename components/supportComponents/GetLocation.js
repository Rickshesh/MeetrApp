import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native'
import { TextInput } from 'react-native-paper';


export default function GetLocation({ _getAddress }) {

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [locationServiceEnabled, setLocationServiceEnabled] = useState(false);
    const [displayCurrentAddress, setDisplayCurrentAddress] = useState(
        'Wait, we are fetching you location...'
    );

    const _setLocation = async (latitude, longitude) => {
        let tempLocation = {
            latitude: latitude,
            longitude: longitude
        }
        let response = await Location.reverseGeocodeAsync({
            latitude,
            longitude
        });

        for (let item of response) {
            let address = `${item.name}, ${item.street}, ${item.region}, ${item.postalCode}, ${item.city}`;

            setDisplayCurrentAddress(address);

            _getAddress({ latitude, longitude }, address);

        }

        console.log(tempLocation);
        setLocation(tempLocation);
    }

    const _setAddress = (text) => {
        _getAddress(location, text);
        setDisplayCurrentAddress(text);
    }

    useEffect(() => {
        CheckIfLocationEnabled();
        GetCurrentLocation();
    }, []);

    const CheckIfLocationEnabled = async () => {
        let enabled = await Location.hasServicesEnabledAsync();

        if (!enabled) {
            Alert.alert(
                'Location Service not enabled',
                'Please enable your location services to continue',
                [{ text: 'OK' }],
                { cancelable: false }
            );
        } else {
            setLocationServiceEnabled(enabled);
        }
    };

    const GetCurrentLocation = async () => {

        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }

        let { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });

        if (coords) {
            const { latitude, longitude } = coords;
            let response = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            setLocation({ latitude, longitude });

            for (let item of response) {
                let address = `${item.name}, ${item.street}, ${item.region}, ${item.postalCode}, ${item.city}`;

                setDisplayCurrentAddress(address);

                _getAddress({ latitude, longitude }, address);

            }


        }

    }


    let fetchingLocationText = 'Fetching Location..';


    return (
        <View style={styles.container}>
            {location === null ?
                <Text style={{ alignSelf: "center" }}>{fetchingLocationText}</Text> :
                <View style={styles.mapsContainer}>
                    <MapView
                        style={styles.mapsContainer}
                        region={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.00922,
                            longitudeDelta: 0.00421,
                        }}
                    >
                        <Marker draggable coordinate={{ latitude: location.latitude, longitude: location.longitude }} onDragEnd={(e) => { _setLocation(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude); }} />
                    </MapView>
                    <View style={styles.addressBox}>
                        <TextInput label="Address" mode="outlined" onChangeText={(text) => { _setAddress(text) }} value={displayCurrentAddress} />
                    </View>
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
    },
    addressBox: {
        margin: 10
    }
});