import { useState, useRef } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput, Share, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { ImageIcon, Share2, RefreshCw, Check, Edit3, Eye, EyeOff } from "lucide-react-native";

const VERSES = [
  { arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", source: "الزمر: ٥٣" },
  { arabic: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", source: "البقرة: ٢٢٢" },
  { arabic: "وَهُوَ الَّذِي يَقْبَلُ التَّوْبَةَ عَنْ عِبَادِهِ وَيَعْفُو عَنِ السَّيِّئَاتِ", source: "الشورى: ٢٥" },
  { arabic: "إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ", source: "الزمر: ٥٣" },
  { arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", source: "الرعد: ٢٨" },
  { arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ", source: "الضحى: ٥" },
];

const THEMES = [
  { id: "sapphire", name: "الليلة الزرقاء", bg: "#0a1628", accent: "#c9a84c", text: "#f0ead6", border: "rgba(201,168,76,0.5)" },
  { id: "emerald", name: "الجنة الخضراء", bg: "#071f12", accent: "#d4af37", text: "#fefcf0", border: "rgba(212,175,55,0.5)" },
  { id: "night", name: "الليل الهادئ", bg: "#0d1b2a", accent: "#c9a84c", text: "#f0ead6", border: "rgba(201,168,76,0.4)" },
  { id: "sand", name: "الرمال الذهبية", bg: "#8b6914", accent: "#fff9e6", text: "#fff9e6", border: "rgba(255,249,230,0.4)" },
  { id: "pearl", name: "اللؤلؤ الأبيض", bg: "#f5f0e8", accent: "#1a5c3a", text: "#1a2e1a", border: "rgba(26,92,58,0.3)" },
  { id: "forest", name: "الغابة العميقة", bg: "#0f4c35", accent: "#d4af37", text: "#fefcf0", border: "rgba(212,175,55,0.4)" },
];

function getHijriDate(): string {
  try {
    return new Date().toLocaleDateString("ar-SA-u-ca-islamic", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("ar");
  }
}

function getDayNumber(): number {
  try {
    const stored = localStorage.getItem("tawbah_day_one_date");
    if (!stored) return 1;
    const diff = Math.floor((Date.now() - Number(stored)) / 86400000);
    return Math.max(1, diff + 1);
  } catch {
    return 1;
  }
}

function getName(): string {
  try { return localStorage.getItem("tawbah_card_name") || ""; } catch { return ""; }
}

function CardPreview({
  theme, verse, name, showName, dayNumber, hijriDate,
}: {
  theme: typeof THEMES[0];
  verse: typeof VERSES[0];
  name: string;
  showName: boolean;
  dayNumber: number;
  hijriDate: string;
}) {
  const isLight = theme.id === "pearl";

  return (
    <View style={{
      backgroundColor: theme.bg,
      borderRadius: 20,
      padding: 28,
      width: 300,
      minHeight: 400,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    }}>
      <View style={{
        paddingHorizontal: 16, paddingVertical: 4,
        borderRadius: 20, borderWidth: 1, borderColor: theme.border,
        backgroundColor: "rgba(255,255,255,0.1)", marginBottom: 20,
      }}>
        <Text style={{ fontSize: 10, fontWeight: "700", color: theme.accent, letterSpacing: 1 }}>
          دليل التوبة النصوح
        </Text>
      </View>

      <View style={{
        width: 80, height: 80, borderRadius: 40,
        borderWidth: 2, borderColor: theme.accent,
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center", justifyContent: "center", marginBottom: 14,
      }}>
        <Text style={{ fontSize: 28, fontWeight: "900", color: theme.accent, lineHeight: 34 }}>{dayNumber}</Text>
        <Text style={{ fontSize: 9, color: theme.text, opacity: 0.7 }}>يوم</Text>
      </View>

      {showName && name ? (
        <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 4, textAlign: "center" }}>
          {name}
        </Text>
      ) : null}

      <Text style={{ fontSize: 11, color: theme.accent, fontWeight: "600", marginBottom: 2 }}>
        في رحلة العودة إلى الله
      </Text>
      <Text style={{ fontSize: 10, color: theme.text, opacity: 0.6, marginBottom: 20 }}>{hijriDate}</Text>

      <View style={{
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.07)",
        borderRadius: 12, borderWidth: 1, borderColor: theme.border,
        padding: 16, alignItems: "center",
      }}>
        <Text style={{ fontSize: 10, color: theme.accent, fontWeight: "700", marginBottom: 10 }}>✦ آية رحلتي ✦</Text>
        <Text style={{ fontSize: 13, color: theme.text, textAlign: "center", lineHeight: 22 }} numberOfLines={4}>
          {verse.arabic}
        </Text>
        <Text style={{ fontSize: 10, color: theme.accent, marginTop: 8, fontWeight: "600" }}>{verse.source}</Text>
      </View>

      <Text style={{ fontSize: 9, color: theme.text, opacity: 0.5, marginTop: 16 }}>
        تبت إلى الله توبة نصوحاً
      </Text>
    </View>
  );
}

export default function TawbahCardScreen() {
  const { isDark } = useColors();
  const [themeIdx, setThemeIdx] = useState(0);
  const [verseIdx, setVerseIdx] = useState(0);
  const [name, setName] = useState(getName);
  const [showName, setShowName] = useState(true);
  const [shared, setShared] = useState(false);
  const [dayNumber] = useState(getDayNumber);
  const [hijriDate] = useState(getHijriDate);

  const theme = THEMES[themeIdx];
  const verse = VERSES[verseIdx];

  const bg = isDark ? "#0a0a0f" : "#f8fafc";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const subColor = isDark ? "#9ca3af" : "#6b7280";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const handleShare = async () => {
    try {
      await Share.share({
        message: `بطاقة توبتي — اليوم ${dayNumber} من رحلة العودة إلى الله\n\n${verse.arabic}\n${verse.source}\n\n— دليل التوبة النصوح`,
        title: "بطاقة توبتي",
      });
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch {}
  };

  const saveName = (val: string) => {
    setName(val);
    try { localStorage.setItem("tawbah_card_name", val); } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: "rgba(139,92,246,0.15)",
            alignItems: "center", justifyContent: "center",
          }}>
            <ImageIcon size={22} color="#8b5cf6" />
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: textColor }}>بطاقة توبتي</Text>
            <Text style={{ fontSize: 13, color: subColor }}>اصنع بطاقتك وشاركها</Text>
          </View>
        </View>

        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <CardPreview
            theme={theme}
            verse={verse}
            name={name}
            showName={showName}
            dayNumber={dayNumber}
            hijriDate={hijriDate}
          />
        </View>

        <View style={{
          backgroundColor: cardBg, borderRadius: 16, borderWidth: 1,
          borderColor, padding: 16, marginBottom: 12,
        }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: subColor, marginBottom: 8, textAlign: "right" }}>
            اسمك في البطاقة (اختياري)
          </Text>
          <View style={{ flexDirection: "row-reverse", gap: 8 }}>
            <TextInput
              value={name}
              onChangeText={saveName}
              placeholder="مثال: أخوك في الله"
              placeholderTextColor={subColor}
              style={{
                flex: 1,
                backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
                borderRadius: 10, borderWidth: 1, borderColor,
                paddingHorizontal: 12, paddingVertical: 10,
                color: textColor, textAlign: "right", fontSize: 14,
              }}
              maxLength={30}
            />
            <Pressable
              onPress={() => setShowName(!showName)}
              style={{
                paddingHorizontal: 14, borderRadius: 10, borderWidth: 1,
                borderColor: showName ? "#8b5cf6" : borderColor,
                backgroundColor: showName ? "rgba(139,92,246,0.12)" : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                alignItems: "center", justifyContent: "center",
              }}
            >
              {showName
                ? <Eye size={16} color="#8b5cf6" />
                : <EyeOff size={16} color={subColor} />}
            </Pressable>
          </View>
        </View>

        <View style={{
          backgroundColor: cardBg, borderRadius: 16, borderWidth: 1,
          borderColor, padding: 16, marginBottom: 12,
        }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: subColor, marginBottom: 10, textAlign: "right" }}>
            اختر التصميم
          </Text>
          <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }}>
            {THEMES.map((t, i) => (
              <Pressable
                key={t.id}
                onPress={() => setThemeIdx(i)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: t.bg,
                  borderWidth: themeIdx === i ? 2 : 1,
                  borderColor: themeIdx === i ? t.accent : "rgba(255,255,255,0.2)",
                  minWidth: 90, alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: t.accent }}>{t.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{
          backgroundColor: cardBg, borderRadius: 16, borderWidth: 1,
          borderColor, padding: 16, marginBottom: 16,
        }}>
          <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: subColor }}>الآية</Text>
            <Pressable
              onPress={() => setVerseIdx((i) => (i + 1) % VERSES.length)}
              style={{ flexDirection: "row-reverse", alignItems: "center", gap: 4 }}
            >
              <RefreshCw size={12} color="#8b5cf6" />
              <Text style={{ fontSize: 12, color: "#8b5cf6", fontWeight: "700" }}>غيّر الآية</Text>
            </Pressable>
          </View>
          <Text style={{ fontSize: 13, color: textColor, textAlign: "right", lineHeight: 22 }} numberOfLines={3}>
            {verse.arabic}
          </Text>
          <Text style={{ fontSize: 11, color: "#8b5cf6", fontWeight: "700", marginTop: 4, textAlign: "right" }}>{verse.source}</Text>
        </View>

        <Pressable
          onPress={handleShare}
          style={{
            flexDirection: "row-reverse",
            alignItems: "center", justifyContent: "center",
            gap: 8, paddingVertical: 16,
            borderRadius: 14,
            backgroundColor: shared ? "#10b981" : "#8b5cf6",
          }}
        >
          {shared ? <Check size={20} color="#fff" /> : <Share2 size={20} color="#fff" />}
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
            {shared ? "تمت المشاركة!" : "شارك البطاقة"}
          </Text>
        </Pressable>

        <View style={{
          marginTop: 12, padding: 14,
          backgroundColor: isDark ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.06)",
          borderRadius: 12, borderWidth: 1, borderColor: "rgba(139,92,246,0.2)",
        }}>
          <View style={{ flexDirection: "row-reverse", gap: 8, alignItems: "flex-start" }}>
            <ImageIcon size={13} color="#8b5cf6" style={{ marginTop: 2 }} />
            <Text style={{ fontSize: 12, color: subColor, textAlign: "right", lineHeight: 20, flex: 1 }}>
              شارك بطاقتك على السوشيال ميديا وأوقد في قلوب من حولك شعلة التوبة
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
