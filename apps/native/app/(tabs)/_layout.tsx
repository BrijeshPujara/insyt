import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0e1011",
          borderTopColor: "rgba(255,255,255,0.06)",
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
        },
        tabBarActiveTintColor: "#46e4ee",
        tabBarInactiveTintColor: "#6b7280",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: "Home", tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="budgets"
        options={{ title: "Budgets", tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="add"
        options={{ title: "Add", tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="debt"
        options={{ title: "Debt", tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="advisory"
        options={{ title: "Advisory", tabBarIcon: () => null }}
      />
    </Tabs>
  );
}
