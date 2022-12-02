import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, StyleSheet, Text, Dimensions, Image } from 'react-native'
import auto from "../../assets/Location_auto.png";

export default function MapService({ lat, lon, scale }) {

    return (
        <MapView
            style={styles.map}
            region={
                scale ?
                    {
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: 0.00922 / scale,
                        longitudeDelta: 0.00421 / scale,
                    } :
                    {
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: 0.00922,
                        longitudeDelta: 0.00421,
                    }}
        >
            <Marker coordinate={{ latitude: lat, longitude: lon }} >
            </Marker>
        </MapView >
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    },
});