"use client";

import { RemoteAccess } from "@/components/settings/remote-access";
import { SupportToggle } from "@/components/settings/support-toggle";
import { LogViewer } from "@/components/settings/log-viewer";
import { BackupManager } from "@/components/settings/backup-manager";
import { RebootButton } from "@/components/settings/reboot-button";
import { SystemSettings } from "@/components/settings/system-settings";
import { UpdateManager } from "@/components/settings/update-manager";
import { BoxBackup } from "@/components/settings/box-backup";
import { DiskHealth } from "@/components/settings/disk-health";
import { useI18n } from "@/lib/i18n-context";

export default function InstallningarPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">{t("settings.title")}</h1>
      <p className="text-sm text-slate-400">{t("settings.subtitle")}</p>

      <RemoteAccess />
      <SupportToggle />
      <BackupManager />
      <LogViewer />
      <UpdateManager />
      <DiskHealth />
      <BoxBackup />
      <SystemSettings />

      <div className="pt-4">
        <RebootButton />
      </div>
    </div>
  );
}
