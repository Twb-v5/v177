import { useState } from "react";
import { isNativeApp } from "@/lib/api-base";
import { API_CONFIG } from "@/lib/api-config";
import { Share2, Users, Heart } from "lucide-react";

export function InviteFriendCard() {
  const [shared, setShared] = useState(false);

  const handleInvite = async () => {
    const text =
      "اكتشفت تطبيقاً يساعدك على التوبة الصادقة 🌿\nرحلة 30 يوماً مع خطة يومية وذكر وإرشاد روحي.\n\nابدأ رحلتك الآن 👇";
    const url = isNativeApp()
      ? API_CONFIG.serverUrl.replace(/\/api\/?$/, "")
      : window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ title: "دليل التوبة النصوح", text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`).catch(() => {});
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  return (
    <button
      onClick={handleInvite}
      className="w-full block rounded-[22px] overflow-hidden active:scale-[0.97] transition-transform relative text-right"
      style={{
        background:
          "linear-gradient(135deg, #0a1f14 0%, #0d2b1a 45%, #0e3320 100%)",
        border: "1px solid rgba(52,211,153,0.28)",
        boxShadow: "0 8px 28px rgba(16,185,129,0.14), 0 3px 8px rgba(0,0,0,0.3)",
      }}
    >
      {/* Glow */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(52,211,153,0.35) 0%, transparent 70%)",
          filter: "blur(16px)",
        }}
      />

      <div className="relative z-10 p-4">
        <div className="flex items-center gap-3.5">
          {/* Icon */}
          <div
            className="w-[54px] h-[54px] rounded-[16px] flex items-center justify-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(52,211,153,0.25) 0%, rgba(16,185,129,0.35) 100%)",
              border: "1px solid rgba(52,211,153,0.38)",
              boxShadow: "0 0 16px rgba(52,211,153,0.25)",
            }}
          >
            <Users size={24} style={{ color: "#6ee7b7" }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart size={10} style={{ color: "#34d399" }} />
              <span
                style={{
                  fontSize: 9,
                  color: "#6ee7b7",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                الدال على الخير كفاعله
              </span>
            </div>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.2,
                marginBottom: 3,
              }}
            >
              ادعُ رفيقاً في رحلة التوبة
            </h3>
            <p
              style={{
                fontSize: 10.5,
                color: "rgba(110,231,183,0.55)",
                lineHeight: 1.4,
              }}
            >
              شارك التطبيق مع أخٍ يحتاج الهداية
            </p>
          </div>

          {/* Share button */}
          <div
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: shared
                ? "rgba(52,211,153,0.3)"
                : "rgba(52,211,153,0.15)",
              border: "1px solid rgba(52,211,153,0.35)",
            }}
          >
            {shared ? (
              <span style={{ fontSize: 13, color: "#6ee7b7", fontWeight: 700 }}>
                ✓
              </span>
            ) : (
              <Share2 size={16} style={{ color: "#6ee7b7" }} />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
