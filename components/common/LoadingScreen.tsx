import { Colors } from "@/constants/Styles";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoadingScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Only set navigation bar style on Android, and use the new edge-to-edge compatible method
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
      return () => {
        NavigationBar.setVisibilityAsync("visible");
      };
    }
  }, []);

  return (
    <View
      style={[
        styles.loadingContainer,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Image
        source={require("../../assets/images/loadingLogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  logo: {
    width: 260,
    height: 260,
  },
});
