import { StyleSheet } from "react-native";

export const Colors = {
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
  success: "#1abc9c",
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
});
