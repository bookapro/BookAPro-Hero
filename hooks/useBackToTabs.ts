import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";
import { useRouter, useNavigation } from "expo-router";

export default function useBackToTabs() {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    // --- ANDROID hardware back ---
    if (Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        router.navigate("/(tabs)");
        return true; // prevent default back
      });

      return () => backHandler.remove();
    }

    // --- iOS header back & swipe gesture ---
    if (Platform.OS === "ios") {
      navigation.setOptions({
        gestureEnabled: true, // keep swipe gesture
        headerBackVisible: true,
        headerLeft: () => null, // hide default back button (optional)
      });

      // intercept "beforeRemove" event for both back button and swipe
      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        e.preventDefault(); // stop default back
        router.navigate("/(tabs)");
      });

      return unsubscribe;
    }
  }, [navigation]);
}
