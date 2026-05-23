import { StyleSheet, Text, View } from "react-native";

export default function GamesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Games</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
});
