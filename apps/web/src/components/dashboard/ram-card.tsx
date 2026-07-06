"use client";

import { Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n-context";

interface RamCardProps {
  percent: number;
}

export function RamCard({ percent }: RamCardProps) {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/20">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <CardTitle>{t("dashboard.memory")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={percent} className="mb-3" />
        <p className="text-sm font-medium text-slate-300">
          {t("dashboard.memory.used", { percent: String(percent) })}
        </p>
      </CardContent>
    </Card>
  );
}
