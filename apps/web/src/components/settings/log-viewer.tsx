"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal, Play, Square } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

interface Container {
  id: string;
  name: string;
  state: string;
}

export function LogViewer() {
  const { t } = useI18n();
  const [containers, setContainers] = useState<Container[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [lines, setLines] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .getContainers()
      .then((data) => setContainers(data.containers))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  function startStream() {
    if (!selected) return;
    setLines([]);
    setStreaming(true);

    const es = new EventSource(api.streamLogsUrl(selected));
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.line) {
          setLines((prev) => [...prev.slice(-500), data.line]);
        }
        if (data.error) {
          setLines((prev) => [...prev, `ERROR: ${data.error}`]);
          stopStream();
        }
      } catch {
        if (event.data !== "connected") {
          setLines((prev) => [...prev.slice(-500), event.data]);
        }
      }
    };

    es.onerror = () => {
      stopStream();
    };
  }

  function stopStream() {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setStreaming(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-line">
            <Terminal className="h-5 w-5 text-emerald-400" />
          </div>
          <CardTitle>{t("settings.logs")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t("settings.logs.select")} />
            </SelectTrigger>
            <SelectContent>
              {containers.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${c.state === "running" ? "bg-emerald-400" : "bg-slate-600"}`}
                    />
                    {c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {streaming ? (
            <Button variant="outline" size="icon" onClick={stopStream}>
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={startStream}
              disabled={!selected}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div
          ref={scrollRef}
          className="terminal h-64 overflow-auto rounded-xl border border-violet/25 p-3 font-mono text-xs text-emerald-300"
        >
          {lines.length === 0 ? (
            <p className="text-slate-500">
              {streaming
                ? t("settings.logs.waiting")
                : t("settings.logs.empty")}
            </p>
          ) : (
            lines.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap break-all">
                {line}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
