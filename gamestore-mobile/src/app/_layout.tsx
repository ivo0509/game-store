import { useRouter, useSegments, Stack } from "expo-router";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { WalletProvider } from "../context/WalletContext";

function RootNavigation() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(tabs)";
    const inGameDetails = segments[0] === "games";

    if (!user && (inAuthGroup || inGameDetails)) {
      router.replace("/login");
    } else if (user && segments[0] === "login") {
      router.replace("/");
    }
  }, [user, segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
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
