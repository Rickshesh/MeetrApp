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
        console.log("Inside GeoLocation");
        const setCurrentLocation = async () => {
            console.log("Setting Current Location");
            await CheckIfLocationEnabled();
            await GetCurrentLocation();
        }
        setCurrentLocation();
    }, []);

    const CheckIfLocationEnabled = async () => {
        console.log("Checking Location Enable");
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

        console.log("Getting current Location");

        try {
            let { status } = await Location.requestForegroundPermissionsAsync();

            console.log(status);

            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest, timeInterval: 2000 });

            console.log(coords);

            if (coords) {
                const { latitude, longitude } = coords;
                let response = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude
                });

                console.log(response);

                setLocation({ latitude, longitude });

                for (let item of response) {
                    let address = `${item.name != null ? item.name + ", " : ""}${item.streetNumber != null ? item.streetNumber + ", " : ""}${item.street != null ? item.street + ", " : ""}${item.district != null ? item.district + ", " : ""}${item.city != null ? item.city + ", " : ""}${item.region != null ? item.region + ", " : ""}${item.country != null ? item.country + ", " : ""}${item.isoCountryCode != null ? item.isoCountryCode : ""}`;

                    setDisplayCurrentAddress(address);

                    _getAddress({ latitude, longitude }, address);

                }
            }
        }
        catch (err) {
            console.log(err);
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