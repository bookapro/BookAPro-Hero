import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Config } from "@/constants/Config";
import { Colors, Layout, Spacing, Typography } from "@/constants/Styles";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const moreOptions = [
  {
    id: "1",
    title: "FAQ",
    icon: "help" as const,
    description: "Frequently asked questions",
  },
  {
    id: "2",
    title: "About Us",
    icon: "info" as const,
    description: `Learn more about ${Config.APP_NAME}`,
  },
  {
    id: "3",
    title: "Privacy Policy",
    icon: "security" as const,
    description: "Our privacy policy and data handling",
  },
  {
    id: "4",
    title: "Terms of Service",
    icon: "description" as const,
    description: "Terms and conditions",
  },
  {
    id: "5",
    title: "Contact Us",
    icon: "support" as const,
    description: "Get in touch with our support team",
  },
  {
    id: "6",
    title: "Settings",
    icon: "settings" as const,
    description: "App settings and preferences",
  },
];

export default function MoreScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={Layout.container}>
        <ThemedText type="title">More</ThemedText>

        <View style={styles.optionsList}>
          {moreOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={() => {
                // Handle option press
                console.log(`Option pressed: ${option.title}`);
              }}
            >
              <View style={styles.optionIcon}>
                <IconSymbol
                  size={24}
                  name={option.icon}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.optionContent}>
                <ThemedText type="defaultSemiBold">{option.title}</ThemedText>
                <ThemedText style={Typography.caption}>
                  {option.description}
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
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
    gap: Spacing.xs,
  },
});
