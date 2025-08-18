import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const cardMargin = 12;
const numColumns = 2;
const cardWidth = (screenWidth - cardMargin * (numColumns + 1)) / numColumns;
const cardHeight = cardWidth * 1;

export const Colors = {
  // primary: "#2563EB",
  primary: "#6a2e95",
  secondary: "#3B82F6",
  accent: "#60A5FA",
  background: "#FFFFFF",
  text: "#1F2937",
  tint: "#2563EB",
  headerBg: "#A1CEDC",
  error: "#EF4444",
  whiteColor: "#FFFFFF",
  greyColor: "grey",
  blackTintLight: "rgba(0, 0, 0, 0.02)",
  black: "#000000",
  success: "#10B981",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Typography = {
  title: {
    fontSize: 24,
    fontFamily: "OrbitronBold",
  },

  body: {
    fontSize: 14,
    fontFamily: "Montserrat",
  },

  caption: {
    fontSize: 12,
    opacity: 0.8,
    fontFamily: "Montserrat",
  },
};

export const FontFamily = {
  OrbitronBold: "OrbitronBold",
  Orbitron: "Orbitron",
  OrbitronMedium: "OrbitronMedium",
  Montserrat: "Montserrat",
  MontserratMedium: "MontserratMedium",
  MontserratBold: "MontserratBold",
};

export const Layout = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.md,
  },
  section: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  serviceCard: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 12,
    marginBottom: Spacing.md,
    backgroundColor: Colors.whiteColor,
  },
});
