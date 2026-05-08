import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({ scheme: "com.insyt.finance", path: "auth/callback" });

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });

      if (oauthError || !data?.url) {
        setError("Could not start sign-in. Please try again.");
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (result.type === "success" && result.url) {
        await handleCallback(result.url);
      }
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCallback(url: string) {
    // Supabase returns tokens in the URL fragment
    const fragment = url.split("#")[1] ?? "";
    const query = url.split("?")[1] ?? "";
    const params = new URLSearchParams(fragment || query);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) setError("Session error. Please try again.");
    } else {
      setError("Authentication failed. Please try again.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand */}
        <Text style={styles.wordmark}>INSYT.</Text>
        <Text style={styles.tagline}>Your financial picture, simplified.</Text>

        {/* Sign-in card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in to continue</Text>
          <Text style={styles.cardSub}>
            Your data syncs across all your devices.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [styles.googleBtn, pressed && styles.googleBtnPressed]}
            onPress={signInWithGoogle}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0e1011" />
            ) : (
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e1011" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  wordmark: { fontSize: 40, fontWeight: "800", color: "#46e4ee", letterSpacing: -1, marginBottom: 8 },
  tagline: { fontSize: 14, color: "#6b7280", marginBottom: 48, textAlign: "center" },
  card: {
    width: "100%",
    backgroundColor: "#161a1d",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 24,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#f9fafb", marginBottom: 8 },
  cardSub: { fontSize: 13, color: "#6b7280", marginBottom: 24 },
  error: { fontSize: 13, color: "#ef4444", marginBottom: 16 },
  googleBtn: {
    backgroundColor: "#46e4ee",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  googleBtnPressed: { opacity: 0.85 },
  googleBtnText: { fontSize: 15, fontWeight: "700", color: "#0e1011" },
  disclaimer: { fontSize: 11, color: "#4b5563", textAlign: "center" },
});
