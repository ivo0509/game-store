import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Game Store</Text>
      <Text style={styles.subtitle}>
        Discover, buy and sell games in one place.
      </Text>
      {user && <Text style={styles.greeting}>Hello, {user.name}!</Text>}
      <Text style={styles.hint}>
        Use the menu below to browse games, manage your cart, library, and wallet.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 14,
  },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#555", textAlign: "center" },
  greeting: { fontSize: 16, color: "#333", fontWeight: "500", marginTop: 8 },
  hint: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 12,
  },
});
