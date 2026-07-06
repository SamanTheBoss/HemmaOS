"use client";

import { Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RamCardProps {
  percent: number;
}

export function RamCard({ percent }: RamCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
            <Cpu className="h-5 w-5 text-orange-600" />
          </div>
          <CardTitle>Minne</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={percent} className="mb-3" />
        <p className="text-sm font-medium text-gray-700">
          {percent}% av RAM används
        </p>
      </CardContent>
    </Card>
  );
}
