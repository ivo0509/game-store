import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="games/index" options={{ title: "Games" }} />
      <Stack.Screen name="games/[id]" options={{ title: "Game Details" }} />
    </Stack>
  );
}
