import { Colors, FontFamily, Spacing, Typography } from "@/constants/Styles";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../common/ThemedText";
import { IconSymbol } from "../ui/IconSymbol";

export function StickyNavbar() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentLocation, errorMsg, loading, refetch } = useLocation();
  const { isAuthenticated } = useAuth();

  const handleLocationPress = () => {
    // If address missing, try to get it again
    if (!currentLocation?.address) {
      refetch();
    }
    console.log("HAHA");
  };

  const handleProfilePress = () => {
    if (isAuthenticated) {
      router.push("/profile");
    } else {
      router.push("/login");
    }
  };

  let locationContent;
  if (currentLocation?.address) {
    locationContent = (
      <ThemedText style={styles.address} numberOfLines={1}>
        {currentLocation.address}
      </ThemedText>
    );
  } else if (currentLocation?.coords) {
    locationContent = (
      <ThemedText style={styles.address} numberOfLines={1}>
        {`${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}`}
      </ThemedText>
    );
  } else {
    locationContent = (
      <TouchableOpacity onPress={handleLocationPress}>
        <ThemedText style={styles.address} numberOfLines={1}>
          Select your address
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {user ? (
          <>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={[styles.heroName, Typography.title]}>
              {user?.firstName}
            </ThemedText>
          </>
        ) : (
          <Image
            source={require("../../assets/images/noUserLogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        <View style={styles.addressContainer}>
          <IconSymbol
            size={24}
            style={{ marginLeft: -6 }}
            name="location-on"
            color={Colors.whiteColor}
          />
          {loading ? (
            <ActivityIndicator color={Colors.whiteColor} size="small" />
          ) : (
            locationContent
          )}
        </View>
      </View>
      <TouchableOpacity onPress={handleProfilePress}>
        <Image
          source={require("../../assets/images/profile.png")}
          style={styles.profile}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: Colors.primary,
  },
  leftSection: {
    flex: 1,
    rowGap: Spacing.xs,
  },
  heroName: {
    color: Colors.whiteColor,
  },
  address: {
    color: Colors.whiteColor,
    fontFamily: FontFamily.Montserrat,
    fontSize: 14,
  },
  addressWrapper: {
    maxWidth: "90%",
  },
  addressContainer: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.xl,
  },
  logo: {
    width: 100,
    height: 20,
    marginTop: Spacing.xl,
  },
  profile: {
    width: 40,
    height: 40,
  },
});
