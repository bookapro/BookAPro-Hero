import { Colors } from "@/constants/Styles";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function LoadingScreen() {
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(Colors.primary);
    return () => {
      NavigationBar.setBackgroundColorAsync(Colors.whiteColor);
    };
  }, []);

  return (
    <View style={styles.loadingContainer}>
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
