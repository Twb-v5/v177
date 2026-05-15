import { useState } from "react";
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Eye, EyeOff, UserPlus, ChevronLeft } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/providers/AuthProvider";

export default function RegisterScreen() {
  const c = useColors();
  const router = useRouter();
  const { signUp } = useAuth();
  const isDark = c.isDark;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    try {
      await signUp(username.trim(), email.trim(), password, gender);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ في إنشاء الحساب");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    height: 52, borderRadius: 16, paddingHorizontal: 16,
    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    borderWidth: 1.5, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
    color: c.text, fontSize: 15, fontFamily: "IBMPlexSansArabic_400Regular",
    textAlign: "left" as const,
  };

  const labelStyle = {
    fontSize: 12, fontWeight: "700" as const, color: c.textSecondary,
    fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "right" as const, marginBottom: 8,
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Back */}
            <Animated.View entering={FadeInDown.delay(0).springify()} style={{ paddingTop: 16 }}>
              <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <ChevronLeft size={20} color={c.textSecondary} />
                <Text style={{ fontSize: 14, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular" }}>رجوع</Text>
              </Pressable>
            </Animated.View>

            {/* Header */}
            <Animated.View entering={FadeInDown.delay(40).springify()} style={{ alignItems: "center", paddingTop: 24, paddingBottom: 28 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 24,
                backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(45,106,79,0.1)",
                alignItems: "center", justifyContent: "center", marginBottom: 16,
                borderWidth: 2, borderColor: isDark ? "rgba(16,185,129,0.25)" : "rgba(45,106,79,0.2)",
              }}>
                <Text style={{ fontSize: 32 }}>✨</Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginBottom: 6 }}>
                انضم إلى رحلتك
              </Text>
              <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center" }}>
                أنشئ حسابك وابدأ رحلة التوبة معنا
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInDown.delay(80).springify()} style={{ gap: 14 }}>

              {/* Gender */}
              <View>
                <Text style={labelStyle}>الجنس</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {(["male", "female"] as const).map(g => (
                    <Pressable
                      key={g}
                      onPress={() => { setGender(g); Haptics.selectionAsync(); }}
                      style={{
                        flex: 1, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center",
                        backgroundColor: gender === g
                          ? (isDark ? "rgba(16,185,129,0.2)" : "rgba(45,106,79,0.1)")
                          : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                        borderWidth: 1.5,
                        borderColor: gender === g ? c.primary : c.divider,
                      }}
                    >
                      <Text style={{ fontSize: 20, marginBottom: 2 }}>{g === "male" ? "👨" : "👩"}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Username */}
              <View>
                <Text style={labelStyle}>اسم المستخدم</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="your_username"
                  placeholderTextColor={c.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={inputStyle}
                />
                <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "right", marginTop: 4 }}>
                  أحرف إنجليزية صغيرة وأرقام وشرطة سفلية فقط
                </Text>
              </View>

              {/* Email */}
              <View>
                <Text style={labelStyle}>البريد الإلكتروني</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={c.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={inputStyle}
                />
              </View>

              {/* Password */}
              <View>
                <Text style={labelStyle}>كلمة المرور</Text>
                <View style={{ position: "relative" }}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="٦ أحرف على الأقل"
                    placeholderTextColor={c.textMuted}
                    secureTextEntry={!showPass}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                    style={{ ...inputStyle, paddingRight: 48 }}
                  />
                  <Pressable onPress={() => setShowPass(p => !p)} style={{ position: "absolute", right: 14, top: 14 }}>
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

              {/* Register Button */}
              <Pressable
                onPress={handleRegister}
                disabled={loading}
                style={{
                  height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center",
                  backgroundColor: c.primary, flexDirection: "row", gap: 10, marginTop: 4,
                  shadowColor: c.primary, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                }}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : (
                    <>
                      <UserPlus size={20} color="#fff" />
                      <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                        إنشاء الحساب
                      </Text>
                    </>
                  )
                }
              </Pressable>

              <Pressable onPress={() => router.back()} style={{ alignItems: "center", paddingVertical: 12 }}>
                <Text style={{ fontSize: 13, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                  لدي حساب بالفعل — تسجيل الدخول
                </Text>
              </Pressable>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
