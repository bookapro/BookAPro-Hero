import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { StickyNavbar } from "@/components/layout/StickyNavbar";
import { Colors, FontFamily } from "@/constants/Styles";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const { isOnDuty, isDutyStatusLoading } = useAuth();

  return (
    <ThemedView style={{ flex: 1 }}>
      <StickyNavbar />

      {/* Duty Status Bar */}
      <View
        style={[
          styles.dutyStatusBar,
          {
            backgroundColor: isOnDuty ? Colors.success : Colors.greyColor,
          },
        ]}
      >
        {isDutyStatusLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={Colors.whiteColor}
              style={styles.loadingIndicator}
            />
            <ThemedText style={styles.dutyStatusText}>Updating...</ThemedText>
          </View>
        ) : (
          <ThemedText style={styles.dutyStatusText}>
            {isOnDuty ? "ON DUTY" : "OFF DUTY"}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  dutyStatusBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  dutyStatusText: {
    color: Colors.whiteColor,
    fontFamily: FontFamily.MontserratBold,
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIndicator: {
    marginRight: 8,
  },
});
