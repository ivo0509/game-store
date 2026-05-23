import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Game Store</Text>
      <Text style={styles.subtitle}>
        Discover, buy and sell games in one place.
      </Text>

      {user ? (
        <>
          <Text style={styles.greeting}>Hello, {user.name}!</Text>
          <Link href="/games" style={styles.link}>
            Browse Games
          </Link>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Link href="/login" style={styles.link}>
          Sign in to your account
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  greeting: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  link: {
    fontSize: 16,
    color: "#0a7ea4",
    textDecorationLine: "underline",
  },
  logoutButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#c0392b",
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
