import { Tabs } from "expo-router";
import React from "react";

import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors, FontFamily } from "@/constants/Styles";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof IconSymbol>["name"];
  color: string;
}) {
  const isActive = props.color === Colors.primary;
  if (!isActive) {
    return (
      <IconSymbol
        size={24}
        style={{
          opacity: 0.5,
        }}
        {...props}
      />
    );
  }
  return <IconSymbol size={28} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: {
          fontFamily: FontFamily.MontserratBold,
        },
        tabBarStyle: {
          minHeight: 125,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          gap: 4,
          paddingTop: 14,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="notifications" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="more-horiz" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
