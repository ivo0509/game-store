import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "OK", style: "destructive", onPress: onConfirm },
  ]);
}

function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

type Review = {
  id: number;
  userId: number;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
};

type UserReview = {
  id: number;
  rating: number;
  comment: string;
};

type GameDetail = {
  id: number;
  title: string;
  description: string;
  genre: string;
  platforms: string[];
  releaseDate: string | null;
  trailerUrl: string | null;
  coverImageUrl: string | null;
  price: string;
  discountPercent: number;
  ageRating: string | null;
  isPurchased: boolean;
  isInCart: boolean;
  purchasedCount: number;
  reviews: Review[];
  canReview: boolean;
  canReviewReason: "not_logged_in" | "own_game" | "not_purchased" | null;
  userReview: UserReview | null;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <Text style={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (i < rating ? "★" : "☆")).join("")}
    </Text>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewAuthor}>{review.authorName}</Text>
        <StarRating rating={review.rating} />
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
      <Text style={styles.reviewDate}>
        {new Date(review.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );
}

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const { refresh: refreshWallet } = useWallet();

  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [editingReview, setEditingReview] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;
    fetchGame();
  }, [id, token]);

  async function fetchGame() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/games/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: GameDetail = await res.json();
      setGame(data);
      if (data.userReview) {
        setReviewRating(data.userReview.rating);
        setReviewComment(data.userReview.comment);
      } else {
        setReviewRating(5);
        setReviewComment("");
      }
      setEditingReview(false);
      setReviewError(null);
    } catch {
      setError("Failed to load game details.");
    } finally {
      setLoading(false);
    }
  }

  async function submitReview() {
    if (!game || !token) return;
    setReviewError(null);
    if (!reviewComment.trim()) {
      setReviewError("Comment must not be empty.");
      return;
    }
    setReviewSubmitting(true);
    try {
      const isUpdate = !!game.userReview;
      const url = isUpdate
        ? `${API_BASE_URL}/reviews/${game.userReview!.id}`
        : `${API_BASE_URL}/games/${game.id}/reviews`;
      const res = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to submit review.");
      await fetchGame();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function deleteReview() {
    if (!game?.userReview || !token) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/reviews/${game.userReview.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete review.");
      }
      await fetchGame();
    } catch (err) {
      notify("Error", err instanceof Error ? err.message : "Failed.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handleAddToCart() {
    if (!game || !token) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameId: game.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add to cart.");
      setGame((prev) => (prev ? { ...prev, isInCart: true } : prev));
    } catch (err) {
      notify("Error", err instanceof Error ? err.message : "Failed.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveFromCart() {
    if (!game || !token) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${game.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to remove from cart.");
      }
      setGame((prev) => (prev ? { ...prev, isInCart: false } : prev));
    } catch (err) {
      notify("Error", err instanceof Error ? err.message : "Failed.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRefund() {
    if (!game || !token) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/games/${game.id}/refund`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refund failed.");
      setGame((prev) =>
        prev
          ? { ...prev, isPurchased: false, isInCart: false, purchasedCount: Math.max(0, prev.purchasedCount - 1) }
          : prev
      );
      // Push new wallet balance app-wide without waiting for tab focus
      refreshWallet();
    } catch (err) {
      notify("Error", err instanceof Error ? err.message : "Refund failed.");
    } finally {
      setActionLoading(false);
    }
  }

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
        <Pressable style={styles.retryButton} onPress={fetchGame}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const basePrice = parseFloat(game.price);
  const discountedPrice =
    game.discountPercent > 0
      ? (basePrice * (1 - game.discountPercent / 100)).toFixed(2)
      : null;

  const canPurchase = user?.role === "user";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {game.coverImageUrl ? (
        <Image
          source={{ uri: game.coverImageUrl }}
          style={styles.cover}
          resizeMode="cover"
          onError={(e) =>
            console.warn(
              "[GameDetail] Image failed:",
              game.coverImageUrl,
              e.nativeEvent
            )
          }
        />
      ) : null}
      <View style={styles.content}>

        {/* Title + owned badge */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{game.title}</Text>
          {game.isPurchased && (
            <Text style={styles.ownedBadge}>Owned</Text>
          )}
        </View>

        {/* Genre / age rating tags */}
        <View style={styles.tagsRow}>
          <Text style={styles.tag}>{game.genre}</Text>
          {game.ageRating ? (
            <Text style={[styles.tag, styles.tagOutline]}>{game.ageRating}</Text>
          ) : null}
        </View>

        {/* Platforms */}
        {game.platforms.length > 0 && (
          <View style={styles.tagsRow}>
            {game.platforms.map((p) => (
              <Text key={p} style={styles.tag}>{p}</Text>
            ))}
          </View>
        )}

        {/* Price */}
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

        {/* Meta */}
        <View style={styles.metaRow}>
          {game.releaseDate && (
            <Text style={styles.meta}>
              Released: {new Date(game.releaseDate).toLocaleDateString()}
            </Text>
          )}
          <Text style={styles.meta}>{game.purchasedCount} purchases</Text>
        </View>

        {/* Action button */}
        {canPurchase && (
          game.isPurchased ? (
            <View style={styles.actionGroup}>
              <View style={[styles.actionButton, styles.inLibraryBadge]}>
                <Text style={styles.inLibraryText}>✓ In Library</Text>
              </View>
              <Pressable onPress={() => router.push("/library")}>
                <Text style={styles.linkText}>Go to Library</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.refundButton, actionLoading && styles.buttonDisabled]}
                onPress={handleRefund}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.actionButtonText}>Refund Game</Text>}
              </Pressable>
            </View>
          ) : game.isInCart ? (
            <View style={styles.actionGroup}>
              <Pressable
                style={[styles.actionButton, styles.inCartButton, actionLoading && styles.buttonDisabled]}
                onPress={() =>
                  confirmAction(
                    "Remove from cart?",
                    `Remove "${game.title}" from your cart?`,
                    handleRemoveFromCart
                  )
                }
                disabled={actionLoading}
              >
                {actionLoading
                  ? <ActivityIndicator color="#374151" />
                  : <Text style={styles.inCartButtonText}>✓ In Cart — Remove</Text>}
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.checkoutButton]}
                onPress={() => router.push("/cart")}
              >
                <Text style={styles.actionButtonText}>Go to Checkout</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[styles.actionButton, styles.buyButton, actionLoading && styles.buttonDisabled]}
              onPress={handleAddToCart}
              disabled={actionLoading}
            >
              {actionLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.actionButtonText}>Add to Cart</Text>}
            </Pressable>
          )
        )}

        {/* Description */}
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{game.description}</Text>

        {/* Trailer */}
        {game.trailerUrl && (
          <>
            <Text style={styles.sectionTitle}>Trailer</Text>
            <Pressable onPress={() => Linking.openURL(game.trailerUrl!)}>
              <Text style={styles.trailerLink} numberOfLines={1}>
                {game.trailerUrl}
              </Text>
            </Pressable>
          </>
        )}

        {/* Reviews */}
        <Text style={styles.sectionTitle}>
          Reviews ({game.reviews.length})
        </Text>

        {/* Your review form */}
        {user?.role === "user" && (game.canReview || game.userReview) && (
          <View style={styles.reviewFormCard}>
            <Text style={styles.reviewFormTitle}>
              {game.userReview
                ? editingReview
                  ? "Edit your review"
                  : "Your review"
                : "Write a review"}
            </Text>

            {game.userReview && !editingReview ? (
              <>
                <View style={styles.reviewHeader}>
                  <StarRating rating={game.userReview.rating} />
                </View>
                <Text style={styles.reviewComment}>{game.userReview.comment}</Text>
                <View style={styles.reviewActionsRow}>
                  <Pressable
                    style={[styles.smallButton, styles.editButton]}
                    onPress={() => setEditingReview(true)}
                  >
                    <Text style={styles.smallButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.smallButton, styles.deleteButton, reviewSubmitting && styles.buttonDisabled]}
                    onPress={() =>
                      confirmAction(
                        "Delete review?",
                        "Are you sure you want to delete your review?",
                        deleteReview
                      )
                    }
                    disabled={reviewSubmitting}
                  >
                    {reviewSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.smallButtonText}>Delete</Text>
                    )}
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.ratingPicker}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Pressable key={n} onPress={() => setReviewRating(n)}>
                      <Text style={styles.ratingPickerStar}>
                        {n <= reviewRating ? "★" : "☆"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Share your thoughts..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  editable={!reviewSubmitting}
                />
                {reviewError && <Text style={styles.errorText}>{reviewError}</Text>}
                <View style={styles.reviewActionsRow}>
                  {editingReview && (
                    <Pressable
                      style={[styles.smallButton, styles.cancelButton]}
                      onPress={() => {
                        setEditingReview(false);
                        setReviewError(null);
                        if (game.userReview) {
                          setReviewRating(game.userReview.rating);
                          setReviewComment(game.userReview.comment);
                        }
                      }}
                      disabled={reviewSubmitting}
                    >
                      <Text style={styles.smallButtonText}>Cancel</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={[styles.smallButton, styles.submitButton, reviewSubmitting && styles.buttonDisabled]}
                    onPress={submitReview}
                    disabled={reviewSubmitting}
                  >
                    {reviewSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.smallButtonText}>
                        {game.userReview ? "Save" : "Post"}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}

        {user?.role === "user" && !game.canReview && !game.userReview && game.canReviewReason && (
          <Text style={styles.emptyText}>
            {game.canReviewReason === "own_game"
              ? "Publishers cannot review their own games."
              : game.canReviewReason === "not_purchased"
              ? "Purchase this game to leave a review."
              : "Sign in to leave a review."}
          </Text>
        )}

        {game.reviews.length === 0 ? (
          <Text style={styles.emptyText}>No reviews yet.</Text>
        ) : (
          game.reviews
            .filter((r) => r.userId !== user?.id)
            .map((r) => <ReviewCard key={r.id} review={r} />)
        )}

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
    paddingBottom: 40,
  },
  cover: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#f1f5f9",
  },
  content: {
    padding: 20,
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    flexShrink: 1,
  },
  ownedBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
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
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0a7ea4",
  },
  priceDiscounted: {
    fontSize: 24,
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
  metaRow: {
    gap: 2,
  },
  meta: {
    fontSize: 13,
    color: "#6b7280",
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  buyButton: {
    backgroundColor: "#0a7ea4",
  },
  refundButton: {
    backgroundColor: "#c0392b",
  },
  inCartButton: {
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "#d1d5db",
  },
  inCartButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  checkoutButton: {
    backgroundColor: "#16a34a",
  },
  inLibraryBadge: {
    backgroundColor: "#dcfce7",
    borderWidth: 2,
    borderColor: "#86efac",
  },
  inLibraryText: {
    color: "#166534",
    fontSize: 16,
    fontWeight: "700",
  },
  actionGroup: {
    gap: 8,
    alignItems: "stretch",
  },
  linkText: {
    color: "#0a7ea4",
    fontSize: 13,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },
  trailerLink: {
    fontSize: 14,
    color: "#0a7ea4",
    textDecorationLine: "underline",
  },
  reviewCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    gap: 6,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
  },
  stars: {
    fontSize: 14,
    color: "#f59e0b",
    letterSpacing: 1,
  },
  reviewComment: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 11,
    color: "#9ca3af",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
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
  reviewFormCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 14,
    gap: 10,
  },
  reviewFormTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  ratingPicker: {
    flexDirection: "row",
    gap: 4,
  },
  ratingPickerStar: {
    fontSize: 28,
    color: "#f59e0b",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: "#111",
    minHeight: 80,
    textAlignVertical: "top",
  },
  reviewActionsRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  smallButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  smallButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#0a7ea4",
  },
  editButton: {
    backgroundColor: "#0a7ea4",
  },
  deleteButton: {
    backgroundColor: "#c0392b",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
  },
});

