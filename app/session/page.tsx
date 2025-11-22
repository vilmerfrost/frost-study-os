"use client";

import AppShell from "@/components/AppShell";
import SessionPlayer from "@/components/SessionPlayer";
import AgentUplink from "@/components/AgentUplink";
import SessionQualityModal from "@/components/SessionQualityModal";
import { useState } from "react";
import { Play, RotateCcw, Brain } from "lucide-react";
import { generatePlan, type GeneratePlanInput } from "@/app/actions/generatePlan";

const USER_ID = "mock-user-id"; // TODO: Get from auth

export default function SessionPage() {
  const [energy, setEnergy] = useState(7);
  const [timeAvailable, setTimeAvailable] = useState(90);
  const [mode, setMode] = useState<"beast" | "balanced" | "recovery" | "soft">("balanced");

  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [agentLogs, setAgentLogs] = useState<any[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setAgentLogs([]);

    try {
      const input: GeneratePlanInput = {
        userId: USER_ID,
        energy,
        timeAvailable,
        mode,
      };

      const result = await generatePlan(input);

      setPlan(result);
      setAgentLogs(result.agentLogs);
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSessionComplete = () => {
    setIsSessionActive(false);
    setShowQualityModal(true);
  };

  const handleQualitySubmit = async (qualityData: any) => {
    // Save session to database
    // TODO: Implement session save
    console.log("Session quality:", qualityData);
    setShowQualityModal(false);
    setPlan(null);
  };

  const handleRegenerate = () => {
    setPlan(null);
    handleGeneratePlan();
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Control Room</h1>
            <p className="text-muted-foreground">Configure and launch your AI-powered study session.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
              <h2 className="font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                Session Parameters
              </h2>

              <div className="space-y-4">
                {/* Energy Level */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Energy Level</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={energy}
                      onChange={(e) => setEnergy(parseInt(e.target.value))}
                      className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                      disabled={isSessionActive}
                    />
                    <span className="w-8 text-center font-mono font-bold">{energy}</span>
                  </div>
                </div>

                {/* Time Available */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Available</label>
                  <select
                    value={timeAvailable}
                    onChange={(e) => setTimeAvailable(parseInt(e.target.value))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={isSessionActive}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </select>
                </div>

                {/* Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["balanced", "beast", "recovery", "soft"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m as any)}
                        disabled={isSessionActive}
                        className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors capitalize ${mode === m
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                          }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating || isSessionActive}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating Plan..." : "Generate Plan"}
              </button>
            </div>

            {/* Agent Uplink */}
            <AgentUplink
              status={isGenerating ? "generating" : plan ? "complete" : "idle"}
              logs={agentLogs}
            />
          </div>

          {/* Plan View / Session Player */}
          <div className="lg:col-span-2 space-y-6">
            {isSessionActive && plan ? (
              <SessionPlayer
                planId={plan.planId}
                blocks={plan.blocks}
                onComplete={handleSessionComplete}
              />
            ) : plan && !isSessionActive ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Mission Plan</h2>
                  <button
                    onClick={handleRegenerate}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Regenerate
                  </button>
                </div>

                <div className="space-y-4">
                  {plan.blocks.map((block: any, i: number) => (
                    <div key={i} className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {block.type}
                            </span>
                            <span className="text-xs text-muted-foreground">{block.duration} min</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{block.description}</p>
                          {block.tasks && block.tasks.length > 0 && (
                            <ul className="space-y-1 pl-4">
                              {block.tasks.map((task: string, j: number) => (
                                <li key={j} className="text-xs text-muted-foreground list-disc">
                                  {task}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setIsSessionActive(true)}
                    className="inline-flex items-center justify-center rounded-md bg-green-600 px-8 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-green-700"
                  >
                    <Play className="mr-2 h-4 w-4" /> Start Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 text-center p-8">
                <div className="rounded-full bg-muted/20 p-4 mb-4">
                  <Brain className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Ready to plan</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                  Configure your session parameters on the left and let the AI agents build your optimal study plan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quality Modal */}
      {showQualityModal && (
        <SessionQualityModal
          isOpen={showQualityModal}
          onSave={handleQualitySubmit}
          onClose={() => setShowQualityModal(false)}
        />
      )}
    </AppShell>
  );
}
