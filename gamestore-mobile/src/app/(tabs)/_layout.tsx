import { Redirect, Tabs } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { useAuth } from "../../context/AuthContext";

function makeIcon(label: string) {
  const Icon = ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.7 }}>{label}</Text>
  );
  Icon.displayName = `TabIcon(${label})`;
  return Icon;
}

function LogoutHeaderButton() {
  const { logout } = useAuth();
  return (
    <Pressable onPress={logout} style={styles.logoutButton}>
      <Text style={styles.logoutText}>Logout</Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0a7ea4",
        tabBarInactiveTintColor: "#6b7280",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerRight: () => <LogoutHeaderButton />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: makeIcon("🏠") }}
      />
      <Tabs.Screen
        name="games"
        options={{ title: "Games", tabBarIcon: makeIcon("🎮") }}
      />
      <Tabs.Screen
        name="cart"
        options={{ title: "Cart", tabBarIcon: makeIcon("🛒") }}
      />
      <Tabs.Screen
        name="library"
        options={{ title: "Library", tabBarIcon: makeIcon("📚") }}
      />
      <Tabs.Screen
        name="wallet"
        options={{ title: "Wallet", tabBarIcon: makeIcon("💰") }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#c0392b",
    borderRadius: 6,
  },
  logoutText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
