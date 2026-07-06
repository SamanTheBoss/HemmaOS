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
    <nav className="glass fixed bottom-0 left-0 right-0 z-40 border-t border-line safe-area-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "btn flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs transition-colors",
                isActive
                  ? "text-white bg-gradient-to-r from-accent/20 to-violet/10 shadow-[inset_0_0_0_1px_rgba(99,120,255,0.22)]"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/[.04]",
              )}
            >
              <Icon
                className={cn("h-6 w-6", isActive && "stroke-[2.5]")}
              />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
