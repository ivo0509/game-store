import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const PAGE_SIZE = 12;

type Game = {
  id: number;
  title: string;
  description: string;
  genre: string;
  platforms: string[];
  price: string;
  discountPercent: number;
  coverImageUrl: string | null;
  ageRating: string | null;
};

function GameCard({ game, onPress }: { game: Game; onPress: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const basePrice = parseFloat(game.price);
  const discountedPrice =
    game.discountPercent > 0
      ? (basePrice * (1 - game.discountPercent / 100)).toFixed(2)
      : null;

  const showImage = !!game.coverImageUrl && !imageFailed;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {showImage ? (
        <Image
          source={{ uri: game.coverImageUrl as string }}
          style={styles.cardImage}
          resizeMode="cover"
          onError={(e) => {
            console.warn(
              "[GameCard] Image failed:",
              game.coverImageUrl,
              e.nativeEvent
            );
            setImageFailed(true);
          }}
        />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Text style={styles.cardImagePlaceholderText}>
            {game.coverImageUrl ? "Image failed" : "No image"}
          </Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {game.title}
        </Text>

        <View style={styles.tagsRow}>
          <Text style={styles.tag}>{game.genre}</Text>
          {game.ageRating ? (
            <Text style={[styles.tag, styles.tagOutline]}>{game.ageRating}</Text>
          ) : null}
        </View>

        <View style={styles.priceRow}>
          {discountedPrice ? (
            <>
              <Text style={styles.priceDiscounted}>${discountedPrice}</Text>
              <Text style={styles.priceOriginal}>
                ${basePrice.toFixed(2)}
              </Text>
              <Text style={styles.discountBadge}>
                -{game.discountPercent}%
              </Text>
            </>
          ) : (
            <Text style={styles.price}>${basePrice.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function GamesScreen() {
  const { token } = useAuth();
  const router = useRouter();

  const [games, setGames] = useState<Game[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(
    async (pageNum: number, append: boolean) => {
      if (!token) return;
      if (!append && pageNum === 1) {
        // first page loads: keep `loading` only if we have no data yet
        if (games.length === 0) setLoading(true);
      } else if (append) {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const res = await fetch(
          `${API_BASE_URL}/games?page=${pageNum}&limit=${PAGE_SIZE}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setGames((prev) => (append ? [...prev, ...json.data] : json.data));
        setTotalPages(json.pagination.totalPages);
        setPage(json.pagination.page);
      } catch {
        setError("Failed to load games. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [token, games.length]
  );

  // Refetch every time the screen gains focus so newly added/deleted games show up.
  useFocusEffect(
    useCallback(() => {
      fetchGames(1, false);
    }, [fetchGames])
  );

  function onRefresh() {
    setRefreshing(true);
    fetchGames(1, false);
  }

  function loadMore() {
    if (!loadingMore && page < totalPages) {
      fetchGames(page + 1, true);
    }
  }

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
        <Pressable style={styles.retryButton} onPress={() => fetchGames(1, false)}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const listData: (Game | null)[] =
    games.length % 2 !== 0 ? [...games, null] : games;

  return (
    <FlatList
      data={listData}
      keyExtractor={(item, index) => (item ? String(item.id) : `spacer-${index}`)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderItem={({ item }) =>
        item ? (
          <GameCard
            game={item}
            onPress={() => router.push(`/games/${item.id}`)}
          />
        ) : (
          <View style={styles.cardSpacer} />
        )
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            size="small"
            color="#0a7ea4"
            style={styles.footer}
          />
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No games available.</Text>
        </View>
      }
    />
  );
}

const CARD_GAP = 12;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  list: {
    padding: CARD_GAP,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#f1f5f9",
  },
  cardImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardImagePlaceholderText: {
    fontSize: 10,
    color: "#94a3b8",
  },
  cardBody: {
    padding: 8,
    gap: 4,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  tag: {
    fontSize: 9,
    backgroundColor: "#f1f5f9",
    color: "#475569",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  tagOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#94a3b8",
    color: "#64748b",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0a7ea4",
  },
  priceDiscounted: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0a7ea4",
  },
  priceOriginal: {
    fontSize: 10,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    fontSize: 9,
    fontWeight: "700",
    color: "#16a34a",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  footer: {
    paddingVertical: 16,
  },
  errorText: {
    fontSize: 15,
    color: "#c0392b",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
  },
  cardSpacer: {
    flex: 1,
  },
});
