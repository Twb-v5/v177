import type { VoiceProfile } from "./types";

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: "sheikh-calm",
    gender: "male",
    name: "الشيخ الهادئ",
    desc: "صوت رجولي وقور بفصحى سليمة",
    emoji: "🕌",
    tag: "هادئ · فصحى",
  },
  {
    id: "wise-friend",
    gender: "male",
    name: "الصاحب الحكيم",
    desc: "شاب ٣٥ سنة، دافئ وحكيم كصاحب",
    emoji: "🤝",
    tag: "ودود · طبيعي",
  },
  {
    id: "young-guide",
    gender: "male",
    name: "المرشد الشاب",
    desc: "شاب حيوي وواضح ومُشجِّع",
    emoji: "✨",
    tag: "حيوي · مباشر",
  },
  {
    id: "wise-teacher",
    gender: "female",
    name: "المعلمة الفاضلة",
    desc: "صوت أنثوي رزين بفصحى واضحة",
    emoji: "📚",
    tag: "هادئة · فصحى",
  },
  {
    id: "sister-caring",
    gender: "female",
    name: "الأخت المتفهمة",
    desc: "شابة دافئة تتكلم بصدق وحنان",
    emoji: "💙",
    tag: "حنونة · طبيعية",
  },
  {
    id: "gentle-mentor",
    gender: "female",
    name: "المرشدة الحنونة",
    desc: "ناعمة ومطمئنة تبثّ السكينة",
    emoji: "🌸",
    tag: "ناعمة · مريحة",
  },
];

export const VOICE_PROFILE_STORAGE_KEY = "zakiy_voice_profile";
export const DEFAULT_VOICE_PROFILE_ID = "young-guide";

export const ALL_STARTER_QUESTIONS: Array<{ q: string; icon: string }> = [
  { q: "إزاي أتوب توبة صادقة؟", icon: "🌿" },
  { q: "أنا بعيد عن ربنا، من فين أبدأ؟", icon: "🕌" },
  { q: "عملت ذنب كبير، ربنا هيسامحني؟", icon: "💚" },
  { q: "إزاي أثبت على الطاعة؟", icon: "⚡" },
  { q: "أنا بحس بوحشة روحية، أعمل إيه؟", icon: "🌙" },
  { q: "الاستغفار بيتقبل منين؟", icon: "🤲" },
  { q: "كيف أقوي علاقتي بالقرآن؟", icon: "📖" },
  { q: "أنا مش قادر أصلي بخشوع، أعمل إيه؟", icon: "🙏" },
  { q: "بيجيلي وسواس كتير، إزاي أتعامل معاه؟", icon: "🧠" },
  { q: "إزاي أبعد نفسي عن أصحاب السوء؟", icon: "🛡️" },
  { q: "ما معنى التوكل على الله؟", icon: "🌟" },
  { q: "الذنوب الصغيرة بتتراكم، إزاي أوقف؟", icon: "🪨" },
  { q: "عايز أغير حياتي، من فين أبدأ؟", icon: "🌅" },
  { q: "إزاي أحبب قلبي في الصلاة؟", icon: "💙" },
  { q: "ربنا بيسمع دعاي وأنا مذنب؟", icon: "🤍" },
  { q: "إزاي أتغلب على الغضب؟", icon: "🔥" },
  { q: "محتاج أمل، إيه اللي يعينني؟", icon: "✨" },
  { q: "الوقت بيروح مني، إزاي أستثمره؟", icon: "⏳" },
  { q: "بخاف من الموت، إزاي أتعامل مع هذا الخوف؟", icon: "🌙" },
  { q: "إزاي أشكر ربنا على نعمه؟", icon: "🌺" },
  { q: "أنا زهقت من الحياة، إيه رأيك؟", icon: "💭" },
  { q: "إزاي أكون قريب من ربنا في وسط الزحمة؟", icon: "🕊️" },
  { q: "كيف أعرف إن توبتي اتقبلت؟", icon: "🌿" },
  { q: "إزاي أتعامل مع ناس بتأذيني وأسامحهم؟", icon: "❤️" },
  { q: "المعصية بتتكرر مني، خايف أيأس!", icon: "😔" },
  { q: "إزاي أعمل حسنات كتير في وقت قليل؟", icon: "⚡" },
  { q: "دعائي ما بيتستجابش، ليه؟", icon: "🤲" },
  { q: "إزاي أواجه ضغوط الحياة بإيمان؟", icon: "💪" },
];

export function pickStarterQuestions(count = 6): Array<{ q: string; icon: string }> {
  const shuffled = [...ALL_STARTER_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 3 && hour < 7) {
    return "أهلاً يا صاحبي! 🌙 جوه الليل، ربنا معاك. أي حاجة في قلبك؟";
  } else if (hour >= 7 && hour < 12) {
    return "أهلاً يا صاحبي! 🌅 الصبح جميل، ربنا يبارك يومك. إيش عندك؟";
  } else if (hour >= 12 && hour < 15) {
    return "أهلاً! ☀️ وقت الظهيرة، ربنا يسقينا من خيره. إيش محتاج؟";
  } else if (hour >= 15 && hour < 18) {
    return "أهلاً يا صاحبي! 🌤️ العصر جاي، وقت الاستجابة. أنا هنا.";
  } else if (hour >= 18 && hour < 20) {
    return "أهلاً! 🌇 وقت المغرب، أجمل أوقات اليوم. إيش عندك؟";
  } else if (hour >= 20 && hour < 22) {
    return "أهلاً! 🌆 العشاء، وقت الدعاء. أنا أسمعك.";
  } else {
    return "أهلاً يا صاحبي! 🌿 أنا الزكي — مش بوت رسمي، أنا صاحبك اللي بيعرف دينه.\n\nابعتلي صوتك أو اكتب — أنا هنا أسمعك بكل قلبي.";
  }
}
