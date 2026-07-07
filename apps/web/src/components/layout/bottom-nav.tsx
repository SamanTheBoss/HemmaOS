"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n-context";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: "/hem", label: t("nav.home"), icon: Home },
    { href: "/appar", label: t("nav.apps"), icon: Grid3X3 },
    { href: "/installningar", label: t("nav.settings"), icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div className="glass flex items-center gap-1.5 rounded-2xl border border-line p-2 shadow-2xl shadow-black/50">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              className={cn(
                "btn flex h-12 w-12 items-center justify-center rounded-xl transition-all",
                isActive
                  ? "bg-gradient-to-br from-accent to-violet text-white shadow-lg shadow-violet/30"
                  : "text-slate-400 hover:bg-white/[.06] hover:text-white",
              )}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
