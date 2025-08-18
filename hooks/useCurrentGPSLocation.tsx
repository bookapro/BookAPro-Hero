import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Platform } from "react-native";

export function useCurrentGPSLocation() {
  const [gpsLocation, setGpsLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setErrorMsg(
          "Location permission is required to use this app. Enable it in device settings."
        );
        setLoading(false);
        Alert.alert(
          "Location Required",
          "You must allow location access to use this app. Go to settings to enable.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () =>
                Platform.OS === "ios"
                  ? Linking.openURL("app-settings:")
                  : Linking.openSettings(),
            },
          ]
        );
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      let address = null;
      try {
        const addrRes = await Location.reverseGeocodeAsync(location.coords);
        if (addrRes && addrRes.length > 0) {
          const firstAddress = addrRes[0];
          address = `${firstAddress.name || ""}, ${firstAddress.city || ""}, ${
            firstAddress.region || ""
          }`.replace(/^,\s*|,\s*$/g, "");
        }
      } catch (err) {}
      setGpsLocation({ ...location, address });
      setLoading(false);
    } catch (err) {
      setErrorMsg("Failed to get location.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { gpsLocation, errorMsg, loading, refetch: fetchLocation };
}
