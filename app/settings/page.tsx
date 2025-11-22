"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { Settings as SettingsIcon, User, Zap, Brain, Bell, Database, Download, Shield } from "lucide-react";
import { getRulesConfig, updateRulesConfig } from "@/app/actions/settings";

export default function SettingsPage() {
  const [name, setName] = useState("Vilmer");
  const [email, setEmail] = useState("vilmer@example.com");
  const [timezone, setTimezone] = useState("Europe/Stockholm");
  const [defaultEnergy, setDefaultEnergy] = useState(7);
  const [defaultSleep, setDefaultSleep] = useState(7.5);
  const [aiModel, setAiModel] = useState<"gemini" | "gpt4">("gemini");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState("09:00");

  // Reptilhjärnan Config
  const [maxBeastDays, setMaxBeastDays] = useState(3);
  const [softWeekInterval, setSoftWeekInterval] = useState(6);
  const [isLoadingRules, setIsLoadingRules] = useState(true);

  useEffect(() => {
    async function loadRules() {
      try {
        const config = await getRulesConfig();
        if (config) {
          setMaxBeastDays(config.max_beast_days);
          setSoftWeekInterval(config.soft_week_interval);
        }
      } catch (e) {
        console.error("Failed to load rules", e);
      } finally {
        setIsLoadingRules(false);
      }
    }
    loadRules();
  }, []);

  const handleSaveRules = async () => {
    const res = await updateRulesConfig({
      max_beast_days: maxBeastDays,
      soft_week_interval: softWeekInterval
    });
    if (res.success) {
      alert("Reptilhjärnan config saved!");
    } else {
      alert("Failed to save: " + res.error);
    }
  };

  const handleSaveProfile = () => {
    console.log("Saving profile...");
  };

  const handleExportData = async () => {
    try {
      const { exportUserData } = await import("@/app/actions/database");
      const result = await exportUserData("mock-user-id"); // TODO: Use real ID

      if (result.success && result.data) {
        // Create JSON blob and download
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `study-os-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleResetProgress = () => {
    if (confirm("Är du säker? Detta kommer radera all din progress.")) {
      console.log("Resetting progress...");
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl pb-20">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inställningar</h1>
            <p className="text-muted-foreground">Anpassa din Study OS-upplevelse.</p>
          </div>
        </div>

        {/* Reptilhjärnan Config (New) */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/10 p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield className="w-24 h-24 text-cyan-500" />
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <Shield className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-cyan-100">Reptilhjärnan Config (Safety Rules)</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-200">Max Beast Days (Consecutive)</label>
              <p className="text-xs text-cyan-400/60">How many days of high intensity before forced recovery?</p>
              <input
                type="number"
                min="1"
                max="7"
                value={maxBeastDays}
                onChange={(e) => setMaxBeastDays(parseInt(e.target.value))}
                className="w-full rounded-md border border-cyan-500/30 bg-black/40 px-3 py-2 text-sm text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-200">Soft Week Interval</label>
              <p className="text-xs text-cyan-400/60">Every Nth week will be a "Soft Week".</p>
              <input
                type="number"
                min="2"
                max="12"
                value={softWeekInterval}
                onChange={(e) => setSoftWeekInterval(parseInt(e.target.value))}
                className="w-full rounded-md border border-cyan-500/30 bg-black/40 px-3 py-2 text-sm text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              />
            </div>
          </div>

          <button
            onClick={handleSaveRules}
            disabled={isLoadingRules}
            className="relative z-10 inline-flex items-center justify-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-cyan-500 disabled:opacity-50"
          >
            {isLoadingRules ? "Loading..." : "Save Safety Rules"}
          </button>
        </div>

        {/* Profile Section */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Profil</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Namn</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tidszon</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Europe/Stockholm">Europe/Stockholm</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Spara profil
          </button>
        </div>

        {/* Energy Defaults */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Energi-standardvärden</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Standard energinivå</label>
                <span className="text-sm font-mono font-bold">{defaultEnergy}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={defaultEnergy}
                onChange={(e) => setDefaultEnergy(parseInt(e.target.value))}
                className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Standard sömn (timmar)</label>
                <span className="text-sm font-mono font-bold">{defaultSleep}h</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={defaultSleep}
                onChange={(e) => setDefaultSleep(parseFloat(e.target.value))}
                className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">AI-modell</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAiModel("gemini")}
              className={`rounded-lg border p-4 text-center transition-all ${aiModel === "gemini"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card/50 hover:bg-accent"
                }`}
            >
              <div className="font-semibold">Gemini 1.5 Pro</div>
              <div className="text-xs text-muted-foreground mt-1">Google AI</div>
            </button>

            <button
              onClick={() => setAiModel("gpt4")}
              className={`rounded-lg border p-4 text-center transition-all ${aiModel === "gpt4"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card/50 hover:bg-accent"
                }`}
            >
              <div className="font-semibold">GPT-4</div>
              <div className="text-xs text-muted-foreground mt-1">OpenAI</div>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Notifikationer</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Aktivera dagliga påminnelser</label>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? "bg-primary" : "bg-secondary"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>

            {notificationsEnabled && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Påminnelsetid</label>
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Datahantering</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Download className="h-4 w-4" />
              Exportera data (JSON)
            </button>

            <button
              onClick={handleResetProgress}
              className="inline-flex items-center gap-2 rounded-md border border-destructive text-destructive px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              Återställ all progress
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Exportera dina data för backup eller analys. Du kan alltid återställa progress om du vill börja om från början.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
