import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors, Spacing } from "@/constants/Styles";
import { useAuth } from "@/contexts/AuthContext";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const userSettings = [
  {
    id: "1",
    title: "Personal Information",
    icon: "person" as const,
    description: "Update your personal details",
  },
  {
    id: "2",
    title: "Payment Methods",
    icon: "payment" as const,
    description: "Manage your payment options",
  },
  {
    id: "3",
    title: "Addresses",
    icon: "location-on" as const,
    description: "Manage your saved addresses",
  },
  {
    id: "4",
    title: "Notifications",
    icon: "notifications" as const,
    description: "Configure notification preferences",
  },
  {
    id: "5",
    title: "Security",
    icon: "security" as const,
    description: "Manage your account security",
  },
  {
    id: "6",
    title: "Help & Support",
    icon: "help" as const,
    description: "Get help and contact support",
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Debug authentication state
  console.log(`🔍 [PROFILE] isAuthenticated: ${isAuthenticated}`);
  console.log(`🔍 [PROFILE] user:`, user);

  // Check storage state on mount
  React.useEffect(() => {
    const checkStorage = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("user");
        const storedAuthToken = await SecureStore.getItemAsync("accessToken");
        console.log(`🔍 [PROFILE] Stored user:`, storedUser);
        console.log(`🔍 [PROFILE] Stored auth token:`, !!storedAuthToken);
      } catch (error) {
        console.error("Error checking storage:", error);
      }
    };
    checkStorage();
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  const getInitials = (
    firstName?: string,
    lastName?: string,
    fallbackName?: string
  ) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (fallbackName) {
      return fallbackName
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedView style={styles.container}>
          <View style={styles.authContainer}>
            <ThemedText>Loading...</ThemedText>
          </View>
        </ThemedView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol size={24} name="arrow-back" color={Colors.primary} />
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.profileImageContainer}>
              <ThemedText style={styles.profileInitials}>
                {getInitials(user?.firstName, user?.lastName, user?.name)}
              </ThemedText>
            </View>
            <View style={styles.userInfo}>
              <ThemedText type="title">{user?.firstName || "User"}</ThemedText>
              <ThemedText style={styles.phoneNumber}>
                {user?.phoneNumber}
              </ThemedText>
              {user?.email && (
                <ThemedText style={styles.email}>{user.email}</ThemedText>
              )}
            </View>
          </View>

          <View style={styles.settingsList}>
            {userSettings.map((setting) => (
              <TouchableOpacity
                key={setting.id}
                style={styles.settingItem}
                onPress={() => {
                  // Handle setting press
                  console.log(`Setting pressed: ${setting.title}`);
                  Alert.alert(
                    "Coming Soon",
                    `${setting.title} feature is coming soon!`
                  );
                }}
              >
                <View style={styles.settingIcon}>
                  <IconSymbol
                    size={24}
                    name={setting.icon}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.settingContent}>
                  <ThemedText type="defaultSemiBold">
                    {setting.title}
                  </ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    {setting.description}
                  </ThemedText>
                </View>
                <IconSymbol
                  size={20}
                  name="chevron-right"
                  color={Colors.primary}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <IconSymbol size={24} name="logout" color={Colors.error} />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: Spacing.md,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  authContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },
  authIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  authSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  authButtons: {
    width: "100%",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  guestContainer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  guestText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    fontStyle: "italic",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    marginTop: Spacing.xl,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitials: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
  },
  settingsList: {
    gap: Spacing.md,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
    gap: 4,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
