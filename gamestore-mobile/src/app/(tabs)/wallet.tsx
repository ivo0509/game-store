import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function WalletScreen() {
  const { token, user } = useAuth();

  const [balance, setBalance] = useState<string>("0.00");
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load wallet.");
      setBalance(data.balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, [fetchBalance])
  );

  async function addFunds(value: number) {
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert("Invalid amount", "Enter a positive number.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add funds.");
      setBalance(data.balance);
      setAmount("");
      Alert.alert("Success", data.message);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const isPublisher = user?.role === "publisher";

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>
          {isPublisher ? "Total Earnings" : "Current Balance"}
        </Text>
        <Text style={styles.balanceAmount}>
          ${parseFloat(balance).toFixed(2)}
        </Text>
      </View>

      {!isPublisher && (
        <View style={styles.addCard}>
          <Text style={styles.addCardTitle}>Add Demo Money</Text>

          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((v) => (
              <Pressable
                key={v}
                style={[styles.quickButton, submitting && styles.buttonDisabled]}
                onPress={() => addFunds(v)}
                disabled={submitting}
              >
                <Text style={styles.quickButtonText}>+${v}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Custom amount</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            editable={!submitting}
          />

          <Pressable
            style={[styles.primaryButton, submitting && styles.buttonDisabled]}
            onPress={() => addFunds(parseFloat(amount))}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Add Funds</Text>
            )}
          </Pressable>
        </View>
      )}
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
  container: { padding: 20, gap: 20 },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  balanceLabel: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  balanceAmount: { fontSize: 42, fontWeight: "700", color: "#16a34a" },
  addCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 20,
    gap: 14,
  },
  addCardTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickButton: {
    flex: 1,
    minWidth: 70,
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  quickButtonText: { fontSize: 14, fontWeight: "600", color: "#0a7ea4" },
  label: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  buttonDisabled: { opacity: 0.6 },
  errorText: { color: "#c0392b", fontSize: 14, textAlign: "center" },
});
