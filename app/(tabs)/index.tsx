import { ThemedView } from "@/components/common/ThemedView";
import { StickyNavbar } from "@/components/layout/StickyNavbar";
import React from "react";

export default function HomeScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <StickyNavbar />
    </ThemedView>
  );
}
