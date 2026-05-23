import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Game Store</Text>
      <Text style={styles.subtitle}>
        Discover, buy and sell games in one place.
      </Text>
      <Link href="/login" style={styles.link}>
        Sign in to your account
      </Link>
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
  link: {
    marginTop: 8,
    fontSize: 16,
    color: "#0a7ea4",
    textDecorationLine: "underline",
  },
});
