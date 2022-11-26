import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, StyleSheet, Text, Dimensions } from 'react-native'

export default function MapService({ lat, lon }) {

    return (
        <MapView
            style={styles.map}
            region={{
                latitude: lat,
                longitude: lon,
                latitudeDelta: 0.00922,
                longitudeDelta: 0.00421,
            }}
        >
            <Marker coordinate={{ latitude: lat, longitude: lon }} />
        </MapView >
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    }
});