"use client";

import {
  HardDrive,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  CloudUpload,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

interface WidgetRowProps {
  status: string;
  disk: { total: string; used: string; percent: number };
  ram: { percent: number };
  backup: { status: string };
}

function Widget({
  icon: Icon,
  value,
  label,
  tone = "text-slate-300",
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  tone?: string;
}) {
  return (
    <div className="glass flex min-w-[110px] flex-1 flex-col items-center gap-1.5 rounded-2xl border border-line p-4 shadow-lg shadow-black/20">
      <Icon className={`h-5 w-5 ${tone}`} />
      <span className="text-[17px] font-bold leading-none text-white">
        {value}
      </span>
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
  );
}

export function WidgetRow({ status, disk, ram, backup }: WidgetRowProps) {
  const { t } = useI18n();
  const healthy = status === "HEALTHY";
  const diskTight = disk.percent >= 85;
  const backupOk = backup.status === "OK";

  return (
    <div className="flex w-full max-w-2xl flex-wrap justify-center gap-3">
      <Widget
        icon={healthy ? ShieldCheck : AlertTriangle}
        tone={healthy ? "text-emerald-400" : "text-amber-400"}
        value={healthy ? "OK" : "!"}
        label="System"
      />
      <Widget
        icon={HardDrive}
        tone={diskTight ? "text-amber-400" : "text-sky-400"}
        value={`${disk.used}/${disk.total}`}
        label={t("dashboard.storage")}
      />
      <Widget
        icon={Cpu}
        tone="text-orange-400"
        value={`${ram.percent}%`}
        label={t("dashboard.memory")}
      />
      <Widget
        icon={CloudUpload}
        tone={backupOk ? "text-emerald-400" : "text-slate-400"}
        value={backupOk ? "✓" : "—"}
        label={t("dashboard.backup")}
      />
    </div>
  );
}
