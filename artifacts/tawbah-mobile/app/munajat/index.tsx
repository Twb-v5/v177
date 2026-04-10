import { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, Pressable, Animated as RNAnimated, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Moon, Stars, Heart, Wind, Waves, TreePine, Cloud } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SCENES = [
  {
    id: "night",
    name: "الليل الهادئ",
    icon: "🌙",
    bg: ["#0a0a1a", "#0d1b2a"],
    accent: "#c9a84c",
    stars: true,
    desc: "ناجِ ربك في جنح الليل، حيث تنزل الرحمات",
    particles: "✦",
  },
  {
    id: "dawn",
    name: "نسيم الفجر",
    icon: "🌅",
    bg: ["#1a0a2e", "#2d1b69"],
    accent: "#f59e0b",
    stars: false,
    desc: "لحظة الفجر — أقرب ما يكون الداعي من الإجابة",
    particles: "·",
  },
  {
    id: "garden",
    name: "حديقة الروح",
    icon: "🌿",
    bg: ["#071f12", "#0d3320"],
    accent: "#34d399",
    stars: false,
    desc: "في سكينة الطبيعة يصفو القلب ويرتفع الدعاء",
    particles: "🍃",
  },
  {
    id: "ocean",
    name: "عمق البحر",
    icon: "🌊",
    bg: ["#0c1445", "#0f2d5e"],
    accent: "#38bdf8",
    stars: false,
    desc: "كما الموج يعود للبحر، يعود القلب لربه",
    particles: "~",
  },
  {
    id: "desert",
    name: "الصحراء الساكنة",
    icon: "🏜️",
    bg: ["#1c0a00", "#3b1a00"],
    accent: "#fb923c",
    stars: true,
    desc: "في الصمت الكبير، تسمع روحك صوت الخالق",
    particles: "⋆",
  },
];

const MUNAJAT_TEXTS = [
  {
    id: "1",
    title: "مناجاة التائب",
    arabic: "إلهي، وعزتك وجلالك ما أردت بمعصيتك مخالفتك، ولكن عصيتك إذ عصيتك وأنا أعلم أنك تراني فوق ذلك شيطان فأزلني، فعلي غضبك ولك عذري.",
    source: "المناجاة الخمس عشرة — الإمام السجاد",
  },
  {
    id: "2",
    title: "مناجاة المحبين",
    arabic: "إلهي من ذا الذي ذاق حلاوة محبتك فرام منك بدلاً، ومن ذا الذي أنس بقربك فابتغى عنك حولاً.",
    source: "المناجاة الخمس عشرة",
  },
  {
    id: "3",
    title: "مناجاة العارفين",
    arabic: "إلهي فاجعلنا ممن اصطفيته لقربك وولايتك، وأخلصته لودك ومحبتك، وشوّقته إلى لقائك، ورضّيته بقضائك.",
    source: "المناجاة الخمس عشرة",
  },
  {
    id: "4",
    title: "مناجاة المريدين",
    arabic: "إلهي فاجعل أوّل ما تجود به عليّ توبة تمحو بها ما سلف من الخطايا، وتُرجع بها إليّ ما كان قد تولّى من صالح الرجاء.",
    source: "المناجاة الخمس عشرة",
  },
  {
    id: "5",
    title: "دعاء الكرب",
    arabic: "اللهم رحمتك أرجو فلا تكلني إلى نفسي طرفة عين، وأصلح لي شأني كله، لا إله إلا أنت.",
    source: "حديث شريف",
  },
];

function StarField({ count, accentColor }: { count: number; accentColor: string }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.6 + 0.3,
  }));

  return (
    <View style={{ position: "absolute", width: "100%", height: "100%" }} pointerEvents="none">
      {stars.map((star, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: `${star.left}%` as any,
            top: `${star.top}%` as any,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: accentColor,
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
}

function MunajatCard({
  text,
  isDark,
  accentColor,
}: {
  text: typeof MUNAJAT_TEXTS[0];
  isDark: boolean;
  accentColor: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={{
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: `${accentColor}40`,
        padding: 18,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: accentColor, textAlign: "right" }}>{text.title}</Text>
        <Moon size={14} color={accentColor} />
      </View>
      <Text
        style={{
          fontSize: 15, color: "rgba(255,255,255,0.9)",
          textAlign: "right", lineHeight: 26,
          fontFamily: "serif",
        }}
        numberOfLines={expanded ? undefined : 3}
      >
        {text.arabic}
      </Text>
      {!expanded && (
        <Text style={{ fontSize: 11, color: accentColor, marginTop: 6, textAlign: "right" }}>اضغط للمزيد...</Text>
      )}
      <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8, textAlign: "right" }}>
        {text.source}
      </Text>
    </Pressable>
  );
}

export default function MunajatScreen() {
  const { isDark } = useColors();
  const [sceneIdx, setSceneIdx] = useState(0);
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;

  const scene = SCENES[sceneIdx];

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, { toValue: 1.06, duration: 2500, useNativeDriver: true }),
        RNAnimated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const changeScene = (idx: number) => {
    RNAnimated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setSceneIdx(idx);
      RNAnimated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: scene.bg[0] }}>
      <RNAnimated.View style={{ flex: 1, opacity: fadeAnim }}>
        {scene.stars && <StarField count={50} accentColor={scene.accent} />}

        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <RNAnimated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={{
                  width: 80, height: 80, borderRadius: 40,
                  backgroundColor: `${scene.accent}20`,
                  borderWidth: 2, borderColor: `${scene.accent}60`,
                  alignItems: "center", justifyContent: "center",
                  marginBottom: 12,
                }}>
                  <Text style={{ fontSize: 36 }}>{scene.icon}</Text>
                </View>
              </RNAnimated.View>
              <Text style={{ fontSize: 22, fontWeight: "800", color: scene.accent, textAlign: "center" }}>
                المناجاة والدعاء
              </Text>
              <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: "center", marginTop: 4, lineHeight: 20 }}>
                {scene.desc}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: "row-reverse", gap: 8, paddingHorizontal: 2 }}>
                {SCENES.map((s, i) => (
                  <Pressable
                    key={s.id}
                    onPress={() => changeScene(i)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8,
                      borderRadius: 20, borderWidth: 1.5,
                      borderColor: sceneIdx === i ? s.accent : "rgba(255,255,255,0.2)",
                      backgroundColor: sceneIdx === i ? `${s.accent}25` : "rgba(255,255,255,0.05)",
                      flexDirection: "row-reverse", alignItems: "center", gap: 6,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{s.icon}</Text>
                    <Text style={{
                      fontSize: 12, fontWeight: "700",
                      color: sceneIdx === i ? s.accent : "rgba(255,255,255,0.6)",
                    }}>
                      {s.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={{
              backgroundColor: `${scene.accent}15`,
              borderRadius: 16, padding: 18, marginBottom: 20,
              borderWidth: 1, borderColor: `${scene.accent}30`,
            }}>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Heart size={16} color={scene.accent} />
                <Text style={{ fontSize: 13, fontWeight: "700", color: scene.accent }}>دعاء التوبة</Text>
              </View>
              <Text style={{
                fontSize: 16, color: "#fff", textAlign: "center",
                lineHeight: 30, fontFamily: "serif",
              }}>
                اللهم إني أسألك بعظمتك وجبروتك ومنّك ورحمتك أن تتوب عليّ وتعفو عني وتغفر لي ذنوبي كلها، صغيرها وكبيرها، إنك أنت الغفور الرحيم
              </Text>
            </View>

            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Stars size={16} color={scene.accent} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: scene.accent }}>
                مناجيات الأولياء
              </Text>
            </View>

            {MUNAJAT_TEXTS.map((text) => (
              <MunajatCard
                key={text.id}
                text={text}
                isDark={isDark}
                accentColor={scene.accent}
              />
            ))}

            <View style={{
              marginTop: 10, padding: 18,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 16, borderWidth: 1,
              borderColor: `${scene.accent}25`,
              alignItems: "center",
            }}>
              <Text style={{ fontSize: 20, marginBottom: 8 }}>🤲</Text>
              <Text style={{
                fontSize: 14, color: "rgba(255,255,255,0.8)",
                textAlign: "center", lineHeight: 24,
              }}>
                ارفع يديك الآن وادعُ الله بما شئت — فأنت في أقرب المقامات منه
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </RNAnimated.View>
    </View>
  );
}
