import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, StyleSheet, Text, Dimensions } from 'react-native'
import { useEffect, useState } from 'react';

export default function MapService({ lat, lon, _setLocation }) {

    const [location, setLocation] = useState(null);

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
            <Marker draggable coordinate={{ latitude: location.lat, longitude: location.lon }} onDragEnd={(coordinate) => _onDragEnd(coordinate)} />
        </MapView >
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    }
});