import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type GameDetail = {
  id: number;
  title: string;
  description: string;
  genre: string;
  platforms: string[];
  releaseDate: string | null;
  price: string;
  discountPercent: number;
  coverImageUrl: string | null;
  ageRating: string | null;
  isPurchased: boolean;
  purchasedCount: number;
};

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();

  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;

    async function fetchGame() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/games/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setGame(await res.json());
      } catch {
        setError("Failed to load game details.");
      } finally {
        setLoading(false);
      }
    }

    fetchGame();
  }, [id, token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (error || !game) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Game not found."}</Text>
      </View>
    );
  }

  const basePrice = parseFloat(game.price);
  const discountedPrice =
    game.discountPercent > 0
      ? (basePrice * (1 - game.discountPercent / 100)).toFixed(2)
      : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{game.title}</Text>

        <View style={styles.tagsRow}>
          <Text style={styles.tag}>{game.genre}</Text>
          {game.ageRating ? (
            <Text style={[styles.tag, styles.tagOutline]}>{game.ageRating}</Text>
          ) : null}
          {game.isPurchased && (
            <Text style={[styles.tag, styles.tagOwned]}>Owned</Text>
          )}
        </View>

        {game.platforms.length > 0 && (
          <View style={styles.tagsRow}>
            {game.platforms.map((p) => (
              <Text key={p} style={styles.tag}>{p}</Text>
            ))}
          </View>
        )}

        <View style={styles.priceRow}>
          {discountedPrice ? (
            <>
              <Text style={styles.priceDiscounted}>${discountedPrice}</Text>
              <Text style={styles.priceOriginal}>${basePrice.toFixed(2)}</Text>
              <Text style={styles.discountBadge}>-{game.discountPercent}%</Text>
            </>
          ) : (
            <Text style={styles.price}>${basePrice.toFixed(2)}</Text>
          )}
        </View>

        {game.releaseDate && (
          <Text style={styles.meta}>
            Released: {new Date(game.releaseDate).toLocaleDateString()}
          </Text>
        )}

        <Text style={styles.meta}>{game.purchasedCount} purchases</Text>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{game.description}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  container: {
    paddingBottom: 32,
  },
  content: {
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    fontSize: 12,
    backgroundColor: "#f1f5f9",
    color: "#475569",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#94a3b8",
    color: "#64748b",
  },
  tagOwned: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0a7ea4",
  },
  priceDiscounted: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0a7ea4",
  },
  priceOriginal: {
    fontSize: 15,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16a34a",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  meta: {
    fontSize: 13,
    color: "#6b7280",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginTop: 6,
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },
  errorText: {
    fontSize: 15,
    color: "#c0392b",
    textAlign: "center",
  },
});
