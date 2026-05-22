import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to GameStore</Text>
      <Text style={styles.subtitle}>Discover, buy and play your favorite games</Text>
      <Link href="/login" style={styles.link}>Login</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
  link: { fontSize: 16, color: '#007AFF', marginTop: 12, fontWeight: '600' },
});
