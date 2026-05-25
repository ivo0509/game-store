import { useRouter, useSegments, Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { WalletProvider } from "../context/WalletContext";

function RootNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(tabs)";
    const inGameDetails = segments[0] === "games";

    if (!user && (inAuthGroup || inGameDetails)) {
      router.replace("/login");
    } else if (user && (segments[0] === "login" || segments[0] === "register")) {
      router.replace("/");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
      <Stack.Screen name="games/[id]" options={{ title: "Game Details" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <WalletProvider>
        <RootNavigation />
      </WalletProvider>
    </AuthProvider>
  );
}
