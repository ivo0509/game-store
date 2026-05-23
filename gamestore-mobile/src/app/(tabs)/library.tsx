import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type LibraryGame = {
  id: number;
  title: string;
  genre: string;
  platforms: string[];
  ageRating: string | null;
  price: string;
  discountPercent: number;
};

export default function LibraryScreen() {
  const { token } = useAuth();
  const router = useRouter();

  const [games, setGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLibrary = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/library`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load library.");
      setGames(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load library.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchLibrary();
    }, [fetchLibrary])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (games.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No games yet</Text>
        <Text style={styles.emptySubtitle}>
          Purchase games to build your library
        </Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/games")}
        >
          <Text style={styles.primaryButtonText}>Browse Games</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={games}
      keyExtractor={(g) => String(g.id)}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <Text style={styles.header}>
          {games.length} game{games.length !== 1 ? "s" : ""} in your library
        </Text>
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push(`/games/${item.id}`)}
        >
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.tagsRow}>
              <Text style={styles.tag}>{item.genre}</Text>
              {item.ageRating ? (
                <Text style={[styles.tag, styles.tagOutline]}>
                  {item.ageRating}
                </Text>
              ) : null}
              <Text style={[styles.tag, styles.tagOwned]}>Owned</Text>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  list: { padding: 16 },
  header: { fontSize: 14, color: "#6b7280", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    marginBottom: 10,
  },
  cardPressed: { opacity: 0.85 },
  cardBody: { gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#111" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  tag: {
    fontSize: 11,
    backgroundColor: "#f1f5f9",
    color: "#475569",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#94a3b8",
    color: "#64748b",
  },
  tagOwned: { backgroundColor: "#dcfce7", color: "#16a34a" },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#374151" },
  emptySubtitle: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  primaryButton: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  errorText: { color: "#c0392b", fontSize: 15, textAlign: "center" },
});
