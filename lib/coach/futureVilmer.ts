import { getWeeklyReport } from "../analytics/weeklyReport";

export interface CoachMessage {
    headline: string;
    toneTag: "beast" | "balanced" | "soft" | "recovery";
    suggestedAction: string;
}

export async function getFutureVilmerMessage(userId: string, mode: string): Promise<CoachMessage> {
    const report = await getWeeklyReport(userId);

    // Simple rule-based engine (could be LLM-powered later)

    if (mode === "recovery") {
        return {
            headline: "Återhämtning bygger styrka. Vila idag, krossa imorgon.",
            toneTag: "recovery",
            suggestedAction: "Gör en lätt reflektion eller läs något inspirerande.",
        };
    }

    if (report.completionRate < 50 && report.totalSessions > 0) {
        return {
            headline: "Fokusera på kvalitet över kvantitet. Vi behöver avsluta det vi påbörjar.",
            toneTag: "balanced",
            suggestedAction: "Kör en kortare session (25 min) men sika på 100% completion.",
        };
    }

    if (report.totalHours > 10) {
        return {
            headline: "Du bygger momentum. Framtida Vilmer tackar dig.",
            toneTag: "beast",
            suggestedAction: "Håll tempot uppe. Dags för en djupdykning?",
        };
    }

    return {
        headline: "Varje steg räknas. Låt oss göra denna dag till en vinst.",
        toneTag: "balanced",
        suggestedAction: "Starta en 45 minuters session nu.",
    };
}
