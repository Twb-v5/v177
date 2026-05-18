import { useState, useEffect, useCallback } from "react";
import {
  View, Text, Pressable, ScrollView, TextInput,
  Share, Alert, Platform, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import {
  Bookmark, Trash2, Search, Share2, StickyNote, X, Check,
} from "lucide-react-native";

const { width: SW } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuranBookmark {
  id: string;
  surahId: number;
  surahName: string;
  ayahNum: number;
  ayahText: string;
  note: string;
  savedAt: string;
}

// ─── AsyncStorage helpers ─────────────────────────────────────────────────────

const BM_KEY = "quran_bookmarks";

export async function getBookmarks(): Promise<QuranBookmark[]> {
  try {
    const raw = await AsyncStorage.getItem(BM_KEY);
    return raw ? (JSON.parse(raw) as QuranBookmark[]) : [];
  } catch { return []; }
}

export async function saveBookmark(bm: Omit<QuranBookmark, "id" | "savedAt">): Promise<QuranBookmark> {
  const list = await getBookmarks();
  const exists = list.find(b => b.surahId === bm.surahId && b.ayahNum === bm.ayahNum);
  if (exists) return exists;
  const newBm: QuranBookmark = {
    ...bm,
    id: `${bm.surahId}_${bm.ayahNum}_${Date.now()}`,
    savedAt: new Date().toISOString(),
  };
  list.unshift(newBm);
  try { await AsyncStorage.setItem(BM_KEY, JSON.stringify(list)); } catch {}
  return newBm;
}

export async function removeBookmark(id: string): Promise<void> {
  const list = (await getBookmarks()).filter(b => b.id !== id);
  try { await AsyncStorage.setItem(BM_KEY, JSON.stringify(list)); } catch {}
}

export async function isBookmarked(surahId: number, ayahNum: number): Promise<boolean> {
  const list = await getBookmarks();
  return list.some(b => b.surahId === surahId && b.ayahNum === ayahNum);
}

async function updateNote(id: string, note: string): Promise<void> {
  const list = (await getBookmarks()).map(b => b.id === id ? { ...b, note } : b);
  try { await AsyncStorage.setItem(BM_KEY, JSON.stringify(list)); } catch {}
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
  } catch { return ""; }
}

// ─── Bookmark Card ────────────────────────────────────────────────────────────

function BookmarkCard({ bm, onDelete, onNoteUpdate, c }: {
  bm: QuranBookmark;
  onDelete: () => void;
  onNoteUpdate: (note: string) => void;
  c: ReturnType<typeof useColors>;
}) {
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState(bm.note);
  const [noteSaved, setNoteSaved] = useState(false);
  const goldColor = "#c8a84b";

  const saveNote = async () => {
    onNoteUpdate(noteText);
    setNoteSaved(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => { setNoteSaved(false); setShowNote(false); }, 1200);
  };

  const share = async () => {
    const text = `﴿${bm.ayahText}﴾\n— سورة ${bm.surahName}، الآية ${bm.ayahNum}${bm.note ? `\n\n💭 ${bm.note}` : ""}`;
    try { await Share.share({ message: text }); } catch {}
  };

  const confirmDelete = () => {
    Alert.alert("حذف الإشارة", "هل تريد حذف هذه الإشارة المرجعية؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: c.border,
      overflow: "hidden",
      ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }) }}>
      {/* Gold accent top line */}
      <View style={{ height: 3, backgroundColor: goldColor }} />

      <View style={{ padding: 14 }}>
        {/* Header */}
        <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
            <View style={{ backgroundColor: goldColor + "22", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: goldColor }}>{bm.surahName}</Text>
            </View>
            <View style={{ backgroundColor: c.backgroundDeep, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 11, color: c.textSecondary }}>آية {bm.ayahNum}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Pressable onPress={share} style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: c.backgroundDeep, alignItems: "center", justifyContent: "center" }}>
              <Share2 size={14} color={c.textMuted} />
            </Pressable>
            <Pressable onPress={confirmDelete} style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "rgba(220,38,38,0.1)", alignItems: "center", justifyContent: "center" }}>
              <Trash2 size={14} color={c.danger} />
            </Pressable>
          </View>
        </View>

        {/* Ayah text */}
        <Text style={{ fontSize: 18, lineHeight: 32, color: c.text, textAlign: "right",
          fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", marginBottom: 10 }}>
          ﴿{bm.ayahText}﴾
        </Text>

        {/* Note */}
        {bm.note && !showNote && (
          <View style={{ backgroundColor: c.backgroundDeep, borderRadius: 10, padding: 10, marginBottom: 8, flexDirection: "row-reverse", alignItems: "flex-start", gap: 6 }}>
            <StickyNote size={13} color={c.textMuted} style={{ marginTop: 2 }} />
            <Text style={{ flex: 1, fontSize: 13, color: c.textSecondary, textAlign: "right", lineHeight: 20 }}>{bm.note}</Text>
          </View>
        )}

        {/* Note editor */}
        {showNote && (
          <View style={{ backgroundColor: c.backgroundDeep, borderRadius: 12, padding: 10, marginBottom: 8 }}>
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="أضف تأملاً أو ملاحظة..."
              placeholderTextColor={c.textMuted}
              multiline
              style={{ fontSize: 13, color: c.text, textAlign: "right", minHeight: 60, lineHeight: 20 }}
              autoFocus
            />
            <View style={{ flexDirection: "row-reverse", gap: 8, marginTop: 8 }}>
              <Pressable onPress={saveNote} style={{ flex: 1, height: 34, borderRadius: 8, backgroundColor: goldColor + "22", borderWidth: 1, borderColor: goldColor + "44", alignItems: "center", justifyContent: "center", flexDirection: "row-reverse", gap: 4 }}>
                {noteSaved ? <Check size={14} color={goldColor} /> : <StickyNote size={14} color={goldColor} />}
                <Text style={{ fontSize: 12, fontWeight: "600", color: goldColor }}>{noteSaved ? "تم الحفظ" : "حفظ"}</Text>
              </Pressable>
              <Pressable onPress={() => setShowNote(false)} style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: c.border, alignItems: "center", justifyContent: "center" }}>
                <X size={14} color={c.textMuted} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 10, color: c.textMuted }}>{formatDate(bm.savedAt)}</Text>
          <Pressable onPress={() => setShowNote(!showNote)} style={{ flexDirection: "row-reverse", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: c.backgroundDeep }}>
            <StickyNote size={12} color={c.textMuted} />
            <Text style={{ fontSize: 11, color: c.textMuted }}>{bm.note ? "تعديل الملاحظة" : "إضافة ملاحظة"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BookmarksScreen() {
  const router = useRouter();
  const c = useColors();
  const goldColor = "#c8a84b";

  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>([]);
  const [search, setSearch] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getBookmarks().then(list => { setBookmarks(list); setReady(true); });
  }, []);

  const filtered = search
    ? bookmarks.filter(b => b.surahName.includes(search) || b.ayahText.includes(search) || b.note.includes(search))
    : bookmarks;

  const handleDelete = useCallback(async (id: string) => {
    await removeBookmark(id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleNoteUpdate = useCallback(async (id: string, note: string) => {
    await updateNote(id, note);
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, note } : b));
  }, []);

  const clearAll = () => {
    Alert.alert("حذف الكل", "هل تريد حذف جميع الإشارات المرجعية؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف الكل", style: "destructive", onPress: async () => {
          await AsyncStorage.removeItem(BM_KEY);
          setBookmarks([]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: goldColor + "22", alignItems: "center", justifyContent: "center" }}>
              <Bookmark size={16} color={goldColor} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: c.text }}>المفضلة القرآنية</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {bookmarks.length > 0 && (
              <Pressable onPress={clearAll} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(220,38,38,0.1)" }}>
                <Text style={{ fontSize: 11, color: c.danger, fontWeight: "600" }}>حذف الكل</Text>
              </Pressable>
            )}
            <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: c.surfaceElevated }}>
              <Text style={{ fontSize: 12, color: c.textMuted }}>رجوع</Text>
            </Pressable>
          </View>
        </View>

        {/* Search */}
        <View style={{ flexDirection: "row-reverse", alignItems: "center", backgroundColor: c.surfaceElevated, borderRadius: 12, paddingHorizontal: 12, gap: 8, borderWidth: 1, borderColor: c.border }}>
          <Search size={15} color={c.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ابحث في الآيات والملاحظات..."
            placeholderTextColor={c.textMuted}
            style={{ flex: 1, height: 40, fontSize: 13, color: c.text, textAlign: "right" }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <X size={16} color={c.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {!ready ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: c.textMuted, fontSize: 14 }}>جاري التحميل...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontSize: 56 }}>🔖</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: c.text, marginTop: 16, textAlign: "center" }}>
            {search ? "لا توجد نتائج" : "لا توجد إشارات مرجعية"}
          </Text>
          <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
            {search
              ? "جرّب كلمة بحث أخرى"
              : "عند قراءة القرآن، اضغط على أي آية واحفظها هنا مع ملاحظاتك الشخصية"}
          </Text>
          {!search && (
            <Pressable
              onPress={() => router.push("/quran" as any)}
              style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14,
                backgroundColor: goldColor + "22", borderWidth: 1, borderColor: goldColor + "55" }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: goldColor }}>اقرأ القرآن</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16 }}
        >
          {/* Stats bar */}
          <View style={{ flexDirection: "row-reverse", gap: 8, marginBottom: 16 }}>
            <View style={{ flex: 1, backgroundColor: c.surface, borderRadius: 12, padding: 10, alignItems: "center", borderWidth: 1, borderColor: c.border }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: goldColor }}>{bookmarks.length}</Text>
              <Text style={{ fontSize: 10, color: c.textMuted }}>إشارة محفوظة</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: c.surface, borderRadius: 12, padding: 10, alignItems: "center", borderWidth: 1, borderColor: c.border }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: c.primary }}>{bookmarks.filter(b => b.note).length}</Text>
              <Text style={{ fontSize: 10, color: c.textMuted }}>مع ملاحظات</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: c.surface, borderRadius: 12, padding: 10, alignItems: "center", borderWidth: 1, borderColor: c.border }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#8b5cf6" }}>
                {new Set(bookmarks.map(b => b.surahId)).size}
              </Text>
              <Text style={{ fontSize: 10, color: c.textMuted }}>سورة</Text>
            </View>
          </View>

          {search && filtered.length > 0 && (
            <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 10, textAlign: "right" }}>
              {filtered.length} نتيجة لـ «{search}»
            </Text>
          )}

          {filtered.map(bm => (
            <BookmarkCard
              key={bm.id}
              bm={bm}
              c={c}
              onDelete={() => handleDelete(bm.id)}
              onNoteUpdate={(note) => handleNoteUpdate(bm.id, note)}
            />
          ))}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
