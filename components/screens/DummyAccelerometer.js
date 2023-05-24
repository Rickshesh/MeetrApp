import React, { useState, useEffect } from "react";
import { Text } from "react-native";
import { Accelerometer } from "expo-sensors";

export default function App() {
  const [orientation, setOrientation] = useState("Unknown");
  let _subscription;

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const _subscribe = () => {
    Accelerometer.setUpdateInterval(250); // sets the update interval to 1000ms

    _subscription = Accelerometer.addListener((accelerometerData) => {
      const { x, y } = accelerometerData;

      if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) {
          setOrientation("Landscape Left");
        } else {
          setOrientation("Landscape Right");
        }
      } else {
        if (y > 0) {
          setOrientation("Portrait Down");
        } else {
          setOrientation("Portrait Up");
        }
      }
    });
  };

  const _unsubscribe = () => {
    _subscription && _subscription.remove();
    _subscription = null;
  };

  return <Text>Orientation: {orientation}</Text>;
}
