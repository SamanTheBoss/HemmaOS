"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Server, Globe, Clock, Lock, ChevronRight, Check } from "lucide-react";

const TIMEZONES = [
  "Europe/Stockholm",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Helsinki",
  "Europe/Oslo",
  "Europe/Copenhagen",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "UTC",
];

export default function SetupPage() {
  const { setup } = useAuth();
  const { t, setLocale, locale } = useI18n();
  const [step, setStep] = useState(0);
  const [systemName, setSystemName] = useState("");
  const [language, setLanguage] = useState<"sv" | "en">(locale);
  const [timezone, setTimezone] = useState("Europe/Stockholm");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (password !== confirmPassword) {
      setError(t("auth.setup.password.mismatch"));
      return;
    }
    if (password.length < 4) {
      setError(language === "sv" ? "Lösenordet måste vara minst 4 tecken" : "Password must be at least 4 characters");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await setup({
        password,
        systemName: systemName || "Home_OS",
        locale: language,
        timezone,
      });
      setLocale(language);
    } catch {
      setError(t("common.error"));
      setSubmitting(false);
    }
  }

  const steps = [
    {
      icon: Server,
      title: t("auth.setup.name"),
      content: (
        <div className="space-y-3">
          <Label htmlFor="systemName">{t("auth.setup.name")}</Label>
          <Input
            id="systemName"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            placeholder={t("auth.setup.name.placeholder")}
            autoFocus
          />
        </div>
      ),
      canAdvance: true, // optional field
    },
    {
      icon: Globe,
      title: t("auth.setup.language"),
      content: (
        <div className="space-y-3">
          <Label>{t("auth.setup.language")}</Label>
          <Select
            value={language}
            onValueChange={(v) => setLanguage(v as "sv" | "en")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sv">Svenska</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
      canAdvance: true,
    },
    {
      icon: Clock,
      title: t("auth.setup.timezone"),
      content: (
        <div className="space-y-3">
          <Label>{t("auth.setup.timezone")}</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
      canAdvance: true,
    },
    {
      icon: Lock,
      title: t("auth.setup.password"),
      content: (
        <div className="space-y-3">
          <div>
            <Label htmlFor="password">{t("auth.setup.password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">
              {t("auth.setup.password.confirm")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      ),
      canAdvance: password.length >= 4,
    },
  ];

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;
  const isLast = step === steps.length - 1;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <Server className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("auth.setup.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("auth.setup.subtitle")}
          </p>
        </div>

        {/* Step indicators */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? "w-8 bg-blue-600"
                  : i < step
                    ? "w-2 bg-blue-400"
                    : "w-2 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <StepIcon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentStep.title}
              </h2>
            </div>
            {currentStep.content}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(step - 1)}
            >
              {language === "sv" ? "Tillbaka" : "Back"}
            </Button>
          )}
          {isLast ? (
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!currentStep.canAdvance || submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {language === "sv" ? "Skapar..." : "Creating..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {t("auth.setup.action")}
                </span>
              )}
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={() => setStep(step + 1)}
              disabled={!currentStep.canAdvance}
            >
              <span className="flex items-center gap-2">
                {language === "sv" ? "Nästa" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
