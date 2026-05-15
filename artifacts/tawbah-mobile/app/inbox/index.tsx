import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Bell, RefreshCw, Inbox, Trash2 } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { apiUrl } from "@/lib/api";
import { getSessionId } from "@/lib/session";

interface NotifItem {
  id: number;
  sessionId: string;
  notifId: string;
  type: string;
  title: string;
  body: string;
  icon?: string;
  color?: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  reminder:    "#60A5FA",
  achievement: "#F59E0B",
  warning:     "#F87171",
  milestone:   "#A78BFA",
  daily:       "#10b981",
};

function formatRelativeTime(isoStr: string): string {
  try {
    const diff = Date.now() - new Date(isoStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1)  return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)   return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} أيام`;
  } catch { return ""; }
}

function NotifCard({ notif, isDark, c, isRTL, onMarkRead, onDelete }: {
  notif: NotifItem; isDark: boolean; c: ReturnType<typeof useColors>;
  isRTL: boolean; onMarkRead: () => void; onDelete: () => void;
}) {
  const color = TYPE_COLORS[notif.type] ?? "#10b981";
  return (
    <Pressable
      onPress={onMarkRead}
      style={{
        flexDirection: isRTL ? "row-reverse" : "row", gap: 12, padding: 14, borderRadius: 16, marginBottom: 10,
        backgroundColor: notif.isRead
          ? (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)")
          : (isDark ? "rgba(255,255,255,0.06)" : "#fff"),
        borderWidth: 1.5,
        borderColor: notif.isRead
          ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)")
          : `${color}40`,
      }}
    >
      {!notif.isRead && (
        <View style={{ position: "absolute", top: 14, right: isRTL ? "auto" : 14, left: isRTL ? 14 : "auto", width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
      )}
      <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: `${color}20` }}>
        <Bell size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: notif.isRead ? "600" : "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left" }}>
          {notif.title}
        </Text>
        <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", marginTop: 3, lineHeight: 18 }}>
          {notif.body}
        </Text>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <Pressable onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={13} color={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)"} />
          </Pressable>
          <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
            {formatRelativeTime(notif.createdAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function InboxScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const sid = await getSessionId();
      const res = await fetch(apiUrl(`/notifications/inbox?sessionId=${encodeURIComponent(sid)}`));
      if (res.ok) {
        const data = await res.json() as NotifItem[];
        setNotifications(data);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markRead = useCallback(async (notif: NotifItem) => {
    if (notif.isRead) return;
    Haptics.selectionAsync();
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    try {
      await fetch(apiUrl(`/notifications/inbox/${notif.notifId}/read`), { method: "PATCH" });
    } catch {}
  }, []);

  const deleteNotif = useCallback(async (notif: NotifItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    try {
      await fetch(apiUrl(`/notifications/inbox/${notif.notifId}`), { method: "DELETE" });
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      const sid = await getSessionId();
      await fetch(apiUrl("/notifications/inbox/read-all"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      });
    } catch {}
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader
        titleAr="صندوق الوارد"
        subtitleAr={unreadCount > 0 ? `${unreadCount} غير مقروء` : "كل الرسائل مقروءة"}
        rightAction={
          <View style={{ flexDirection: "row", gap: 8 }}>
            {unreadCount > 0 && (
              <Pressable onPress={markAllRead} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(16,185,129,0.12)", borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" }}>
                <Text style={{ fontSize: 11, color: c.primary, fontFamily: "IBMPlexSansArabic_700Bold" }}>قراءة الكل</Text>
              </Pressable>
            )}
            <Pressable onPress={fetchNotifs} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", alignItems: "center", justifyContent: "center" }}>
              <RefreshCw size={16} color={c.textSecondary} />
            </Pressable>
          </View>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <ActivityIndicator size="large" color={c.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Inbox size={48} color={c.textMuted} />
            <Text style={{ fontSize: 16, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 12 }}>الصندوق فارغ</Text>
            <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 6 }}>لا توجد إشعارات حتى الآن</Text>
          </View>
        ) : (
          notifications.map((notif, i) => (
            <Animated.View key={notif.id} entering={FadeInDown.delay(i < 8 ? i * 40 : 0).springify()}>
              <NotifCard
                notif={notif} isDark={isDark} c={c} isRTL={isRTL}
                onMarkRead={() => markRead(notif)}
                onDelete={() => deleteNotif(notif)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
