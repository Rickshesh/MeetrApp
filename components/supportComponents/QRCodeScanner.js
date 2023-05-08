import { BarCodeScanner } from "expo-barcode-scanner";
import { Camera } from "expo-camera";
import { useEffect, useState } from "react";
import { Text, Button } from "react-native-paper";
import { View, StyleSheet } from "react-native";

export default function QRCodeScanner({ _setQRScan, _hideScanner }) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const permissionFunction = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === "granted");
  };

  const handleBarCodeScanned = ({ type, data }) => {
    console.log(type);
    setScanned(true);
    _setQRScan(data);
    _hideScanner();
  };

  useEffect(() => {
    permissionFunction();
  }, []);

  if (hasCameraPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {scanned && (
        <Button
          title={"Tap to Scan Again"}
          onPress={() => this.setState({ scanned: false })}
        />
      )}
    </View>
  );
}
