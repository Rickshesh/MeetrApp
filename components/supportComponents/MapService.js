import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, StyleSheet, Text, Dimensions } from 'react-native'
import { IconButton } from 'react-native-paper';

export default function MapService({ currentLocation, scale, icon, iconcolor, locationHistory }) {

    return (

        <View style={{ flex: 1 }}>
            {!Array.isArray(locationHistory) ?
                <MapView
                    style={styles.map}
                    region={
                        scale ?
                            {
                                latitude: currentLocation.latitude,
                                longitude: currentLocation.longitude,
                                latitudeDelta: 0.00922 / scale,
                                longitudeDelta: 0.00421 / scale,
                            } :
                            {
                                latitude: currentLocation.latitude,
                                longitude: currentLocation.longitude,
                                latitudeDelta: 0.00922,
                                longitudeDelta: 0.00421,
                            }}
                >
                    <Marker coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }} pinColor="red" tracksViewChanges={false}>
                        {icon ? <IconButton icon={icon} color={iconcolor ? iconcolor : "blue"} /> : <></>}
                    </Marker>
                </MapView >
                :
                <MapView
                    style={styles.map}
                    region={
                        scale ?
                            {
                                latitude: currentLocation.latitude,
                                longitude: currentLocation.longitude,
                                latitudeDelta: 0.00922 / scale,
                                longitudeDelta: 0.00421 / scale,
                            } :
                            {
                                latitude: currentLocation.latitude,
                                longitude: currentLocation.longitude,
                                latitudeDelta: 0.00922,
                                longitudeDelta: 0.00421,
                            }}
                >
                    <Marker coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }} tracksViewChanges={false} anchor={icon && { x: 0.5, y: 0.5 }}>
                        {icon ? <IconButton icon={icon} iconColor={iconcolor ? iconcolor : "blue"} /> : <></>}
                    </Marker>
                    {locationHistory.map((item, index) => {
                        return (
                            <Marker key={index} coordinate={{ latitude: item.latitude, longitude: item.longitude }} tracksViewChanges={false} anchor={icon && { x: 0.5, y: 0.5 }}>
                                {icon ? <IconButton icon={icon} iconColor={iconcolor ? iconcolor : "lightskyblue"} /> : <></>}
                            </Marker>
                        )
                    })}

                    <Polyline strokeWidth={3} strokeColor="lightskyblue" coordinates={[currentLocation, ...locationHistory]} />
                </MapView >
            }
        </View >
    )
}


const styles = StyleSheet.create({
    map: {
        flex: 1
    },
});