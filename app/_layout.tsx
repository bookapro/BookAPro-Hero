import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import LoadingScreen from "@/components/common/LoadingScreen";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Orbitron: require("../assets/fonts/Orbitron-Regular.ttf"),
    OrbitronMedium: require("../assets/fonts/Orbitron-Medium.ttf"),
    OrbitronBold: require("../assets/fonts/Orbitron-Bold.ttf"),
    Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
    MontserratMedium: require("../assets/fonts/Montserrat-Medium.ttf"),
    MontserratBold: require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    if (loaded) {
      // Simulate app initialization time and show loading screen
      const timer = setTimeout(() => {
        setIsAppReady(true);
        SplashScreen.hideAsync();
      }, 2500); // Show loading screen for 2.5 seconds

      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded || !isAppReady) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <LocationProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
