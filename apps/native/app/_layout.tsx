import "../global.css";
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FinanceProvider } from "@/providers/FinanceProvider";
import { useFinances } from "@insyt/store";

function AuthGuard() {
  const { user, isLoading } = useFinances();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === "(auth)";

    if (!user && !inAuth) {
      router.replace("/(auth)/sign-in");
    } else if (user && inAuth) {
      router.replace("/(tabs)/dashboard");
    }
  }, [user, isLoading, segments, router]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <FinanceProvider>
          <AuthGuard />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
          </Stack>
        </FinanceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
