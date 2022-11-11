import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, StyleSheet, Text, Dimensions } from 'react-native'
import { useEffect, useState } from 'react';

export default function MapService({ lat, lon }) {

    return (
        <MapView
            style={styles.map}
            region={{
                latitude: lat,
                longitude: lon,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
        >
            <Marker coordinate={{ latitude: lat, longitude: lon }} />
        </MapView>
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    }
});