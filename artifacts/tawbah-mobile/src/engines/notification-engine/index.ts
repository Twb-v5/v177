import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const STORAGE_KEY = "tawbah_notif_settings_v2";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotifSettings {
  prayerFajr: boolean;
  prayerDhuhr: boolean;
  prayerAsr: boolean;
  prayerMaghrib: boolean;
  prayerIsha: boolean;
  morningAdhkar: boolean;
  eveningAdhkar: boolean;
  duaPeak: boolean;
  dailyReminder: boolean;
  weeklyReport: boolean;
  prayerAdvance: number;
  morningTime: string;
  eveningTime: string;
  reminderTime: string;
  journeyNudges: boolean;
  relapseSupport: boolean;
  quranReminder: boolean;
}

export const DEFAULT_SETTINGS: NotifSettings = {
  prayerFajr: true,
  prayerDhuhr: true,
  prayerAsr: true,
  prayerMaghrib: true,
  prayerIsha: true,
  morningAdhkar: true,
  eveningAdhkar: true,
  duaPeak: true,
  dailyReminder: false,
  weeklyReport: false,
  prayerAdvance: 5,
  morningTime: "06:30",
  eveningTime: "17:30",
  reminderTime: "21:00",
  journeyNudges: true,
  relapseSupport: true,
  quranReminder: false,
};

// ─── Persistence ──────────────────────────────────────────────────────────────

export async function loadNotifSettings(): Promise<NotifSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveNotifSettings(s: NotifSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function requestNotifPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function hasNotifPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

// ─── Schedule Helpers ─────────────────────────────────────────────────────────

function parseTime(hhmm: string): { hour: number; minute: number } {
  const [h, m] = hhmm.split(":").map(Number);
  return { hour: h || 0, minute: m || 0 };
}

export async function scheduleDailyNotif(
  id: string,
  title: string,
  body: string,
  hhmm: string,
): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  const { hour, minute } = parseTime(hhmm);
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}

export async function cancelNotif(id: string): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

export async function cancelAllNotifs(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Apply Settings ───────────────────────────────────────────────────────────

export async function applyNotifSettings(s: NotifSettings): Promise<void> {
  if (Platform.OS === "web") return;
  const ok = await hasNotifPermission();
  if (!ok) return;

  if (s.morningAdhkar) {
    await scheduleDailyNotif("morning_adhkar", "🌅 أذكار الصباح", "حان وقت أذكار الصباح — ابدأ يومك بذكر الله", s.morningTime);
  } else {
    await cancelNotif("morning_adhkar");
  }

  if (s.eveningAdhkar) {
    await scheduleDailyNotif("evening_adhkar", "🌙 أذكار المساء", "لا تنسَ أذكار المساء — حصّن نفسك قبل الليل", s.eveningTime);
  } else {
    await cancelNotif("evening_adhkar");
  }

  if (s.dailyReminder) {
    await scheduleDailyNotif("daily_reminder", "💚 تذكير يومي", "الله يراك ويحبك — كيف رحلتك اليوم؟", s.reminderTime);
  } else {
    await cancelNotif("daily_reminder");
  }

  if (s.quranReminder) {
    await scheduleDailyNotif("quran_reminder", "📖 ورد القرآن", "اقرأ ولو آية — القرآن شفاء وهدى", "20:00");
  } else {
    await cancelNotif("quran_reminder");
  }
}

// ─── Prayer notification IDs ──────────────────────────────────────────────────
export const PRAYER_NOTIF_IDS: Record<string, string> = {
  prayerFajr: "prayer_fajr",
  prayerDhuhr: "prayer_dhuhr",
  prayerAsr: "prayer_asr",
  prayerMaghrib: "prayer_maghrib",
  prayerIsha: "prayer_isha",
};

export const PRAYER_NAMES: Record<string, string> = {
  prayerFajr: "الفجر",
  prayerDhuhr: "الظهر",
  prayerAsr: "العصر",
  prayerMaghrib: "المغرب",
  prayerIsha: "العشاء",
};
