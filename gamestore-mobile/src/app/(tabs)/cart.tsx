import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type CartItem = {
  gameId: number;
  title: string;
  price: string;
  discountPercent: number;
  finalPrice: string;
};

export default function CartScreen() {
  const { token } = useAuth();
  const { refresh: refreshWallet } = useWallet();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load cart.");
      setItems(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  async function removeItem(gameId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${gameId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove item.");
      setItems((prev) => prev.filter((i) => i.gameId !== gameId));
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed.");
    }
  }

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cart/checkout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed.");
      setItems([]);
      // Push new wallet balance app-wide without waiting for tab focus
      refreshWallet();
      router.replace("/library");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setCheckingOut(false);
    }
  }

  const total = items.reduce((sum, i) => sum + parseFloat(i.finalPrice), 0);

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

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
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
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.gameId)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const basePrice = parseFloat(item.price);
          const finalPrice = parseFloat(item.finalPrice);
          const hasDiscount = item.discountPercent > 0;
          return (
            <Pressable
              style={styles.itemCard}
              onPress={() => router.push(`/games/${item.gameId}`)}
            >
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.itemPrice}>${finalPrice.toFixed(2)}</Text>
                  {hasDiscount && (
                    <>
                      <Text style={styles.itemPriceOriginal}>
                        ${basePrice.toFixed(2)}
                      </Text>
                      <Text style={styles.discountBadge}>
                        -{item.discountPercent}%
                      </Text>
                    </>
                  )}
                </View>
              </View>
              <Pressable
                style={styles.removeButton}
                onPress={() => removeItem(item.gameId)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </Pressable>
          );
        }}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
        </View>
        <Pressable
          style={[styles.checkoutButton, checkingOut && styles.buttonDisabled]}
          onPress={handleCheckout}
          disabled={checkingOut}
        >
          {checkingOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  list: { padding: 16, gap: 12 },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemBody: { flex: 1, gap: 6 },
  itemTitle: { fontSize: 15, fontWeight: "600", color: "#111" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  itemPrice: { fontSize: 15, fontWeight: "700", color: "#0a7ea4" },
  itemPriceOriginal: {
    fontSize: 12,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16a34a",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#c0392b",
    borderRadius: 6,
  },
  removeText: { color: "#c0392b", fontSize: 12, fontWeight: "600" },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
    gap: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 16, fontWeight: "600", color: "#111" },
  totalAmount: { fontSize: 22, fontWeight: "700", color: "#0a7ea4" },
  checkoutButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  buttonDisabled: { opacity: 0.6 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#374151" },
  primaryButton: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  errorText: { color: "#c0392b", fontSize: 15, textAlign: "center" },
});
