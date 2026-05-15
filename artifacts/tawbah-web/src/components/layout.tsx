import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Home, Calendar, BarChart2, User2, ChevronUp, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettings } from "@/context/SettingsContext";
export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { t } = useSettings();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);

  const leftItems = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/journey", label: "رحلتي", icon: Calendar },
  ];

  const rightItems = [
    { href: "/progress", label: "تقدمي", icon: BarChart2 },
    { href: "/account", label: "حسابي", icon: User2 },
  ];

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 280);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setShowScrollTop(false); }, [location]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const zakiHref = "/zakiy";
  const isSos = location === "/sos";
  const isZakiy = location === "/zakiy";

  const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Home }) => {
    const isActive = location === href;
    return (
      <Link
        href={href}
        className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 tap-highlight-transparent"
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
      >
        {isActive && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute top-0 inset-x-2 h-[3px] bg-primary rounded-b-full"
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        )}
        <Icon
          size={22}
          strokeWidth={isActive ? 2.5 : 1.8}
          className={cn("transition-colors duration-200", isActive ? "text-primary" : "text-muted-foreground")}
          aria-hidden="true"
        />
        <span className={cn(
          "text-[10px] font-medium transition-colors leading-none",
          isActive ? "text-primary font-semibold" : "text-muted-foreground"
        )}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "min-h-[100dvh] flex flex-col bg-background relative w-full",
        !isSos && !isZakiy && "pb-[80px]",
      )}
      style={{ overflowX: "clip" }}
    >
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10" />

      <main className="flex-1 flex flex-col relative z-0">
        <AnimatePresence>
          <motion.div
            key={location}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Scroll-to-top button */}
      <AnimatePresence>
        {!isSos && showScrollTop && (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            whileTap={{ scale: 0.88 }}
            onClick={scrollToTop}
            className="fixed z-50 p-3 rounded-full bg-card border border-border shadow-lg shadow-black/10 hover:border-primary/40 hover:text-primary text-muted-foreground transition-colors"
            style={{ bottom: "88px", right: "16px" }}
            aria-label="الصعود للأعلى"
            title="الصعود للأعلى"
          >
            <ChevronUp size={20} strokeWidth={2.2} />
          </motion.button>
        )}
      </AnimatePresence>

      {!isSos && !isZakiy && (
        <>
          {/* Floating Bottom Navigation Bar - Full Width at Bottom */}
          <nav className="fixed bottom-0 inset-x-0 z-40 px-0">
            <div className="relative">
              {/* Floating glass pill */}
              <div
                className="relative overflow-hidden bg-card/88 backdrop-blur-2xl"
                style={{
                  boxShadow: "0 -4px 24px rgba(0,0,0,0.12), 0 -2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.12)",
                  border: "1px solid hsl(var(--border)/0.6)",
                  borderBottom: "none",
                }}
              >
                {/* Subtle top shine */}
                <div
                  className="absolute top-0 inset-x-0 h-[45%] pointer-events-none"
                  style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)" }}
                />

                {/* Nav content */}
                <div className="relative flex items-center h-[62px]" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
                  {leftItems.map((item) => (
                    <NavItem key={item.href} {...item} />
                  ))}

                  {/* Center Zakiy button — same style as other nav items */}
                  <NavItem href={zakiHref} label="زكي" icon={Bot} />

                  {rightItems.map((item) => (
                    <NavItem key={item.href} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
