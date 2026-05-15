import { useState } from "react";
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginScreen() {
  const c = useColors();
  const router = useRouter();
  const { signIn } = useAuth();
  const isDark = c.isDark;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    try {
      await signIn(username.trim(), password);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ في تسجيل الدخول");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Header */}
            <Animated.View entering={FadeInDown.delay(0).springify()} style={{ alignItems: "center", paddingTop: 48, paddingBottom: 32 }}>
              <View style={{
                width: 80, height: 80, borderRadius: 28,
                backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(45,106,79,0.1)",
                alignItems: "center", justifyContent: "center", marginBottom: 20,
                borderWidth: 2, borderColor: isDark ? "rgba(16,185,129,0.25)" : "rgba(45,106,79,0.2)",
              }}>
                <Text style={{ fontSize: 36 }}>🌿</Text>
              </View>
              <Text style={{ fontSize: 26, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginBottom: 6 }}>
                مرحباً بعودتك
              </Text>
              <Text style={{ fontSize: 14, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center" }}>
                سجّل دخولك لمزامنة بياناتك في كل مكان
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInDown.delay(80).springify()} style={{ gap: 16 }}>

              {/* Username */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: "700", color: c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "right", marginBottom: 8 }}>
                  اسم المستخدم
                </Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="your_username"
                  placeholderTextColor={c.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    height: 52, borderRadius: 16, paddingHorizontal: 16,
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    borderWidth: 1.5, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                    color: c.text, fontSize: 15, fontFamily: "IBMPlexSansArabic_400Regular",
                    textAlign: "left",
                  }}
                />
              </View>

              {/* Password */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: "700", color: c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "right", marginBottom: 8 }}>
                  كلمة المرور
                </Text>
                <View style={{ position: "relative" }}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={c.textMuted}
                    secureTextEntry={!showPass}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    style={{
                      height: 52, borderRadius: 16, paddingHorizontal: 48,
                      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                      borderWidth: 1.5, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                      color: c.text, fontSize: 15, fontFamily: "IBMPlexSansArabic_400Regular",
                      textAlign: "left",
                    }}
                  />
                  <Pressable
                    onPress={() => setShowPass(p => !p)}
                    style={{ position: "absolute", right: 14, top: 14 }}
                  >
                    {showPass ? <EyeOff size={22} color={c.textMuted} /> : <Eye size={22} color={c.textMuted} />}
                  </Pressable>
                </View>
              </View>

              {/* Error */}
              {error && (
                <Animated.View entering={FadeIn.duration(200)} style={{
                  padding: 12, borderRadius: 12,
                  backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)",
                }}>
                  <Text style={{ fontSize: 13, color: "#ef4444", fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "right" }}>
                    {error}
                  </Text>
                </Animated.View>
              )}

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={{
                  height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center",
                  backgroundColor: c.primary, flexDirection: "row", gap: 10,
                  marginTop: 4,
                  shadowColor: c.primary, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                }}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : (
                    <>
                      <LogIn size={20} color="#fff" />
                      <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                        تسجيل الدخول
                      </Text>
                    </>
                  )
                }
              </Pressable>

              {/* Divider */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
                <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>أو</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
              </View>

              {/* Register */}
              <Pressable
                onPress={() => router.push("/register" as any)}
                style={{
                  height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center",
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  borderWidth: 1.5, borderColor: c.divider, flexDirection: "row", gap: 10,
                }}
              >
                <UserPlus size={18} color={c.textSecondary} />
                <Text style={{ fontSize: 15, fontWeight: "700", color: c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  إنشاء حساب جديد
                </Text>
              </Pressable>

              {/* Skip */}
              <Pressable onPress={() => router.replace("/")} style={{ alignItems: "center", paddingVertical: 12 }}>
                <Text style={{ fontSize: 13, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                  تخطي — المتابعة بدون حساب
                </Text>
              </Pressable>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
