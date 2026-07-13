"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

const SEEN_KEY = "hemmaos-seen-version";

/**
 * After the box updates to a new release, this shows a "what's new" popup with
 * that release's changelog. It stays until dismissed and never reappears for a
 * version already seen. The very first load just records a baseline (no popup),
 * so a fresh install isn't interrupted.
 */
export function WhatsNew() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState<string | null>(null);
  const [changelog, setChangelog] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    api
      .getCurrentRelease()
      .then((rel) => {
        if (cancelled || !rel.version) return;
        const seen = localStorage.getItem(SEEN_KEY);
        if (!seen) {
          // First run — set baseline silently so we only pop on real changes.
          localStorage.setItem(SEEN_KEY, rel.version);
          return;
        }
        if (seen !== rel.version) {
          setVersion(rel.version);
          setChangelog(rel.changelog);
          setOpen(true);
        }
      })
      .catch(() => {
        /* offline or no release notes — skip */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss() {
    if (version) localStorage.setItem(SEEN_KEY, version);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent className="max-w-lg text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-violet shadow-xl shadow-violet/30">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <DialogTitle className="mt-4 text-xl font-bold tracking-tight text-white">
          {t("whatsnew.title")}{version ? ` ${version}` : ""}
        </DialogTitle>
        <DialogDescription className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
          {t("whatsnew.subtitle")}
        </DialogDescription>

        {changelog && (
          <pre className="mt-4 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-line bg-white/[.02] p-4 text-left font-mono text-[12px] leading-relaxed text-slate-300">
            {changelog}
          </pre>
        )}

        <div className="mt-6">
          <Button className="w-full" onClick={dismiss}>
            {t("whatsnew.dismiss")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
