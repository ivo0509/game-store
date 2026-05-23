import { useRouter, useSegments, Stack } from "expo-router";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "../context/AuthContext";

function RootNavigation() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inProtectedRoute = segments[0] === "games";

    if (!user && inProtectedRoute) {
      router.replace("/login");
    } else if (user && segments[0] === "login") {
      router.replace("/");
    }
  }, [user, segments]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="games/index" options={{ title: "Games" }} />
      <Stack.Screen name="games/[id]" options={{ title: "Game Details" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
