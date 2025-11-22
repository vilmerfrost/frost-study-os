import AppShell from "@/components/AppShell";
import CoachMessageCard from "@/components/CoachMessageCard";
import ReflectionForm from "@/components/ReflectionForm";
import ModeSelector from "@/components/ModeSelector";
import FutureSelfCard from "@/components/FutureSelfCard";
import { generateCoachMessage } from "@/app/actions/generateCoachMessage";
import { Brain } from "lucide-react";

const USER_ID = "mock-user-id";

export default async function CoachPage() {
  // Fetch AI coach message
  const coachMessage = await generateCoachMessage(USER_ID, "balanced");

  const handleReflectionSubmit = async (data: any) => {
    "use server";
    // Save reflection to database
    console.log("Reflection submitted:", data);
  };

  const handleModeChange = async (mode: any) => {
    "use server";
    // Save mode to user_settings
    console.log("Mode changed to:", mode);
  };

  // Mock weekly mission
  const weeklyMission = "Denna vecka: Slutför linjär algebra-modulen och börja bygga ditt första neurala nätverk från scratch. Fokusera på verklig förståelse, inte bara implementation.";

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Future Vilmer's Desk</h1>
            <p className="text-muted-foreground">Din personliga AI-coach och mentor.</p>
          </div>
        </div>

        {/* Main Coach Message */}
        <CoachMessageCard
          headline={coachMessage.headline}
          message={coachMessage.message}
          toneTag={coachMessage.toneTag}
          suggestedAction={coachMessage.suggestedAction}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Reflection Forms */}
          <div className="space-y-6">
            <ReflectionForm
              type="morning"
              userId={USER_ID}
              onSubmit={handleReflectionSubmit}
            />
            <ReflectionForm
              type="evening"
              userId={USER_ID}
              onSubmit={handleReflectionSubmit}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <FutureSelfCard weeklyMission={weeklyMission} />
            <ModeSelector
              currentMode="balanced"
              onChange={handleModeChange}
            />

            {/* Reflection Prompts */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="font-semibold">Reflektionsfrågor</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Vad lärde jag mig idag som jag inte visste igår?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Vilka koncept känns fortfarande oklara?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Hur kan jag applicera det här i praktiken?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Vad ska jag fokusera på nästa session?</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
