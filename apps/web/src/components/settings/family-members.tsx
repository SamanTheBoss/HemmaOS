"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, UserPlus, Shield, Baby } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

type Member = { id: string; name: string; role: "parent" | "child" };

export function FamilyMembers() {
  const { t } = useI18n();
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"parent" | "child">("child");
  const [busy, setBusy] = useState(false);

  function load() {
    api
      .listUsers()
      .then((r) => setMembers(r.users))
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!name.trim() || password.length < 4) return;
    setBusy(true);
    try {
      await api.addUser(name.trim(), password, role);
      setName("");
      setPassword("");
      setRole("child");
      load();
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    try {
      await api.deleteUser(id);
      load();
    } catch {
      // last parent can't be removed — backend guards this
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-purple-700 shadow-lg shadow-violet/25">
            <Users className="h-5 w-5 text-white" />
          </div>
          <CardTitle>{t("settings.family")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-400">{t("settings.family.desc")}</p>

        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-line bg-white/[.02] p-3"
            >
              <div className="flex items-center gap-2">
                {m.role === "parent" ? (
                  <Shield className="h-4 w-4 text-violet-300" />
                ) : (
                  <Baby className="h-4 w-4 text-sky-300" />
                )}
                <span className="text-sm font-medium text-slate-200">
                  {m.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {m.role === "parent"
                    ? t("settings.family.parent")
                    : t("settings.family.child")}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-300"
                onClick={() => remove(m.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add member */}
        <div className="rounded-xl border border-line bg-white/[.02] p-3 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder={t("settings.family.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Select
              value={role}
              onValueChange={(v) => setRole(v as "parent" | "child")}
            >
              <SelectTrigger className="w-32 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="child">
                  {t("settings.family.child")}
                </SelectItem>
                <SelectItem value="parent">
                  {t("settings.family.parent")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            type="password"
            placeholder={t("settings.family.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={add}
            disabled={busy || !name.trim() || password.length < 4}
          >
            <UserPlus className="h-4 w-4" />
            {t("settings.family.add")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
