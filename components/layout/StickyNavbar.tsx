import { Colors, FontFamily, Spacing, Typography } from "@/constants/Styles";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../common/ThemedText";
import { IconSymbol } from "../ui/IconSymbol";

export function StickyNavbar() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    toggleDutyStatus,
    isOnDuty,
    isDutyStatusLoading,
  } = useAuth();
  const { currentLocation, loading, refetch } = useLocation();

  const handleLocationPress = () => {
    // If address missing, try to get it again
    if (!currentLocation?.address) {
      refetch();
    }
  };

  const handleProfilePress = () => {
    if (isAuthenticated) {
      router.push("/profile");
    } else {
      router.push("/login");
    }
  };

  const handleProfileLongPress = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const newStatus = !isOnDuty;
    const statusText = newStatus ? "ON DUTY" : "OFF DUTY";

    Alert.alert(
      "Change Duty Status",
      `Are you sure you want to go ${statusText}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: `Go ${statusText}`,
          style: "default",
          onPress: async () => {
            try {
              await toggleDutyStatus();
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to update duty status. Please try again.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
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
      <TouchableOpacity
        onPress={handleProfilePress}
        onLongPress={handleProfileLongPress}
        delayLongPress={1000}
        disabled={isDutyStatusLoading}
      >
        <View style={styles.profileContainer}>
          <Image
            source={
              isOnDuty
                ? require("../../assets/images/profileOnline.png")
                : require("../../assets/images/profile.png")
            }
            style={[
              styles.profile,
              isDutyStatusLoading && styles.profileLoading,
            ]}
          />
          {isDutyStatusLoading && (
            <View style={styles.profileLoadingOverlay}>
              <ActivityIndicator size="small" color={Colors.whiteColor} />
            </View>
          )}
        </View>
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
  profileContainer: {
    position: "relative",
    width: 50,
    height: 50,
  },
  profile: {
    width: 50,
    height: 50,
  },
  profileLoading: {
    opacity: 0.6,
  },
  profileLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 25,
  },
});
