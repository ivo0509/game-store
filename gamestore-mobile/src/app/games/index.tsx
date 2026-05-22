import { StyleSheet, Text, View } from 'react-native';

export default function GamesScreen() {
  return (
    <View style={styles.container}>
      <Text>Games</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
