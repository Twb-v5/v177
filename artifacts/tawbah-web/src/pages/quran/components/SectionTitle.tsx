import React from "react";

export function SectionTitle({
  icon,
  title,
  sub,
  accent = "#c8a84b",
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}
      >
        <div style={{ color: accent }}>{icon}</div>
      </div>
      <div>
        <h2 className="font-bold text-base leading-tight">{title}</h2>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
