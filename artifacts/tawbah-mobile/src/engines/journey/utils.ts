import type { JourneyDay, JourneyData } from "./types";

export function toArabicIndic(n: number): string {
  return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]!);
}

export function buildNativeFallbackJourney(): JourneyData {
  const days: JourneyDay[] = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    return {
      day,
      title: `اليوم ${toArabicIndic(day)}`,
      tasks: ["ذكر", "استغفار", "صلاة"],
      verse: "﴿وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَا الْمُؤْمِنُونَ لَعَلَّكُمْ تُفْلِحُونَ﴾",
      completed: false,
      isCurrent: day === 1,
      isLocked: day !== 1,
      taskChecks: [false, false, false],
    };
  });
  return { days, completedCount: 0, currentDay: 1, streakDays: 0 };
}

export const DAY_EMOJIS: Record<number, string> = {
  1: "🌅", 2: "📿", 3: "🤲", 4: "💧", 5: "📖",
  6: "🕌", 7: "🌱", 8: "🌙", 9: "⭐", 10: "🔑",
  11: "💎", 12: "🦋", 13: "🌊", 14: "🌿", 15: "☀️",
  16: "🕊️", 17: "🌸", 18: "🔥", 19: "🌟", 20: "🙏",
  21: "🌳", 22: "💫", 23: "🏔️", 24: "🎯", 25: "🌈",
  26: "👑", 27: "✨", 28: "🗝️", 29: "🌺", 30: "🏆",
};
