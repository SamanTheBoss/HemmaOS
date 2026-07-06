"use client";

import { HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StorageCardProps {
  total: string;
  used: string;
  percent: number;
}

function estimateYears(percentUsed: number): string {
  if (percentUsed <= 0) return "mycket lång tid";
  const yearsLeft = Math.round((100 - percentUsed) / percentUsed * 1);
  if (yearsLeft >= 10) return "över 10 år";
  if (yearsLeft <= 0) return "lite";
  return `ca ${yearsLeft} år`;
}

export function StorageCard({ total, used, percent }: StorageCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-blue-500/20">
            <HardDrive className="h-5 w-5 text-white" />
          </div>
          <CardTitle>Lagring</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={percent} className="mb-3" />
        <p className="text-sm font-medium text-slate-300">
          {used} av {total} använt
        </p>
        <p className="text-xs text-slate-500 mt-1">
          ~ Utrymme kvar för {estimateYears(percent)} familjebilder
        </p>
      </CardContent>
    </Card>
  );
}
