import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import React from "react";
import { StyleSheet } from "react-native";

export default function NotificationsScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedText type="title">Notifications</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({});
