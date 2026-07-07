"use client";

import { useState } from "react";
import { Trash2, ExternalLink, Download, Globe, Code2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type AppDefinition } from "@/lib/app-definitions";
import { useI18n } from "@/lib/i18n-context";

interface AppDetailProps {
  app: AppDefinition;
  installed: boolean;
  port?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Start the install wizard (parent opens the stepper). */
  onInstall: () => void;
  onUninstall: () => void;
}

export function AppDetail({
  app,
  installed,
  port,
  open,
  onOpenChange,
  onInstall,
  onUninstall,
}: AppDetailProps) {
  const { t, locale } = useI18n();
  const Icon = app.icon;
  const sv = locale === "sv";
  const openPort = port ?? app.port;
  const category = CATEGORIES.find((c) => c.id === app.category);

  function openApp() {
    if (typeof window === "undefined" || !openPort) return;
    window.open(
      `http://${window.location.hostname}:${openPort}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
        {/* Hero */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${app.bgColor}`}
          >
            <Icon className={`h-8 w-8 ${app.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-xl font-bold tracking-tight text-white">
              {app.name}
            </DialogTitle>
            <p className="mt-0.5 text-sm text-slate-400">
              {sv ? app.description : app.descriptionEn}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {category && (
                <span className="rounded-full border border-line bg-white/[.03] px-2.5 py-1 text-[11px] font-medium text-slate-400">
                  {sv ? category.label.sv : category.label.en}
                </span>
              )}
              <span
                className={
                  installed
                    ? "rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300"
                    : "rounded-full border border-line bg-white/[.03] px-2.5 py-1 text-[11px] font-medium text-slate-500"
                }
              >
                {installed ? t("apps.installed") : t("apps.notInstalled")}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          {installed ? (
            <>
              <Button variant="success" className="flex-1" onClick={openApp}>
                {t("apps.open")}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-red-400 hover:text-red-300 hover:border-red-400/30"
                onClick={onUninstall}
                title={t("apps.uninstall")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button className="flex-1" onClick={onInstall}>
              <Download className="h-4 w-4" />
              {t("apps.install")} · {app.downloadSize}
            </Button>
          )}
        </div>

        {/* Screenshots — gallery images, or themed placeholders until bundled */}
        <div className="mt-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            {t("apps.screenshots")}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {(app.gallery.length > 0
              ? app.gallery
              : [null, null, null]
            ).map((src, i) => (
              <Screenshot
                key={i}
                src={src}
                alt={`${app.name} ${i + 1}`}
                placeholderClass={app.bgColor}
              />
            ))}
          </div>
        </div>

        {/* About */}
        <div className="mt-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            {t("apps.about")}
          </p>
          <p className="text-[13.5px] leading-relaxed text-slate-300">
            {sv ? app.longDescription.sv : app.longDescription.en}
          </p>
        </div>

        {/* Meta */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-[13px]">
          {app.replaces && (
            <Meta label={t("apps.replaces")}>
              {sv ? app.replaces.sv : app.replaces.en}
            </Meta>
          )}
          <Meta label={t("apps.developer")}>{app.developer}</Meta>
          <Meta label={t("apps.size")}>{app.downloadSize}</Meta>
          {app.mobileApp && <Meta label="App">{app.mobileApp}</Meta>}
        </div>

        {/* Links */}
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={app.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn inline-flex items-center gap-2 rounded-xl border border-line bg-white/[.03] px-4 py-2 text-[13px] font-medium text-slate-300 hover:bg-white/[.06]"
          >
            <Globe className="h-4 w-4" />
            {t("apps.website")}
          </a>
          <a
            href={app.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn inline-flex items-center gap-2 rounded-xl border border-line bg-white/[.03] px-4 py-2 text-[13px] font-medium text-slate-300 hover:bg-white/[.06]"
          >
            <Code2 className="h-4 w-4" />
            {t("apps.source")}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// A screenshot that degrades to a themed gradient placeholder if the image is
// missing (assets aren't bundled yet) or fails to load.
function Screenshot({
  src,
  alt,
  placeholderClass,
}: {
  src: string | null;
  alt: string;
  placeholderClass: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`h-40 w-64 shrink-0 rounded-xl border border-line ${placeholderClass} opacity-30`}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-40 shrink-0 rounded-xl border border-line object-cover"
    />
  );
}

function Meta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-white/[.02] p-3">
      <p className="text-[11px] uppercase tracking-wider text-slate-600">
        {label}
      </p>
      <p className="mt-0.5 font-medium text-slate-200">{children}</p>
    </div>
  );
}
