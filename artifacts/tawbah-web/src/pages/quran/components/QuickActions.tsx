import { Link } from "wouter";

export function QuickActions() {
  const actions = [
    { icon: "🎙️", label: "استمع", sub: "تلاوة صوتية", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", href: "/quran/listen" },
    { icon: "📖", label: "اقرأ", sub: "مصحف كامل", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", href: "/quran/read" },
    { icon: "💡", label: "تفسير", sub: "آية بآية", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)", href: "/quran/tafsir" },
    { icon: "🌙", label: "حفظ", sub: "مساعد الحفظ", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", href: "/quran/memorize" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((a) => (
        <Link
          key={a.label}
          href={a.href}
          className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl active:scale-[0.95] transition-all"
          style={{ background: a.bg, border: `1px solid ${a.border}` }}
        >
          <span className="text-[22px] leading-none">{a.icon}</span>
          <span className="font-bold text-[12px]" style={{ color: a.color }}>{a.label}</span>
          <span className="text-[9px] text-muted-foreground text-center leading-tight">{a.sub}</span>
        </Link>
      ))}
    </div>
  );
}
