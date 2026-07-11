"use client";

import { useCallback, useEffect, useState } from "react";
import { Wifi, RefreshCw, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

type Probe = "checking" | "up" | "down";

// Fetch the box's health endpoint on a given host. mode:"no-cors" means we can't
// read the response, but a resolved promise still proves the host answered on
// :4000 — which is exactly the reachability signal we want. A failed DNS lookup
// (mDNS not resolvable on this device) or refused connection rejects instead.
async function probe(host: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    await fetch(api.healthUrl(host), {
      mode: "no-cors",
      signal: controller.signal,
      cache: "no-store",
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function Dot({ state }: { state: Probe }) {
  const color =
    state === "up"
      ? "bg-emerald-400 shadow-emerald-400/50"
      : state === "down"
        ? "bg-red-400 shadow-red-400/50"
        : "bg-slate-500 animate-pulse";
  return <span className={`h-2.5 w-2.5 rounded-full shadow-[0_0_8px] ${color}`} />;
}

function AddressRow({
  label,
  value,
  state,
  labelText,
}: {
  label: string;
  value: string;
  state: Probe;
  labelText: (s: Probe) => string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white/[.02] p-3">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(value).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="flex items-center gap-1.5 font-mono text-[15px] text-white hover:text-sky-300"
        >
          {value}
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5 opacity-40" />
          )}
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Dot state={state} />
        <span
          className={`text-[12px] font-medium ${
            state === "up"
              ? "text-emerald-400"
              : state === "down"
                ? "text-red-400"
                : "text-slate-500"
          }`}
        >
          {labelText(state)}
        </span>
      </div>
    </div>
  );
}

export function NetworkStatus() {
  const { t } = useI18n();
  const [ip, setIp] = useState<string | null>(null);
  const [mdns, setMdns] = useState<string>("hemmaos.local");
  const [ipState, setIpState] = useState<Probe>("checking");
  const [mdnsState, setMdnsState] = useState<Probe>("checking");

  const runProbes = useCallback(async (ipAddr: string | null, mdnsHost: string) => {
    if (ipAddr) {
      setIpState("checking");
      probe(ipAddr).then((ok) => setIpState(ok ? "up" : "down"));
    }
    setMdnsState("checking");
    probe(mdnsHost).then((ok) => setMdnsState(ok ? "up" : "down"));
  }, []);

  const load = useCallback(async () => {
    try {
      const net = await api.getNetwork();
      setIp(net.ip);
      setMdns(net.mdns);
      runProbes(net.ip, net.mdns);
    } catch {
      setIpState("down");
      setMdnsState("down");
    }
  }, [runProbes]);

  useEffect(() => {
    load();
  }, [load]);

  const label = (s: Probe) =>
    s === "checking"
      ? t("settings.network.checking")
      : s === "up"
        ? t("settings.network.reachable")
        : t("settings.network.unreachable");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-black/20">
              <Wifi className="h-5 w-5 text-white" />
            </div>
            <CardTitle>{t("settings.network")}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => runProbes(ip, mdns)}
            className="shrink-0 text-slate-400"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-1.5">{t("settings.network.recheck")}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {ip && (
          <AddressRow
            label={t("settings.network.ip")}
            value={ip}
            state={ipState}
            labelText={label}
          />
        )}
        <AddressRow
          label={t("settings.network.mdns")}
          value={mdns}
          state={mdnsState}
          labelText={label}
        />
        <p className="pt-1 text-[12px] text-slate-500">
          {t("settings.network.hint")}
        </p>
      </CardContent>
    </Card>
  );
}
